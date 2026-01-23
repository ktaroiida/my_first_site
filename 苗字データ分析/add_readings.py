import csv
from pykakasi import kakasi

def add_readings():
    input_file = 'surname_distribution.csv'
    output_file = 'surname_distribution_with_readings.csv'
    
    # Initialize pykakasi
    kks = kakasi()
    
    # Load original data
    rows = []
    unique_surnames = set()
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)
            unique_surnames.add(row['名字'])
    
    # Generate reading mapping
    reading_map = {}
    for name in unique_surnames:
        result = kks.convert(name)
        reading = "".join([item['hira'] for item in result])
        reading_map[name] = reading
    
    # Write new CSV with reading column
    new_fieldnames = ['名字', '読み'] + [f for f in fieldnames if f != '名字']
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=new_fieldnames)
        writer.writeheader()
        
        for row in rows:
            new_row = row.copy()
            new_row['読み'] = reading_map.get(row['名字'], '')
            writer.writerow(new_row)
            
    print(f"Finished! Processed {len(unique_surnames)} unique surnames.")
    print(f"Output saved to: {output_file}")

if __name__ == "__main__":
    add_readings()
