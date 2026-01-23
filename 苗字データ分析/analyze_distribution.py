import pandas as pd
import matplotlib.pyplot as plt
import os

# 日本語フォントの設定（IPAexGothicを使用）
plt.rcParams['font.family'] = 'IPAexGothic'

def analyze_initials():
    file_path = '/Users/kentaroiida/Desktop/20260119test/苗字データ分析/surname_distribution_with_readings.csv'
    df = pd.read_csv(file_path)
    
    # 名字ごとのユニークデータにする（1名字47行あるため）
    unique_names = df[['名字', '読み']].drop_duplicates()
    
    # 濁音・半濁音を清音に変換するマッピング
    dakuon_map = str.maketrans(
        'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ',
        'かきくけこさしすせそたちつてとはひふへほはひふへほ'
    )

    # 頭文字を抽出
    unique_names['頭文字'] = unique_names['読み'].str[0]
    unique_names['清音頭文字'] = unique_names['頭文字'].str.translate(dakuon_map)
    
    # 人数ベースの集計
    population_per_name = df.groupby(['名字', '読み'])['件数'].sum().reset_index()
    population_per_name['清音頭文字'] = population_per_name['読み'].str[0].str.translate(dakuon_map)
    
    # 50音の定義（集計軸）
    gojuon = [
        'あ','い','う','え','お',
        'か','き','く','け','こ',
        'さ','し','す','せ','そ',
        'た','ち','つ','て','と',
        'な','に','ぬ','ね','の',
        'は','ひ','ふ','へ','ほ',
        'ま','み','む','め','も',
        'や','ゆ','よ',
        'ら','り','る','れ','ろ',
        'わ'
    ]
    
    # カウント（種類数）
    counts = unique_names['清音頭文字'].value_counts().reindex(gojuon).fillna(0)
    
    # カウント（人数ベース）
    pop_counts = population_per_name.groupby('清音頭文字')['件数'].sum().reindex(gojuon).fillna(0)
    
    # 「行」ごとの集計
    rows = {
        'あ行': gojuon[0:5], 'か行': gojuon[5:10], 'さ行': gojuon[10:15], 'た行': gojuon[15:20], 'な行': gojuon[20:25],
        'は行': gojuon[25:30], 'ま行': gojuon[30:35], 'や行': gojuon[35:38], 'ら行': gojuon[38:43], 'わ行': gojuon[43:44]
    }
    
    def aggregate_by_row(data_series):
        row_res = {}
        for row_name, chars in rows.items():
            row_res[row_name] = data_series.reindex(chars).sum()
        return pd.Series(row_res)

    # 「段」ごとの集計
    dan_map = {
        'あ段': ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
        'い段': ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り'],
        'う段': ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る'],
        'え段': ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ'],
        'お段': ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ']
    }
    
    def aggregate_by_dan(data_series):
        dan_res = {}
        for dan_name, chars in dan_map.items():
            dan_res[dan_name] = data_series.reindex(chars).sum()
        return pd.Series(dan_res)

    row_counts = aggregate_by_row(counts)
    row_pop_counts = aggregate_by_row(pop_counts)
    dan_counts = aggregate_by_dan(counts)
    dan_pop_counts = aggregate_by_dan(pop_counts)
    
    print("--- 行ごとの分布（種類数） ---")
    print(row_counts)
    print(f"種類数 合計: {row_counts.sum()}")
    
    print("\n--- 段ごとの分布（種類数） ---")
    print(dan_counts)
    
    print("\n--- 段ごとの分布（人数ベース） ---")
    print(dan_pop_counts)
    
    # グラフ作成用の共通設定
    colors = ['orange' if i < 25 else 'skyblue' for i in range(len(gojuon))]
    row_colors = ['orange'] * 5 + ['skyblue'] * 5
    dan_colors = ['salmon', 'lightgreen', 'lightblue', 'plum', 'khaki']

    # 1. 種類数グラフ（文字）
    plt.figure(figsize=(15, 6))
    counts.plot(kind='bar', color=colors, rot=0)
    plt.title('苗字の頭文字分布：種類数（橙：前半 / 青：後半）', fontsize=16)
    plt.ylabel('名字の種類数')
    plt.tight_layout()
    plt.savefig('/Users/kentaroiida/Desktop/20260119test/苗字データ分析/initial_count_distribution.png')

    # 2. 段別グラフ（種類数）
    plt.figure(figsize=(10, 6))
    dan_counts.plot(kind='bar', color=dan_colors, rot=0)
    plt.title('苗字の「段」ごとの分布：種類数', fontsize=16)
    plt.ylabel('名字の種類数')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig('/Users/kentaroiida/Desktop/20260119test/苗字データ分析/dan_count_distribution.png')

    # 3. 段別グラフ（人数ベース）
    plt.figure(figsize=(10, 6))
    dan_pop_counts.plot(kind='bar', color=dan_colors, rot=0)
    plt.title('苗字の「段」ごとの分布：人数ベース', fontsize=16)
    plt.ylabel('推定人数')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig('/Users/kentaroiida/Desktop/20260119test/苗字データ分析/dan_pop_distribution.png')

if __name__ == "__main__":
    analyze_initials()
