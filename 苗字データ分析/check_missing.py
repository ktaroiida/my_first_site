import os

txt_path = "/Users/kentaroiida/Desktop/20260119test/RANKING_1_1000.txt"
csv_path = "/Users/kentaroiida/Desktop/20260119test/surname_distribution.csv"

with open(txt_path, 'r', encoding='utf-8') as f:
    target_names = set(line.strip() for line in f if line.strip())

with open(csv_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()[1:] # skip header
    csv_names = set(line.split(',')[0] for line in lines)

missing = target_names - csv_names
print(f"Target count: {len(target_names)}")
print(f"CSV count: {len(csv_names)}")
print(f"Missing: {missing}")
