import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import japanize_matplotlib
import numpy as np

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = ['Hiragino Sans', 'AppleGothic', 'sans-serif']

# Load the processed data
df = pd.read_csv('/Users/kentaroiida/Desktop/20260119test/processed_11years_data_fixed.csv')

# Define custom colors
color_navy = (0, 0, 128/255)       # 紺 (Navy)
color_burgundy = (128/255, 0, 32/255) # バーガンディ (Burgundy)
color_white = (1.0, 1.0, 1.0)       # 白

def get_mapped_color(val, min_v, max_v):
    import matplotlib.colors as mcolors
    if val < 0:
        intensity = val / min_v # 0 to 1
        cmap = mcolors.LinearSegmentedColormap.from_list("", [color_white, color_navy])
        return cmap(intensity)
    else:
        intensity = val / max_v # 0 to 1
        cmap = mcolors.LinearSegmentedColormap.from_list("", [color_white, color_burgundy])
        return cmap(intensity)

def create_boxplot_variant(sort_by_2025=False, ascending=True, filename="output.png", title=""):
    # Calculate medians for coloring (consistent with historical context)
    median_gap = df.groupby('Prefecture')['Gap'].median()
    val_2025 = df[df['Year'] == 2025].set_index('Prefecture')['Gap']
    
    if sort_by_2025:
        sorted_prefs = val_2025.sort_values(ascending=ascending).index
    else:
        sorted_prefs = median_gap.sort_values(ascending=ascending).index

    # Use median for color as per requirement "Median distance from 0"
    pref_color_map = {pref: get_mapped_color(median_gap[pref], median_gap.min(), median_gap.max()) for pref in sorted_prefs}

    plt.figure(figsize=(12, 16))
    
    # 47 Prefectures Boxplot
    sns.boxplot(data=df, y='Prefecture', x='Gap', order=sorted_prefs, 
                palette=pref_color_map, hue='Prefecture', showfliers=False, legend=False)
    
    # Add dots for individual years
    sns.stripplot(data=df, y='Prefecture', x='Gap', order=sorted_prefs, size=3, color=".3", alpha=0.3, jitter=0.2)

    # Highlight 2025 specifically
    df_2025 = df[df['Year'] == 2025].set_index('Prefecture').loc[sorted_prefs].reset_index()
    sns.scatterplot(data=df_2025, y='Prefecture', x='Gap', marker='D', color='yellow', edgecolor='black', s=70, label='2025年度(最新)', zorder=5)

    plt.axvline(0, color='black', linewidth=2, alpha=0.8)
    plt.title(title, fontsize=15, pad=20)
    plt.xlabel('大学進学率の男女差 (女子% - 男子%)', fontsize=12)
    plt.ylabel('都道府県', fontsize=12)
    plt.legend()
    plt.tight_layout()
    plt.savefig(f'/Users/kentaroiida/Desktop/20260119test/{filename}', dpi=300)
    plt.close()

# 1. Median Ascending (Previous was Descending)
print("Creating variant: Median Ascending...")
create_boxplot_variant(sort_by_2025=False, ascending=True, 
                      filename="boxplot_median_asc.png",
                      title="【11年間の集計】中央値：低い(男子優位) → 高い(女子優位)\n色は中央値の0%からの乖離度 (紺:男 / バーガンディ:女)")

# 2. 2025 Ascending
print("Creating variant: 2025 Ascending...")
create_boxplot_variant(sort_by_2025=True, ascending=True, 
                      filename="boxplot_2025_asc.png",
                      title="【2025年度基準】格差の小さい(あるいは男子優位) → 大きい順\n色は11年間の歴史的傾向を表示")

# 3. 2025 Descending
print("Creating variant: 2025 Descending...")
create_boxplot_variant(sort_by_2025=True, ascending=False, 
                      filename="boxplot_2025_desc.png",
                      title="【2025年度基準】格差の大きい(女子優位) → 小さい順\n色は11年間の歴史的傾向を表示")

print("All variations generated.")
