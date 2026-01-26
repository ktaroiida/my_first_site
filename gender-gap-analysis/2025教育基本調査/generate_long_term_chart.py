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

# Calculate medians for color mapping
median_gap = df.groupby('Prefecture')['Gap'].median()

# Sort by 2025 values (descending): High Gap at TOP
gap_2025 = df[df['Year'] == 2025].set_index('Prefecture')['Gap']
sorted_prefs = gap_2025.sort_values(ascending=False).index

# Create a pivot table for the gaps
gap_pivot = df.pivot(index='Prefecture', columns='Year', values='Gap').loc[sorted_prefs]

# Color logic (Same as boxplot)
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

# Robust color map based on median
pref_color_map = {pref: get_mapped_color(median_gap[pref], median_gap.min(), median_gap.max()) for pref in sorted_prefs}

plt.figure(figsize=(11, 16))

# Plotting each prefecture row
for i, (pref, row) in enumerate(gap_pivot.iterrows()):
    years = row.index
    gaps = row.values
    color = pref_color_map[pref]
    
    # Background line for the range (thick and colored according to median)
    plt.hlines(y=i, xmin=min(gaps), xmax=max(gaps), color=color, linewidth=5, alpha=0.4, zorder=1)
    # Thin gray line for precision
    plt.hlines(y=i, xmin=min(gaps), xmax=max(gaps), color='gray', linewidth=0.5, alpha=0.5, zorder=2)
    
    # Plot all intermediate years with gradient (older = lighter, newer = darker)
    intermediate_years = [y for y in years if y not in [2015, 2025]]
    for idx, y in enumerate(intermediate_years):
        # Create gradient: 0.2 (light) to 0.7 (dark)
        intensity = 0.2 + (idx / max(len(intermediate_years) - 1, 1)) * 0.5
        gray_color = (intensity, intensity, intensity)
        plt.scatter(row[y], i, color=gray_color, s=15, alpha=0.8, zorder=3)

    # Highlight Start (2015) - Blue circle
    plt.scatter(row[2015], i, color='#3b82f6', s=50, edgecolors='white', linewidth=0.5, label='2015年度' if i == 0 else "", zorder=4)
    # Highlight End (2025) - Yellow diamond (consistent with boxplot)
    plt.scatter(row[2025], i, color='yellow', marker='D', s=100, edgecolors='black', linewidth=0.8, label='2025年度' if i == 0 else "", zorder=5)

# Formatting
plt.axvline(0, color='black', linewidth=2.0) # Equality line
plt.yticks(range(len(sorted_prefs)), sorted_prefs, fontsize=10)
plt.xticks(fontsize=11)
plt.xlabel('女子進学率 − 男子進学率（ポイント）', fontsize=12, labelpad=15)
plt.title('大学進学率格差の推移（2015-2025年度）', fontsize=16, pad=25)

# Legend
plt.legend(bbox_to_anchor=(1, 1), loc='upper left')
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()

plt.savefig('/Users/kentaroiida/Desktop/20260119test/long_term_gap_transition.png', dpi=300, bbox_inches='tight')
plt.close()

print("Updated long-term transition chart with consistent color logic.")
