import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import japanize_matplotlib
from adjustText import adjust_text

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = ['Hiragino Sans', 'AppleGothic', 'sans-serif']

# Region Mapping
regions = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}
pref_to_region = {p: r for r, prefs in regions.items() for p in prefs}

def get_year_data(year):
    base_path = '/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/'
    grad_file = f'{base_path}ey0289_{year}.xlsx'
    adv_file = f'{base_path}ey0292_{year}.xlsx'
    
    xl_grad = pd.ExcelFile(grad_file)
    
    def sum_graduates(sheets):
        total_series = None
        for s in sheets:
            df = pd.read_excel(xl_grad, sheet_name=s, header=None)
            vals = pd.to_numeric(df.iloc[6:53, 1], errors='coerce').fillna(0)
            if total_series is None:
                total_series = vals
                prefs = df.iloc[6:53, 0].values
            else:
                total_series += vals
        return prefs, total_series

    prefs, male_grads = sum_graduates(['ey0289-4', 'ey0289-5', 'ey0289-6'])
    _, female_grads = sum_graduates(['ey0289-7', 'ey0289-8', 'ey0289-9'])
    
    df_adv = pd.read_excel(adv_file, sheet_name='ey0292-1', header=None)
    male_adv = pd.to_numeric(df_adv.iloc[6:53, 5], errors='coerce').fillna(0)
    female_adv = pd.to_numeric(df_adv.iloc[6:53, 6], errors='coerce').fillna(0)
    
    male_rate = (male_adv.values / male_grads.values * 100).reshape(-1)
    female_rate = (female_adv.values / female_grads.values * 100).reshape(-1)
    
    data = pd.DataFrame({
        'Prefecture': prefs,
        'Male_Rate': male_rate,
        'Female_Rate': female_rate
    }).fillna(0)
    
    data['Region'] = data['Prefecture'].map(pref_to_region)
    data['Gap'] = data['Female_Rate'] - data['Male_Rate']
    return data

def plot_scatter(data, year):
    plt.figure(figsize=(14, 12))
    all_rates = pd.concat([data['Male_Rate'], data['Female_Rate']])
    min_v, max_v = all_rates.min() - 2, all_rates.max() + 2
    plt.plot([min_v, max_v], [min_v, max_v], color='gray', linestyle='--', alpha=0.5)
    
    sns.scatterplot(data=data, x='Male_Rate', y='Female_Rate', hue='Region', s=120, alpha=0.9, edgecolor='w')
    
    texts = []
    for i in range(len(data)):
        texts.append(plt.text(data['Male_Rate'].iloc[i], data['Female_Rate'].iloc[i], data['Prefecture'].iloc[i], fontsize=10))
    
    adjust_text(texts, arrowprops=dict(arrowstyle='-', color='gray', alpha=0.5, lw=0.8), ax=plt.gca())
    
    plt.title(f'都道府県別大学進学率の男女比較（{year}年度）', fontsize=16, pad=20)
    plt.xlabel('男子進学率（%）', fontsize=13)
    plt.ylabel('女子進学率（%）', fontsize=13)
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left', title='地域')
    plt.gca().set_aspect('equal', adjustable='box')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/university_scatter_{year}.png', dpi=300, bbox_inches='tight')
    plt.close()

def plot_gap_bar(data, year):
    plt.figure(figsize=(14, 7))
    data_sorted = data.sort_values('Gap', ascending=False)
    palette = ['#ff9999' if x > 0 else '#66b3ff' for x in data_sorted['Gap']]
    sns.barplot(data=data_sorted, x='Prefecture', y='Gap', palette=palette, hue='Prefecture', legend=False)
    plt.xticks(rotation=90)
    plt.title(f'大学進学率の男女差（{year}年度）', fontsize=14)
    plt.ylabel('女子進学率 − 男子進学率（ポイント）')
    plt.axhline(0, color='black', linewidth=1.5)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/university_gap_bar_{year}.png', dpi=300, bbox_inches='tight')
    plt.close()

# Generate for both years
for y in [2024, 2025]:
    print(f"Generating university-only charts for {y}...")
    df_year = get_year_data(y)
    plot_scatter(df_year, y)
    plot_gap_bar(df_year, y)

print("University charts regenerated with concise titles.")
