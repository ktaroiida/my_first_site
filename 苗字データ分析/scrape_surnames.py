import csv
import json
import time
import os
import urllib.request
import urllib.parse
import ssl

# Configuration
INPUT_CSV = "2026_1_苗字分析 - シート2 (1).csv"
OUTPUT_CSV = "surname_distribution.csv"
ENDPOINT = "https://www.dmuchgis.com/myojimap/php/getData.php"
INTERVAL = 10  # Seconds between requests
SAVE_INTERVAL = 10  # Surnames before printing status
LIMIT = 1000  # Process up to this many surnames from the input list

PREF_MAP = {
    "hokkaido": "北海道", "aomori": "青森県", "iwate": "岩手県", "miyagi": "宮城県",
    "akita": "秋田県", "yamagata": "山形県", "fukushima": "福島県", "ibaraki": "茨城県",
    "tochigi": "栃木県", "gumma": "群馬県", "saitama": "埼玉県", "chiba": "千葉県",
    "tokyo": "東京都", "kanagawa": "神奈川県", "niigata": "新潟県", "toyama": "富山県",
    "ishikawa": "石川県", "fukui": "福井県", "yamanashi": "山梨県", "nagano": "長野県",
    "gifu": "岐阜県", "shizuoka": "静岡県", "aichi": "愛知県", "mie": "三重県",
    "shiga": "滋賀県", "kyoto": "京都府", "osaka": "大阪府", "hyogo": "兵庫県",
    "nara": "奈良県", "wakayama": "和歌山県", "tottori": "鳥取県", "shimane": "島根県",
    "okayama": "岡山県", "hiroshima": "広島県", "yamaguchi": "山口県", "tokushima": "徳島県",
    "kagawa": "香川県", "ehime": "愛媛県", "kochi": "高知県", "fukuoka": "福岡県",
    "saga": "佐賀県", "nagasaki": "長崎県", "kumamoto": "熊本県", "oita": "大分県",
    "miyazaki": "宮崎県", "kagoshima": "鹿児島県", "okinawa": "沖縄県"
}

def get_processed_surnames():
    if not os.path.exists(OUTPUT_CSV):
        return set()
    processed = set()
    with open(OUTPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            processed.add(row["名字"])
    return processed

def scrape():
    # Load surnames
    surnames = []
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            if row:
                surnames.append(row[0].strip())

    # Limit to top N
    surnames = surnames[:LIMIT]

    processed = get_processed_surnames()
    remaining = [s for s in surnames if s not in processed]
    
    print(f"Total: {len(surnames)}, Processed: {len(processed)}, Remaining: {len(remaining)}")

    if not remaining:
        print("All surnames processed.")
        return

    # Prepare for requests
    ssl_context = ssl._create_unverified_context()
    
    file_exists = os.path.exists(OUTPUT_CSV)
    with open(OUTPUT_CSV, "a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["名字", "都道府県", "件数", "特化係数"])

        for i, surname in enumerate(remaining):
            print(f"[{i+1}/{len(remaining)}] Fetching data for: {surname}")
            
            try:
                data = urllib.parse.urlencode({"myoji": surname}).encode()
                req = urllib.request.Request(ENDPOINT, data=data)
                with urllib.request.urlopen(req, context=ssl_context) as response:
                    res_body = response.read().decode("utf-8")
                    json_data = json.loads(res_body)
                    
                    num_data = json_data.get("num", {})
                    index_data = json_data.get("index", {})
                    
                    for romaji, kanji in PREF_MAP.items():
                        count = num_data.get(romaji)
                        coeff = index_data.get(romaji)
                        if count is not None and coeff is not None:
                            writer.writerow([surname, kanji, count, coeff])
                
                f.flush()  # Ensure data is written
                
                if i < len(remaining) - 1:
                    print(f"Waiting {INTERVAL} seconds...")
                    time.sleep(INTERVAL)
                    
            except Exception as e:
                print(f"Error fetching {surname}: {e}")
                # Optional: log to file or retry
                time.sleep(INTERVAL) # Still sleep to be safe

if __name__ == "__main__":
    scrape()
