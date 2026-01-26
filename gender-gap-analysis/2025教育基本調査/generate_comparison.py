import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import japanize_matplotlib

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = ['Hiragino Sans', 'AppleGothic', 'sans-serif']

def get_year_gap(year):
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
    
    male_rate = (male_adv.values / male_grads.values * 100)
    female_rate = (female_adv.values / female_grads.values * 100)
    
    data = pd.DataFrame({
        'Prefecture': prefs,
        f'Gap_{year}': female_rate - male_rate,
        f'Male_Rate_{year}': male_rate,
        f'Female_Rate_{year}': female_rate
    })
    return data

# Load both years
df24 = get_year_gap(2024)
df25 = get_year_gap(2025)

# Merge
df_comp = pd.merge(df24, df25, on='Prefecture')
df_comp['Gap_Change'] = df_comp['Gap_2025'] - df_comp['Gap_2024']

# --- Dumbbell Plot for Gap ---
plt.figure(figsize=(10, 14))
data_sorted = df_comp.sort_values('Gap_2025', ascending=True)

# Draw lines
plt.hlines(y=range(len(data_sorted)), xmin=data_sorted['Gap_2024'], xmax=data_sorted['Gap_2025'], color='grey', alpha=0.5)
# Draw dots
plt.scatter(data_sorted['Gap_2024'], range(len(data_sorted)), color='skyblue', label='2024年度', s=80, alpha=0.8)
plt.scatter(data_sorted['Gap_2025'], range(len(data_sorted)), color='coral', label='2025年度', s=80, alpha=0.8)

plt.yticks(range(len(data_sorted)), data_sorted['Prefecture'])
plt.axvline(0, color='black', linewidth=1, linestyle='-')
plt.title('大学進学率の男女差の変化 (2024 → 2025)\n女子率が男子率をどれだけ上回っているか', fontsize=15, pad=20)
plt.xlabel('進学率の差 (長所: 女子が高い / 短所: 男子が高い) [ポイント]')
plt.legend()
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('/Users/kentaroiida/Desktop/20260119test/gap_comparison_dumbbell.png', dpi=300)
plt.close()

# --- Change in Gap Bar Chart ---
plt.figure(figsize=(14, 7))
df_change_sorted = df_comp.sort_values('Gap_Change', ascending=False)
colors = ['#ff9999' if x > 0 else '#66b3ff' for x in df_change_sorted['Gap_Change']]
sns.barplot(data=df_change_sorted, x='Prefecture', y='Gap_Change', palette=colors, hue='Prefecture', legend=False)
plt.xticks(rotation=90)
plt.title('大学進学率の男女差の変化量 (2025年Gap - 2024年Gap)', fontsize=14)
plt.ylabel('変化量 (ポイント)')
plt.axhline(0, color='black', linewidth=1)
plt.tight_layout()
plt.savefig('/Users/kentaroiida/Desktop/20260119test/gap_change_bar.png', dpi=300)
plt.close()

print("Comparison charts (Dumbbell and Gap Change) have been generated.")
