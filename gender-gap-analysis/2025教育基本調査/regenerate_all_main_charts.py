import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import japanize_matplotlib
from adjustText import adjust_text
import numpy as np

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = ['Hiragino Sans', 'AppleGothic', 'sans-serif']

# Region Mapping
regions = {
    '北海道': ['北海道'], '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}
pref_to_region = {p: r for r, prefs in regions.items() for p in prefs}

def get_year_data_univ(year):
    base_path = '/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/data/'
    xl_grad = pd.ExcelFile(f'{base_path}ey0289_{year}.xlsx')
    
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
    
    df_adv = pd.read_excel(f'{base_path}ey0292_{year}.xlsx', sheet_name='ey0292-1', header=None)
    male_adv = pd.to_numeric(df_adv.iloc[6:53, 5], errors='coerce').fillna(0).values
    female_adv = pd.to_numeric(df_adv.iloc[6:53, 6], errors='coerce').fillna(0).values
    
    data = pd.DataFrame({
        'Prefecture': prefs,
        'Male_Rate': (male_adv / male_grads.values * 100).reshape(-1),
        'Female_Rate': (female_adv / female_grads.values * 100).reshape(-1)
    }).fillna(0)
    data['Region'] = data['Prefecture'].map(pref_to_region)
    data['Gap'] = data['Female_Rate'] - data['Male_Rate']
    return data

def get_year_data_with_jc(year):
    base_path = '/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/data/'
    xl_grad = pd.ExcelFile(f'{base_path}ey0289_{year}.xlsx')
    
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
    
    df_adv = pd.read_excel(f'{base_path}ey0292_{year}.xlsx', sheet_name='ey0292-1', header=None)
    male_adv = pd.to_numeric(df_adv.iloc[6:53, 5], errors='coerce').fillna(0).values + \
               pd.to_numeric(df_adv.iloc[6:53, 8], errors='coerce').fillna(0).values
    female_adv = pd.to_numeric(df_adv.iloc[6:53, 6], errors='coerce').fillna(0).values + \
                 pd.to_numeric(df_adv.iloc[6:53, 9], errors='coerce').fillna(0).values
    
    data = pd.DataFrame({
        'Prefecture': prefs,
        'Male_Rate': (male_adv / male_grads.values * 100).reshape(-1),
        'Female_Rate': (female_adv / female_grads.values * 100).reshape(-1)
    }).fillna(0)
    data['Region'] = data['Prefecture'].map(pref_to_region)
    data['Gap'] = data['Female_Rate'] - data['Male_Rate']
    return data

print("Regenerating all charts with concise titles...")

# 1. University scatter plots
for y in [2024, 2025]:
    data = get_year_data_univ(y)
    plt.figure(figsize=(14, 12))
    all_rates = pd.concat([data['Male_Rate'], data['Female_Rate']])
    min_v, max_v = all_rates.min() - 2, all_rates.max() + 2
    plt.plot([min_v, max_v], [min_v, max_v], color='gray', linestyle='--', alpha=0.5)
    sns.scatterplot(data=data, x='Male_Rate', y='Female_Rate', hue='Region', s=120, alpha=0.9, edgecolor='w')
    texts = [plt.text(data['Male_Rate'].iloc[i], data['Female_Rate'].iloc[i], data['Prefecture'].iloc[i], fontsize=10) for i in range(len(data))]
    adjust_text(texts, arrowprops=dict(arrowstyle='-', color='gray', alpha=0.5, lw=0.8), ax=plt.gca())
    plt.title(f'都道府県別大学進学率の男女比較（{y}年度）', fontsize=16, pad=20)
    plt.xlabel('男子進学率（%）', fontsize=13)
    plt.ylabel('女子進学率（%）', fontsize=13)
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left', title='地域')
    plt.gca().set_aspect('equal', adjustable='box')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/university_scatter_{y}.png', dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ university_scatter_{y}.png")

# 2. University gap bar charts
for y in [2024, 2025]:
    data = get_year_data_univ(y)
    plt.figure(figsize=(14, 7))
    data_sorted = data.sort_values('Gap', ascending=False)
    palette = ['#ff9999' if x > 0 else '#66b3ff' for x in data_sorted['Gap']]
    sns.barplot(data=data_sorted, x='Prefecture', y='Gap', palette=palette, hue='Prefecture', legend=False)
    plt.xticks(rotation=90)
    plt.title(f'大学進学率の男女差（{y}年度）', fontsize=14)
    plt.ylabel('女子進学率 − 男子進学率（ポイント）')
    plt.axhline(0, color='black', linewidth=1.5)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/university_gap_bar_{y}.png', dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ university_gap_bar_{y}.png")

# 3. Including JC scatter plots
for y in [2024, 2025]:
    data = get_year_data_with_jc(y)
    plt.figure(figsize=(14, 12))
    all_rates = pd.concat([data['Male_Rate'], data['Female_Rate']])
    min_v, max_v = all_rates.min() - 2, all_rates.max() + 2
    plt.plot([min_v, max_v], [min_v, max_v], color='gray', linestyle='--', alpha=0.5)
    sns.scatterplot(data=data, x='Male_Rate', y='Female_Rate', hue='Region', s=120, alpha=0.9, edgecolor='w')
    texts = [plt.text(data['Male_Rate'].iloc[i], data['Female_Rate'].iloc[i], data['Prefecture'].iloc[i], fontsize=10) for i in range(len(data))]
    adjust_text(texts, arrowprops=dict(arrowstyle='-', color='gray', alpha=0.5, lw=0.8), ax=plt.gca())
    plt.title(f'都道府県別大学・短大進学率の男女比較（{y}年度）', fontsize=16, pad=20)
    plt.xlabel('男子進学率（%）', fontsize=13)
    plt.ylabel('女子進学率（%）', fontsize=13)
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left', title='地域')
    plt.gca().set_aspect('equal', adjustable='box')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/advancement_including_jc_scatter_{y}.png', dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ advancement_including_jc_scatter_{y}.png")

# 4. Including JC gap bar charts
for y in [2024, 2025]:
    data = get_year_data_with_jc(y)
    plt.figure(figsize=(14, 7))
    data_sorted = data.sort_values('Gap', ascending=False)
    palette = ['#ff9999' if x > 0 else '#66b3ff' for x in data_sorted['Gap']]
    sns.barplot(data=data_sorted, x='Prefecture', y='Gap', palette=palette, hue='Prefecture', legend=False)
    plt.xticks(rotation=90)
    plt.title(f'大学・短大進学率の男女差（{y}年度）', fontsize=14)
    plt.ylabel('女子進学率 − 男子進学率（ポイント）')
    plt.axhline(0, color='black', linewidth=1.5)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/advancement_including_jc_gap_bar_{y}.png', dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ advancement_including_jc_gap_bar_{y}.png")

# 5. Correlation plot
df = pd.read_csv('/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/processed_11years_data_fixed.csv')
data_2025 = df[df['Year'] == 2025].copy()
data_2025['Grad_Ratio_F_M'] = data_2025['Female_Grads'] / data_2025['Male_Grads']
corr = data_2025[['Grad_Ratio_F_M', 'Gap']].corr().iloc[0, 1]

plt.figure(figsize=(12, 9))
sns.scatterplot(data=data_2025, x='Grad_Ratio_F_M', y='Gap', s=100, alpha=0.8, color='steelblue')
texts = [plt.text(data_2025['Grad_Ratio_F_M'].iloc[i], data_2025['Gap'].iloc[i], data_2025['Prefecture'].iloc[i], fontsize=9) for i in range(len(data_2025))]
adjust_text(texts, arrowprops=dict(arrowstyle='-', color='gray', alpha=0.5, lw=0.8), ax=plt.gca())
plt.axvline(1.0, color='red', linestyle='--', alpha=0.6)
plt.axhline(0, color='black', linestyle='-', alpha=0.3)
plt.title(f'卒業生男女比と進学率格差の相関（2025年度）', fontsize=15, pad=20)
plt.xlabel('卒業生の男女比（女子数 / 男子数）', fontsize=12)
plt.ylabel('進学率の差（女子% − 男子%）', fontsize=12)
plt.grid(True, linestyle=':', alpha=0.6)
plt.tight_layout()
plt.savefig('/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/correlation_ratio_gap_2025.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ correlation_ratio_gap_2025.png")

# 6. Dumbbell comparison
df24 = df[df['Year'] == 2024].set_index('Prefecture')
df25 = df[df['Year'] == 2025].set_index('Prefecture')
common_prefs = df24.index.intersection(df25.index)
data_comp = pd.DataFrame({
    'Prefecture': common_prefs,
    'Gap_2024': df24.loc[common_prefs, 'Gap'].values,
    'Gap_2025': df25.loc[common_prefs, 'Gap'].values
})
data_sorted = data_comp.sort_values('Gap_2025', ascending=True)

plt.figure(figsize=(10, 14))
plt.hlines(y=range(len(data_sorted)), xmin=data_sorted['Gap_2024'], xmax=data_sorted['Gap_2025'], color='grey', alpha=0.5)
plt.scatter(data_sorted['Gap_2024'], range(len(data_sorted)), color='skyblue', label='2024年度', s=80, alpha=0.8)
plt.scatter(data_sorted['Gap_2025'], range(len(data_sorted)), color='coral', label='2025年度', s=80, alpha=0.8)
plt.yticks(range(len(data_sorted)), data_sorted['Prefecture'])
plt.axvline(0, color='black', linewidth=1.5)
plt.title('大学進学率の男女差の変化（2024→2025年度）', fontsize=15, pad=20)
plt.xlabel('女子進学率 − 男子進学率（ポイント）')
plt.legend()
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/gap_comparison_dumbbell.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ gap_comparison_dumbbell.png")

print("\nAll charts regenerated successfully with concise titles!")
