#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import http.cookiejar
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, unquote, urljoin

import requests
from bs4 import BeautifulSoup

DEFAULT_BASE = "https://darkpeers.org"
DEFAULT_HOST = "maghuro"
DEFAULT_COOKIE = Path.home() / ".config" / "dpforum" / "cookies.txt"
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/153.0.0.0 Safari/537.36"
)


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def username_from_cell(cell) -> str:
    link = cell.select_one('a[href*="/users/"]') if cell else None
    if link:
        href = link.get("href") or ""
        match = re.search(r"/users/([^/?#]+)", href)
        if match:
            return unquote(match.group(1))
    return clean_text(cell.get_text(" ", strip=True) if cell else "")


def parse_bon(value: str) -> int | None:
    text = clean_text(value)
    match = re.search(r"[0-9][0-9.,\s]*", text)
    if not match:
        return None
    digits = re.sub(r"[^0-9]", "", match.group(0))
    return int(digits) if digits else None


def make_session(cookie_path: Path) -> requests.Session:
    if not cookie_path.exists():
        raise RuntimeError(f"Cookie jar not found: {cookie_path}")

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": UA,
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "*/*",
        }
    )

    jar = http.cookiejar.MozillaCookieJar(str(cookie_path))
    jar.load(ignore_discard=True, ignore_expires=True)
    session.cookies = jar
    return session


def get(session: requests.Session, base: str, path: str, **kwargs) -> requests.Response:
    url = path if path.startswith("http://") or path.startswith("https://") else urljoin(base + "/", path.lstrip("/"))
    response = session.get(url, timeout=15, allow_redirects=True, **kwargs)
    response.raise_for_status()
    return response


def page_meta(response: requests.Response) -> dict:
    body = response.content
    return {
        "url": response.url,
        "status": response.status_code,
        "date_header": response.headers.get("Date"),
        "bytes": len(body),
        "sha256": hashlib.sha256(body).hexdigest(),
    }


def parse_gift_history(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    rows = []
    for row in soup.select("table.data-table tbody tr"):
        cells = row.find_all("td")
        if len(cells) < 5:
            continue

        amount = parse_bon(cells[2].get_text(" ", strip=True))
        if amount is None or amount <= 0:
            continue

        time_el = cells[4].find("time")
        timestamp = time_el.get("datetime", "") if time_el else ""
        note = clean_text(cells[3].get_text(" ", strip=True))
        if note.lower() == "no note":
            note = ""

        rows.append(
            {
                "sender": username_from_cell(cells[0]),
                "recipient": username_from_cell(cells[1]),
                "amount": amount,
                "message": note,
                "timestamp": timestamp,
            }
        )
    return rows


def parse_notifications(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    rows = []
    for row in soup.select("table.data-table tbody tr"):
        cells = row.find_all("td")
        if len(cells) < 3:
            continue

        time_el = cells[2].find("time")
        rows.append(
            {
                "title": clean_text(cells[0].get_text(" ", strip=True)),
                "body": clean_text(cells[1].get_text(" ", strip=True)),
                "timestamp": time_el.get("datetime", "") if time_el else "",
            }
        )
    return rows


def collect_paged_html(session, base, path, parser, max_pages: int) -> dict:
    all_rows = []
    pages = []
    stopped_on_empty = False

    for page in range(1, max_pages + 1):
        sep = "&" if "?" in path else "?"
        response = get(
            session,
            base,
            f"{path}{sep}page={page}&_audit={int(datetime.now().timestamp() * 1000)}",
            headers={"Cache-Control": "no-cache"},
        )
        rows = parser(response.text)
        pages.append({**page_meta(response), "page": page, "rows": len(rows)})
        if not rows:
            stopped_on_empty = True
            break
        all_rows.extend(rows)

    return {
        "rows": all_rows,
        "pages": pages,
        "complete_until_empty_page": stopped_on_empty,
        "max_pages": max_pages,
    }


def parse_pool(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    text = clean_text(soup.get_text(" ", strip=True))

    def counter(label: str) -> int | None:
        match = re.search(re.escape(label) + r"\s*([0-9][0-9.,\s]*)", text, re.I)
        return parse_bon(match.group(1)) if match else None

    return {
        "total_contributions": counter("Total contributions:"),
        "your_contribution": counter("Your contribution:"),
    }


def collect_json_endpoint(session, base, path) -> dict:
    response = get(
        session,
        base,
        path,
        headers={"Accept": "application/json", "Cache-Control": "no-cache"},
    )
    try:
        payload = response.json()
    except Exception as exc:
        raise RuntimeError(f"Expected JSON from {path}, got {response.headers.get('Content-Type')}: {exc}") from exc
    return {"meta": page_meta(response), "payload": payload}


def normalize_chat_messages(payload) -> list[dict]:
    data = payload.get("data", []) if isinstance(payload, dict) else []
    out = []
    for item in data if isinstance(data, list) else []:
        user = item.get("user") or {}
        bot = item.get("bot") or {}
        out.append(
            {
                "id": item.get("id"),
                "created_at": item.get("created_at"),
                "user_id": item.get("user_id") or user.get("id"),
                "username": user.get("username"),
                "bot_id": item.get("bot_id") or bot.get("id"),
                "bot_name": bot.get("name"),
                "is_systembot": bot.get("is_systembot"),
                "message": item.get("originalMessage") or item.get("message"),
                "raw": item,
            }
        )
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect read-only DarkPeers BONanza audit evidence.")
    parser.add_argument("--base", default=DEFAULT_BASE)
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--cookie", type=Path, default=DEFAULT_COOKIE)
    parser.add_argument("--pages", type=int, default=20)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    base = args.base.rstrip("/")
    host = args.host.strip()
    if not host:
        raise RuntimeError("Host cannot be empty.")

    output = args.out
    if output is None:
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        output = Path.cwd() / f"bonanza-audit-evidence-{stamp}.json"

    session = make_session(args.cookie)

    report = {
        "schema": 1,
        "generated_at_utc": now_utc(),
        "base": base,
        "host": host,
        "cookie_path": str(args.cookie),
        "notes": [
            "Read-only collector. No POST, PUT, PATCH or DELETE requests are made.",
            "Cookies are never included in this report.",
            "UNIT3D room chat API is a recent rolling window and has no history pagination in the upstream controller.",
        ],
        "gift_history": {},
        "notifications": {},
        "bon_pool": {},
        "chat": {},
    }

    gift_path = f"/users/{quote(host, safe='')}/gifts"
    notification_path = f"/users/{requests.utils.quote(host, safe='')}/notifications"

    report["gift_history"] = collect_paged_html(
        session, base, gift_path, parse_gift_history, args.pages
    )
    report["notifications"] = collect_paged_html(
        session, base, notification_path, parse_notifications, args.pages
    )

    pool_response = get(
        session,
        base,
        f"/bon-pool?_audit={int(datetime.now().timestamp() * 1000)}",
        headers={"Cache-Control": "no-cache"},
    )
    report["bon_pool"] = {
        "meta": page_meta(pool_response),
        **parse_pool(pool_response.text),
    }

    config = collect_json_endpoint(session, base, "/api/chat/config")
    rooms = collect_json_endpoint(session, base, "/api/chat/rooms")
    report["chat"]["config"] = config
    report["chat"]["rooms"] = rooms

    room_ids = {1, 2}
    room_payload = rooms.get("payload", {})
    room_data = room_payload.get("data", []) if isinstance(room_payload, dict) else []
    for room in room_data if isinstance(room_data, list) else []:
        rid = room.get("id")
        if isinstance(rid, int) and rid in {1, 2}:
            room_ids.add(rid)

    report["chat"]["rooms_collected"] = {}
    for room_id in sorted(room_ids):
        endpoint = collect_json_endpoint(session, base, f"/api/chat/messages/{room_id}")
        messages = normalize_chat_messages(endpoint["payload"])
        report["chat"]["rooms_collected"][str(room_id)] = {
            "meta": endpoint["meta"],
            "message_count": len(messages),
            "oldest_id": min((m["id"] for m in messages if isinstance(m.get("id"), int)), default=None),
            "newest_id": max((m["id"] for m in messages if isinstance(m.get("id"), int)), default=None),
            "messages": messages,
        }

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    gifts = report["gift_history"]["rows"]
    received = [x for x in gifts if str(x.get("recipient", "")).casefold() == host.casefold()]
    sent = [x for x in gifts if str(x.get("sender", "")).casefold() == host.casefold()]

    print("=" * 72)
    print("BONanza audit evidence collected")
    print("=" * 72)
    print(f"Output             : {output}")
    print(f"Gift history rows  : {len(gifts)}")
    print(f"Received by host   : {len(received)}")
    print(f"Sent by host       : {len(sent)}")
    print(f"BON Pool total     : {report['bon_pool'].get('total_contributions')}")
    print(f"BON Pool by host   : {report['bon_pool'].get('your_contribution')}")
    for room_id, data in report["chat"]["rooms_collected"].items():
        print(
            f"Chat room {room_id:<3}     : {data['message_count']} messages "
            f"(IDs {data['oldest_id']}..{data['newest_id']})"
        )
    print()
    print("Attach the generated JSON to the ChatGPT conversation for reconciliation.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
