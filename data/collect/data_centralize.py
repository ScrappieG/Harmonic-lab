import csv
import json
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# ----------------------------
# CONFIG
# ----------------------------
LINKS_CSV_PATH = "./interview_links.csv"
OUTPUT_CSV_PATH = "./all_interviews_export_cleaner.csv"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}
REQUEST_TIMEOUT_S = 30
SLEEP_BETWEEN_REQUESTS_S = 0.6

SCORE_COLS = [
    "score_excited_to_work_with_them",
    "score_questions_quality",
    "score_interviewer_helpfulness",
    "score_problem_solving",
    "score_technical_skills",
    "score_communication",
]

LANG_ALIASES = {
    "c-plus-plus": "C++",
    "cplusplus": "C++",
    "cpp": "C++",
    "python": "Python",
    "java": "Java",
    "go": "Go",
    "golang": "Go",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "csharp": "C#",
    "c#": "C#",
    "ruby": "Ruby",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "rust": "Rust",
    "php": "PHP",
}

# ----------------------------
# BASIC HELPERS
# ----------------------------
def clean_text(s: str) -> str:
    return " ".join((s or "").split()).strip()

def normalize(s: str) -> str:
    return clean_text(s).lower()

def safe_id_from_url(url: str) -> str:
    slug = urlparse(url).path.rstrip("/").split("/")[-1]
    slug = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", slug)
    return slug or "interview"

def fetch_soup(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT_S)
    resp.raise_for_status()
    return BeautifulSoup(resp.content, "html.parser")

def find_section_by_h3(soup: BeautifulSoup, title_contains: str):
    h3 = soup.find("h3", string=lambda x: x and title_contains.lower() in x.lower())
    return h3.find_parent("div") if h3 else None

# ----------------------------
# LINK PIPELINE (your approach + stricter)
# ----------------------------
def pull_mock_links():
    out = []
    with open(LINKS_CSV_PATH, newline="", encoding="utf-8") as f:
        r = csv.reader(f)
        for row in r:
            if row and row[0]:
                out.append(row[0].strip())
    return out

def filter_links(urls):
    """
    Keep only actual interview pages: /mocks/<slug>
    Exclude /mocks directory + system-design + behavioral.
    """
    valid = set()
    for url in urls:
        if not url:
            continue
        if "mocks" not in url:
            continue
        if "system-design" in url or "behavioral" in url:
            continue

        p = urlparse(url)
        path = p.path.rstrip("/")
        if path == "/mocks":
            continue
        if not path.startswith("/mocks/"):
            continue
        if len(path.split("/")) < 3:
            continue

        valid.add(url)

    return sorted(valid)

# ----------------------------
# JSON-LD KEYWORDS (optional; inconsistent, so only used as helper)
# ----------------------------
def extract_jsonld_keywords(soup: BeautifulSoup):
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(script.get_text(strip=True))
            kws = data.get("keywords")
            if not kws:
                continue
            if isinstance(kws, str):
                return [k.strip() for k in kws.split(",") if k.strip()]
            if isinstance(kws, list):
                return [str(k).strip() for k in kws if str(k).strip()]
        except Exception:
            pass
    return []

# ----------------------------
# SLUG FALLBACK PARSING (very reliable)
# ----------------------------
def parse_slug(url: str):
    """
    Examples:
      airbnb-python-alien-dictionary
      faang-cplusplus-buildings-with-an-ocean-view

    Returns: company_guess, language_guess, topic_guess
    """
    slug = urlparse(url).path.rstrip("/").split("/")[-1]
    parts = slug.split("-")

    company_guess = ""
    language_guess = ""

    # company usually first token
    if parts:
        company_guess = parts[0].upper() if parts[0].lower() == "faang" else parts[0].title()

    # language usually second token (sometimes "cplusplu..." etc)
    if len(parts) >= 2:
        lang_token = parts[1].lower()
        language_guess = LANG_ALIASES.get(lang_token, "")

    # Sometimes language token is longer: cplusplus, c-plus-plus, etc.
    joined = "-".join(parts[1:3]).lower() if len(parts) >= 3 else ""
    if not language_guess and joined in LANG_ALIASES:
        language_guess = LANG_ALIASES[joined]

    # topic remainder (after company + language token)
    topic_start = 2
    if len(parts) >= 3 and "-".join(parts[1:3]).lower() in LANG_ALIASES:
        topic_start = 3

    topic_guess = " ".join([p for p in parts[topic_start:] if p]).strip()
    topic_guess = topic_guess.replace("  ", " ")

    return company_guess, language_guess, topic_guess

# ----------------------------
# SUMMARY EXTRACTION (label/value table style)
# ----------------------------
def extract_summary_kv(soup: BeautifulSoup):
    """
    In Interview Summary, labels are often <p>Label</p> followed by <p>Value</p>.
    We'll build a dict for robust lookup.
    """
    summary = find_section_by_h3(soup, "Interview Summary")
    if not summary:
        return {}

    ps = summary.find_all("p")
    kv = {}

    for i in range(len(ps) - 1):
        label = clean_text(ps[i].get_text())
        value = clean_text(ps[i + 1].get_text())
        # Heuristic: labels are short
        if 1 <= len(label) <= 40 and len(value) > 0:
            # avoid overwriting with garbage
            key = normalize(label)
            if key not in kv:
                kv[key] = value

    return kv

def extract_interview_title(soup: BeautifulSoup):
    h1 = soup.find("h1")
    if h1:
        return clean_text(h1.get_text())
    if soup.title and soup.title.string:
        t = clean_text(soup.title.string)
        t = re.sub(r"\s*\|\s*interviewing\.io.*$", "", t, flags=re.IGNORECASE).strip()
        return t
    return ""

def extract_problem_name(summary_kv: dict):
    """
    What you WANT as "interview question name" is the actual problem title,
    which on these pages is usually in Summary under 'Problem type'.
    """
    for key in ("problem type", "problem", "question", "question name"):
        if key in summary_kv:
            return summary_kv[key]
    return ""

def extract_prompt(soup: BeautifulSoup, summary_kv: dict):
    # prefer explicit value if it exists
    for key in ("interview question", "prompt"):
        if key in summary_kv and len(summary_kv[key]) > 20:
            return summary_kv[key]

    summary = find_section_by_h3(soup, "Interview Summary")
    if not summary:
        return ""
    prompt_p = summary.find("p", class_=lambda c: c and "whitespace-pre-wrap" in c)
    return clean_text(prompt_p.get_text()) if prompt_p else ""

def extract_language(summary_kv: dict, interview_title: str, url: str):
    # 1) summary label
    for k in ("language", "programming language"):
        if k in summary_kv:
            val = summary_kv[k]
            # normalize common forms
            v = val.lower().replace("c plus plus", "c++").replace("c#", "c#")
            for tok, pretty in LANG_ALIASES.items():
                if tok in v or pretty.lower() in v:
                    return pretty
            return val

    # 2) from interview title
    for pretty in set(LANG_ALIASES.values()):
        if interview_title.lower().startswith(pretty.lower()):
            return pretty
        if f"{pretty.lower()} interview" in interview_title.lower():
            return pretty

    # 3) from slug
    _, lang_guess, _ = parse_slug(url)
    return lang_guess

def extract_company(summary_kv: dict, keywords: list, url: str):
    # 1) summary label (if present)
    for k in ("company", "interviewer company"):
        if k in summary_kv:
            return summary_kv[k]

    # 2) from keywords (first title-cased thing that isn't a topic/language)
    for k in keywords:
        if not k:
            continue
        kl = k.lower()
        if kl in LANG_ALIASES or kl in {"faang", "interview"}:
            continue
        if k[0].isupper() and len(k) <= 30:
            return k

    # 3) from slug
    company_guess, _, _ = parse_slug(url)
    return company_guess

def extract_topics(keywords: list, url: str):
    # Prefer keywords if they exist (excluding language/company-like tokens)
    if keywords:
        topics = []
        for k in keywords:
            kl = k.lower()
            if kl in {"faang", "interview"}:
                continue
            if kl in LANG_ALIASES:
                continue
            topics.append(k)
        # de-dupe preserve order
        seen = set()
        out = []
        for t in topics:
            if t not in seen:
                out.append(t)
                seen.add(t)
        if out:
            return "; ".join(out)

    # Fallback: use slug remainder
    _, _, topic_guess = parse_slug(url)
    return topic_guess

# ----------------------------
# FEEDBACK / SCORES EXTRACTION (robust)
# ----------------------------
def extract_outcome_and_scores(soup: BeautifulSoup):
    feedback = find_section_by_h3(soup, "Interview Feedback")
    scores = {c: "" for c in SCORE_COLS}
    outcome = ""

    if not feedback:
        return outcome, scores

    # Find all "row" divs and parse left/right
    rows = feedback.find_all("div", class_=lambda c: c and "flex w-full py-4" in c)
    for r in rows:
        divs = r.find_all("div")
        if len(divs) < 2:
            continue

        label = normalize(divs[0].get_text())
        value = clean_text(divs[-1].get_text())

        if "advance this person to the next round" in label:
            outcome = value

        if "/4" in value:
            if "excited" in label:
                scores["score_excited_to_work_with_them"] = value
            elif "good were the questions" in label:
                scores["score_questions_quality"] = value
            elif "helpful was your interviewer" in label:
                scores["score_interviewer_helpfulness"] = value
            elif "problem solving" in label:
                scores["score_problem_solving"] = value
            elif "technical skills" in label:
                scores["score_technical_skills"] = value
            elif "communication" in label:
                scores["score_communication"] = value

    return outcome, scores

# ----------------------------
# TRANSCRIPT (one line, cleaned)
# ----------------------------
def extract_transcript_one_line(soup: BeautifulSoup):
    transcript_sec = find_section_by_h3(soup, "Interview Transcript")
    if not transcript_sec:
        return ""

    chunks = []
    blocks = transcript_sec.find_all("div", class_=lambda c: c and "whitespace-pre-wrap" in c)

    for b in blocks:
        speaker_el = b.find("span", class_=lambda c: c and "Bold" in c)
        text_el = b.find("span", class_=lambda c: c and "italic" in c)

        speaker = clean_text(speaker_el.get_text()) if speaker_el else ""
        text = clean_text(text_el.get_text()) if text_el else clean_text(b.get_text())

        speaker = speaker.rstrip(":").strip()
        text = text.lstrip(":").strip()  # fixes the ": :" artifact

        if speaker and text:
            chunks.append(f"{speaker}: {text}")
        elif text:
            chunks.append(text)

    transcript = " ".join(chunks)
    transcript = " ".join(transcript.split())  # collapse any remaining whitespace/newlines
    return transcript

# ----------------------------
# MAIN
# ----------------------------
def main():
    links = filter_links(pull_mock_links())
    if not links:
        raise RuntimeError("No valid interview links found after filtering.")

    rows_out = []
    for idx, url in enumerate(links, start=1):
        print(f"[{idx}/{len(links)}] {url}")
        try:
            soup = fetch_soup(url)

            summary_kv = extract_summary_kv(soup)
            keywords = extract_jsonld_keywords(soup)

            interview_title = extract_interview_title(soup)
            problem_name = extract_problem_name(summary_kv)  # the real "question name"
            prompt = extract_prompt(soup, summary_kv)

            language = extract_language(summary_kv, interview_title, url)
            company = extract_company(summary_kv, keywords, url)
            topics = extract_topics(keywords, url)

            outcome, scores = extract_outcome_and_scores(soup)
            transcript = extract_transcript_one_line(soup)

            row = {
                "interview_id": safe_id_from_url(url),
                "source_url": url,
                "interview_title": interview_title,
                "problem_name": problem_name,
                "language": language,
                "company": company,
                "topics": topics,
                "advance_to_next_round": outcome,
                "interview_prompt": prompt,
                "transcript": transcript,
            }
            row.update(scores)
            rows_out.append(row)

            time.sleep(SLEEP_BETWEEN_REQUESTS_S)

        except requests.RequestException as e:
            print(f"Request error: {e}")
        except Exception as e:
            print(f"Parse error: {e}")

    fieldnames = [
        "interview_id",
        "source_url",
        "interview_title",
        "problem_name",
        "language",
        "company",
        "topics",
        "advance_to_next_round",
        "score_excited_to_work_with_them",
        "score_questions_quality",
        "score_interviewer_helpfulness",
        "score_problem_solving",
        "score_technical_skills",
        "score_communication",
        "interview_prompt",
        "transcript",
    ]

    with open(OUTPUT_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows_out:
            for c in fieldnames:
                r.setdefault(c, "")
            w.writerow(r)

    print(f"\nWrote {len(rows_out)} interviews to: {OUTPUT_CSV_PATH}")

if __name__ == "__main__":
    main()
