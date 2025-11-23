"""Simple scraper for official Moroccan job postings to HTML.

The script currently targets emploi-public.ma (public service offers) and
anapec.org (employment agency) with defensive parsing. It outputs an HTML table
that aggregates the offers, including links for applying.

Usage example:
    python job_scraper.py --output jobs.html --limit 50
"""
from __future__ import annotations

import argparse
import datetime as _dt
import html
import logging
from dataclasses import dataclass
from typing import Callable, Iterable, List, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)


def _clean(text: str) -> str:
    return " ".join(text.split())


def _parse_date(value: str) -> Optional[_dt.date]:
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return _dt.datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


@dataclass
class JobPosting:
    title: str
    organization: str
    location: str
    apply_url: str
    source: str
    published: Optional[_dt.date] = None
    deadline: Optional[_dt.date] = None


HtmlBuilder = Callable[[Iterable[JobPosting]], str]


class ScraperError(RuntimeError):
    """Raised when a scraping failure occurs."""


def render_html_table(postings: Iterable[JobPosting]) -> str:
    rows: List[JobPosting] = list(postings)
    body_rows = []
    for job in rows:
        body_rows.append(
            "<tr>"
            f"<td>{html.escape(job.title)}</td>"
            f"<td>{html.escape(job.organization)}</td>"
            f"<td>{html.escape(job.location)}</td>"
            f"<td>{html.escape(job.source)}</td>"
            f"<td>{html.escape(job.published.isoformat()) if job.published else ''}</td>"
            f"<td>{html.escape(job.deadline.isoformat()) if job.deadline else ''}</td>"
            f"<td><a href='{html.escape(job.apply_url)}' target='_blank' rel='noopener'>Postuler</a></td>"
            "</tr>"
        )

    style_block = """
    <style>
    body { font-family: Arial, sans-serif; margin: 1.5rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #004d7a; color: #fff; text-align: left; }
    tr:nth-child(even) { background: #f5f7fa; }
    </style>
    """

    html_doc = (
        "<html><head><meta charset='utf-8'>" + style_block + "</head><body>"
        f"<h1>Offres d'emploi (sources officielles Maroc)</h1>"
        f"<p>Total des offres agrégées: {len(rows)}</p>"
        "<table>"
        "<thead><tr>"
        "<th>Titre</th><th>Organisation</th><th>Lieu</th>"
        "<th>Source</th><th>Publication</th><th>Deadline</th><th>Lien</th>"
        "</tr></thead><tbody>"
        + "".join(body_rows)
        + "</tbody></table></body></html>"
    )
    return html_doc


def _fetch(session: requests.Session, url: str, timeout: float) -> BeautifulSoup:
    logging.info("Fetching %s", url)
    response = session.get(url, timeout=timeout)
    if not response.ok:
        raise ScraperError(f"Failed to fetch {url}: HTTP {response.status_code}")
    return BeautifulSoup(response.text, "html.parser")


def parse_emploi_public(soup: BeautifulSoup, base_url: str, limit: Optional[int] = None) -> List[JobPosting]:
    jobs: List[JobPosting] = []
    seen_links = set()

    # Primary pattern: table rows (common on emploi-public.ma)
    for row in soup.select("table tbody tr"):
        cells = row.find_all(["td", "th"])
        if not cells:
            continue
        anchor = row.find("a")
        title = _clean(anchor.get_text()) if anchor else _clean(cells[0].get_text())
        apply_url = urljoin(base_url, anchor.get("href")) if anchor and anchor.get("href") else base_url
        if apply_url in seen_links:
            continue
        seen_links.add(apply_url)
        organization = _clean(cells[1].get_text()) if len(cells) > 1 else ""
        location = _clean(cells[2].get_text()) if len(cells) > 2 else ""
        published = _parse_date(cells[3].get_text()) if len(cells) > 3 else None
        deadline = _parse_date(cells[4].get_text()) if len(cells) > 4 else None

        jobs.append(
            JobPosting(
                title=title,
                organization=organization,
                location=location,
                apply_url=apply_url,
                source="emploi-public.ma",
                published=published,
                deadline=deadline,
            )
        )
        if limit and len(jobs) >= limit:
            return jobs

    # Fallback pattern: cards or list items
    for card in soup.select("article, div.job-item, li"):
        anchor = card.find("a")
        if not anchor:
            continue
        apply_url = urljoin(base_url, anchor.get("href")) if anchor.get("href") else base_url
        if apply_url in seen_links:
            continue
        seen_links.add(apply_url)
        title = _clean(anchor.get_text())
        meta = card.find_all("p")
        organization = _clean(meta[0].get_text()) if meta else ""
        location = _clean(meta[1].get_text()) if len(meta) > 1 else ""
        jobs.append(
            JobPosting(
                title=title,
                organization=organization,
                location=location,
                apply_url=apply_url,
                source="emploi-public.ma",
            )
        )
        if limit and len(jobs) >= limit:
            break

    return jobs


def scrape_emploi_public(session: requests.Session, timeout: float, limit: Optional[int]) -> List[JobPosting]:
    url = "https://www.emploi-public.ma/index.php/fr/offres-emploi"
    soup = _fetch(session, url, timeout)
    return parse_emploi_public(soup, url, limit)


def parse_anapec(soup: BeautifulSoup, base_url: str, limit: Optional[int] = None) -> List[JobPosting]:
    jobs: List[JobPosting] = []

    for card in soup.select("div.offre, div.job, div.card"):
        anchor = card.find("a")
        if not anchor:
            continue
        title = _clean(anchor.get_text())
        apply_url = urljoin(base_url, anchor.get("href")) if anchor.get("href") else base_url
        organization = _clean(card.select_one(".entreprise, .company").get_text()) if card.select_one(".entreprise, .company") else ""
        location = _clean(card.select_one(".lieu, .location").get_text()) if card.select_one(".lieu, .location") else ""
        published_text = card.select_one(".publie, .date")
        deadline_text = card.select_one(".deadline, .date-limit")
        published = _parse_date(published_text.get_text()) if published_text else None
        deadline = _parse_date(deadline_text.get_text()) if deadline_text else None

        jobs.append(
            JobPosting(
                title=title,
                organization=organization,
                location=location,
                apply_url=apply_url,
                source="anapec.org",
                published=published,
                deadline=deadline,
            )
        )
        if limit and len(jobs) >= limit:
            return jobs

    # Fallback for list rows
    for row in soup.select("table tbody tr"):
        cells = row.find_all("td")
        if not cells:
            continue
        anchor = row.find("a")
        title = _clean(anchor.get_text()) if anchor else _clean(cells[0].get_text())
        apply_url = urljoin(base_url, anchor.get("href")) if anchor and anchor.get("href") else base_url
        organization = _clean(cells[1].get_text()) if len(cells) > 1 else ""
        location = _clean(cells[2].get_text()) if len(cells) > 2 else ""
        published = _parse_date(cells[3].get_text()) if len(cells) > 3 else None

        jobs.append(
            JobPosting(
                title=title,
                organization=organization,
                location=location,
                apply_url=apply_url,
                source="anapec.org",
                published=published,
            )
        )
        if limit and len(jobs) >= limit:
            break

    return jobs


def scrape_anapec(session: requests.Session, timeout: float, limit: Optional[int]) -> List[JobPosting]:
    url = "https://www.anapec.org/sigec-app-rv/offre/list"
    soup = _fetch(session, url, timeout)
    return parse_anapec(soup, url, limit)


def gather_postings(sources: Iterable[str], limit: Optional[int], timeout: float) -> List[JobPosting]:
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    jobs: List[JobPosting] = []
    for source in sources:
        try:
            if source == "emploi-public":
                jobs.extend(scrape_emploi_public(session, timeout, limit))
            elif source == "anapec":
                jobs.extend(scrape_anapec(session, timeout, limit))
            else:
                raise ValueError(f"Unsupported source '{source}'")
        except Exception as exc:  # noqa: BLE001 - top-level user feedback
            logging.error("%s scraping failed: %s", source, exc)

    return jobs


def main() -> None:
    parser = argparse.ArgumentParser(description="Récupère les offres d'emploi officielles marocaines et génère un tableau HTML.")
    parser.add_argument("--output", "-o", help="Chemin du fichier HTML de sortie (stdout par défaut)")
    parser.add_argument("--limit", type=int, default=None, help="Nombre maximum d'offres par source")
    parser.add_argument(
        "--sources",
        nargs="+",
        choices=["emploi-public", "anapec"],
        default=["emploi-public", "anapec"],
        help="Liste des sources à interroger",
    )
    parser.add_argument("--timeout", type=float, default=15, help="Délai réseau en secondes")

    args = parser.parse_args()

    postings = gather_postings(args.sources, args.limit, args.timeout)
    html_content = render_html_table(postings)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(html_content)
        logging.info("Fichier HTML généré: %s", args.output)
    else:
        print(html_content)


if __name__ == "__main__":
    main()
