from pathlib import Path

from bs4 import BeautifulSoup

from job_scraper import JobPosting, parse_anapec, parse_emploi_public, render_html_table

FIXTURES = Path(__file__).parent / "fixtures"


def _load_fixture(name: str) -> BeautifulSoup:
    html = (FIXTURES / name).read_text(encoding="utf-8")
    return BeautifulSoup(html, "html.parser")


def test_parse_emploi_public_table_rows():
    soup = _load_fixture("emploi_public_sample.html")
    jobs = parse_emploi_public(soup, "https://www.emploi-public.ma/")

    assert len(jobs) == 2
    assert jobs[0].title == "Ingénieur réseau"
    assert jobs[0].organization == "Ministère A"
    assert jobs[0].location == "Rabat"
    assert jobs[0].deadline.year == 2024
    assert jobs[1].published.year == 2024


def test_parse_anapec_cards_and_rows():
    soup = _load_fixture("anapec_sample.html")
    jobs = parse_anapec(soup, "https://www.anapec.org/")

    assert {job.title for job in jobs} == {"Développeur Python", "Chef de projet"}
    developer = next(job for job in jobs if job.title == "Développeur Python")
    assert developer.organization == "Entreprise Tech"
    assert developer.location == "Marrakech"

    # Ensure fallback table parsing still works
    project_manager = next(job for job in jobs if job.title == "Chef de projet")
    assert project_manager.organization == "Société Conseil"


def test_render_html_contains_rows():
    jobs = [
        JobPosting(
            title="Test Offre",
            organization="Org X",
            location="Rabat",
            apply_url="https://example.com",
            source="emploi-public.ma",
        )
    ]
    html = render_html_table(jobs)
    assert "Test Offre" in html
    assert "Postuler" in html
    assert "<table" in html
