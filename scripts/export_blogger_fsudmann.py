#!/usr/bin/env python3
"""
Export Blogger (custom domain) posts from the Atom feed into Markdown + local images.

Reads: https://www.fsudmann.com/feeds/posts/default (paginates via rel="next" when present).
Writes: content/posts/<slug>/index.md and content/posts/<slug>/images/*
"""

from __future__ import annotations

import hashlib
import re
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

import html2text
import requests
from bs4 import BeautifulSoup

FEED_START = "https://www.fsudmann.com/feeds/posts/default?max-results=500"
REQUEST_DELAY_SEC = 0.35
USER_AGENT = "fsudmann-blog-export/1.0 (+https://www.fsudmann.com)"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "openSearch": "http://a9.com/-/spec/opensearchrss/1.0/",
}


def _local_slug_from_url(post_url: str) -> str:
    path = urlparse(post_url).path.strip("/")
    last = path.split("/")[-1] if path else "post"
    if last.endswith(".html"):
        last = last[: -len(".html")]
    slug = re.sub(r"[^a-zA-Z0-9._-]+", "-", last).strip("-").lower()
    return slug or "post"


def _abs_url(url: str) -> str:
    if url.startswith("//"):
        return "https:" + url
    return url


def _guess_ext(content_type: str | None, url: str) -> str:
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        if ct == "image/jpeg":
            return ".jpg"
        if ct == "image/png":
            return ".png"
        if ct == "image/gif":
            return ".gif"
        if ct == "image/webp":
            return ".webp"
    path = urlparse(url).path
    if "." in path:
        ext = path.rsplit(".", 1)[-1].lower()
        if ext in ("jpg", "jpeg", "png", "gif", "webp"):
            return "." + ("jpg" if ext == "jpeg" else ext)
    return ""


def fetch_feed(url: str) -> ET.Element:
    r = requests.get(
        url,
        headers={"User-Agent": USER_AGENT},
        timeout=60,
    )
    r.raise_for_status()
    return ET.fromstring(r.content)


def find_next_feed_url(root: ET.Element) -> str | None:
    for link in root.findall("atom:link", NS):
        if link.get("rel") == "next" and link.get("href"):
            return link.get("href")
    return None


def parse_entries(root: ET.Element) -> list[dict]:
    out: list[dict] = []
    for entry in root.findall("atom:entry", NS):
        title_el = entry.find("atom:title", NS)
        title = (title_el.text or "").strip() if title_el is not None else ""

        published_el = entry.find("atom:published", NS)
        published = (published_el.text or "").strip() if published_el is not None else ""

        post_url = ""
        for link in entry.findall("atom:link", NS):
            if link.get("rel") == "alternate" and link.get("type", "").startswith("text/html"):
                post_url = link.get("href") or ""
                break
        if not post_url:
            for link in entry.findall("atom:link", NS):
                if link.get("rel") == "alternate":
                    post_url = link.get("href") or ""
                    break

        content_el = entry.find("atom:content", NS)
        html_body = content_el.text if content_el is not None and content_el.text else ""

        categories: list[str] = []
        for cat in entry.findall("atom:category", NS):
            term = cat.get("term")
            if term:
                categories.append(term)

        out.append(
            {
                "title": title,
                "published": published,
                "url": post_url,
                "html": html_body,
                "categories": categories,
            }
        )
    return out


def collect_image_urls(soup: BeautifulSoup) -> list[str]:
    urls: list[str] = []
    for img in soup.find_all("img"):
        src = img.get("src") or ""
        if src:
            urls.append(_abs_url(src.strip()))
    for a in soup.find_all("a"):
        href = a.get("href") or ""
        if "blogger.googleusercontent.com" in href and re.search(
            r"\.(jpg|jpeg|png|gif|webp)(\?|$)", href, re.I
        ):
            urls.append(_abs_url(href.strip()))
    # de-dupe preserving order
    seen: set[str] = set()
    ordered: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


def download_images(
    session: requests.Session,
    urls: list[str],
    images_dir: Path,
) -> dict[str, str]:
    """Return map original_url -> relative path like images/foo.webp"""
    mapping: dict[str, str] = {}
    for i, url in enumerate(urls, start=1):
        time.sleep(REQUEST_DELAY_SEC)
        resp = session.get(url, timeout=120, allow_redirects=True)
        resp.raise_for_status()
        ext = _guess_ext(resp.headers.get("Content-Type"), url)
        if not ext:
            ext = ".bin"
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:10]
        fname = f"img-{i:03d}-{digest}{ext}"
        rel = f"images/{fname}"
        images_dir.mkdir(parents=True, exist_ok=True)
        (images_dir / fname).write_bytes(resp.content)
        mapping[url] = rel
    return mapping


def rewrite_image_urls(soup: BeautifulSoup, mapping: dict[str, str]) -> None:
    for img in soup.find_all("img"):
        src = img.get("src")
        if not src:
            continue
        absu = _abs_url(src.strip())
        if absu in mapping:
            img["src"] = mapping[absu]
    for a in soup.find_all("a"):
        href = a.get("href")
        if not href:
            continue
        absu = _abs_url(href.strip())
        if absu in mapping:
            a["href"] = mapping[absu]


def html_to_markdown(html: str) -> str:
    h = html2text.HTML2Text()
    h.body_width = 0
    h.unicode_snob = True
    h.ignore_links = False
    h.ignore_images = False
    return h.handle(html).strip() + "\n"


def yaml_escape(s: str) -> str:
    if any(c in s for c in ('"', ":", "\n", "\\")):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return s


def write_post(
    repo_root: Path,
    post: dict,
    session: requests.Session,
) -> None:
    post_url = post["url"]
    slug = _local_slug_from_url(post_url)
    post_dir = repo_root / "content" / "posts" / slug
    images_dir = post_dir / "images"
    post_dir.mkdir(parents=True, exist_ok=True)

    soup = BeautifulSoup(post["html"], "html.parser")
    img_urls = collect_image_urls(soup)
    mapping: dict[str, str] = {}
    if img_urls:
        mapping = download_images(session, img_urls, images_dir)
        rewrite_image_urls(soup, mapping)

    md_body = html_to_markdown(str(soup))

    lines = [
        "---",
        f"title: {yaml_escape(post['title'])}",
        f"date: {post['published']}",
        f"source: {post['url']}",
    ]
    if post["categories"]:
        lines.append("categories:")
        for c in post["categories"]:
            lines.append(f"  - {yaml_escape(c)}")
    lines.append("---")
    lines.append("")
    lines.append(md_body)

    (post_dir / "index.md").write_text("".join(l + "\n" for l in lines), encoding="utf-8")


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    all_entries: list[dict] = []
    feed_url: str | None = FEED_START
    while feed_url:
        root = fetch_feed(feed_url)
        all_entries.extend(parse_entries(root))
        feed_url = find_next_feed_url(root)
        if feed_url:
            time.sleep(REQUEST_DELAY_SEC)

    # Newest-first in feed typically; keep stable order as published in feed
    for post in all_entries:
        if not post["html"].strip():
            print(f"skip (no content): {post['title']!r}", file=sys.stderr)
            continue
        print(f"export: {post['title']}", file=sys.stderr)
        write_post(repo_root, post, session)
        time.sleep(REQUEST_DELAY_SEC)

    print(f"done: {len(all_entries)} posts", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
