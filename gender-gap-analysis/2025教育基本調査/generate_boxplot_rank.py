import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import japanize_matplotlib

# Set style
sns.set_theme(style="whitegrid")
plt.rcParams['font.family'] = ['Hiragino Sans', 'AppleGothic', 'sans-serif']

# Load the processed data
df = pd.read_csv('/Users/kentaroiida/Desktop/20260119test/processed_11years_data_fixed.csv')

# --- 1. Boxplot grouped by Prefecture, sorted by Median of Gap ---
# Sort medians descending: Rank 1 (Tokushima/Burgundy) at the TOP
# to match the article's table and a natural ranking flow.
medians = df.groupby('Prefecture')['Gap'].median().sort_values(ascending=False)
sorted_prefs = medians.index

# Define custom colors according to requirements
color_navy = (0, 0, 128/255)       # 紺 (Navy)
color_burgundy = (128/255, 0, 32/255) # バーガンディ (Burgundy)
color_white = (1.0, 1.0, 1.0)       # 白

def get_mapped_color(val, min_v, max_v):
    import matplotlib.colors as mcolors
    if val < 0:
        # Distance from 0 to absolute min
        # val=0 -> intensity=0 (White), val=min_v -> intensity=1 (Navy)
        intensity = val / min_v 
        cmap = mcolors.LinearSegmentedColormap.from_list("", [color_white, color_navy])
        return cmap(intensity)
    else:
        # Distance from 0 to absolute max
        intensity = val / max_v
        cmap = mcolors.LinearSegmentedColormap.from_list("", [color_white, color_burgundy])
        return cmap(intensity)

# Create a robust color dictionary to ensure perfect mapping regardless of sorting
pref_color_map = {pref: get_mapped_color(m, medians.min(), medians.max()) for pref, m in medians.items()}

plt.figure(figsize=(12, 16))

# Boxplot without outliers
# Use 'palette' as a dict for safety
sns.boxplot(data=df, y='Prefecture', x='Gap', order=sorted_prefs, 
            palette=pref_color_map, hue='Prefecture', showfliers=False, legend=False)

# Add jittery points (手法4) to make it richer
sns.stripplot(data=df, y='Prefecture', x='Gap', order=sorted_prefs, size=3, color=".3", alpha=0.3, jitter=0.2)

# Highlight the 2025 point specifically on top of the boxplot
df_2025 = df[df['Year'] == 2025].set_index('Prefecture').loc[sorted_prefs].reset_index()
sns.scatterplot(data=df_2025, y='Prefecture', x='Gap', marker='D', color='yellow', edgecolor='black', s=70, label='2025年度(最新)', zorder=5)

plt.axvline(0, color='black', linewidth=2, alpha=0.8)
plt.title('大学進学率格差の分布（2015-2025年度）', fontsize=15, pad=20)
plt.xlabel('女子進学率 − 男子進学率（ポイント）', fontsize=12)
plt.ylabel('都道府県（中央値順）', fontsize=12)
plt.legend()
plt.tight_layout()
plt.savefig('/Users/kentaroiida/Desktop/20260119test/boxplot_gap_11years_sorted.png', dpi=300, bbox_inches='tight')
plt.close()

# --- 2. Rank Table of Medians over 11 years ---
rank_df = pd.DataFrame({
    '都道府県': sorted_prefs,
    '格差の中央値(pt)': medians.values
})
# Rank 1 should be the one where females are most dominant (highest Gap)
rank_df['順位'] = rank_df['格差の中央値(pt)'].rank(ascending=False, method='min').astype(int)
rank_df = rank_df[['順位', '都道府県', '格差の中央値(pt)']].sort_values('順位')

print("--- 11年間の「進学率格差の中央値」ランキング ---")
print("※数値が高いほど女子の進学率が男子より高い傾向にあることを示します。")
print(rank_df.to_markdown(index=False))

# Also output total median change for simple years
yearly_medians = df.groupby('Year')['Gap'].median().reset_index()
print("\n--- 全国の「格差（中央値）」の年度別推移 ---")
print(yearly_medians.to_markdown(index=False))
