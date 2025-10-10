import os
import re
import time
import requests
import mysql.connector

# === CONFIG ===
DB_CONFIG = {
    "host": "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    "user": "o7U4yeVhdmfFtSms.root",
    "password": "YWDabE8HHHbNsspW",
    "database": "quiz_app"
}

HANDOUT_DIR = "handouts"
VUHANPUR_URL = "https://vukhanpur.com/VUHandouts.php"

os.makedirs(HANDOUT_DIR, exist_ok=True)

# === HELPERS ===
def get_vu_handouts():
    """Scrape VU Khanpur page for available handout PDF URLs"""
    print("🌐 Fetching VU Khanpur handout list...")
    res = requests.get(VUHANPUR_URL, timeout=20)
    soup = BeautifulSoup(res.text, "html.parser")
    pdf_links = {}

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf"):
            filename = os.path.basename(href)
            clean_name = re.sub(r"[_\-]+", " ", os.path.splitext(filename)[0]).lower()
            if not href.startswith("http"):
                href = "https://vukhanpur.com/" + href.lstrip("/")
            pdf_links[clean_name] = href

    print(f"✅ Found {len(pdf_links)} PDFs on VU Khanpur.")
    return pdf_links


def normalize(text):
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def download_file(url, filename):
    """Download and save a PDF file"""
    try:
        with requests.get(url, timeout=60, stream=True) as r:
            r.raise_for_status()
            with open(filename, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
        return True
    except Exception as e:
        print(f"❌ Download failed {url}: {e}")
        return False


def main():
    # Connect with reconnect enabled
    conn = mysql.connector.connect(**DB_CONFIG, connection_timeout=60)
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, title, slug FROM courses WHERE handout_pdf IS NULL OR handout_pdf = ''")
    courses = cursor.fetchall()
    print(f"⚙️ Found {len(courses)} missing handouts.")

    vu_handouts = get_vu_handouts()

    for c in courses:
        cid, title, slug = c["id"], c["title"], c["slug"]
        normalized = normalize(title)
        filename = f"{slug}.pdf"
        filepath = os.path.join(HANDOUT_DIR, filename)

        print(f"\n📘 Processing: {title}")

        # Match by similarity
        match_url = None
        for name, link in vu_handouts.items():
            if normalized in name or name in normalized:
                match_url = link
                break

        if not match_url:
            print(f"❌ No match found for {title}")
            continue

        # Download
        print(f"⬇️ Downloading from: {match_url}")
        if download_file(match_url, filepath):
            try:
                cursor.execute(
                    "UPDATE courses SET handout_pdf=%s, handout_original_filename=%s WHERE id=%s",
                    (filename, os.path.basename(match_url), cid)
                )
                conn.commit()
                print(f"✅ Saved to DB: {filename}")
            except mysql.connector.errors.OperationalError:
                print("⚠️ Lost DB connection, reconnecting...")
                conn.reconnect(attempts=3, delay=2)
        else:
            print(f"⚠️ Skipped {title} — failed download")

        time.sleep(1)  # polite delay

    cursor.close()
    conn.close()
    print("\n🎉 Finished downloading available handouts.")


if __name__ == "__main__":
    main()