import pandas as pd
import json
import os

def generate_map_data():
    file_path = '/Users/kentaroiida/Desktop/20260119test/苗字データ分析/surname_distribution_with_readings.csv'
    df = pd.read_csv(file_path)
    
    # 濁音の正規化
    dakuon_map = str.maketrans(
        'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ',
        'かきくけこさしすせそたちつてとはひふへほはひふへほ'
    )
    df['頭文字'] = df['読み'].str[0]
    df['清音頭文字'] = df['頭文字'].str.translate(dakuon_map)
    
    # 行と段の定義
    gyo_map = {
        'あ': 'あ行', 'い': 'あ行', 'う': 'あ行', 'え': 'あ行', 'お': 'あ行',
        'か': 'か行', 'き': 'か行', 'く': 'か行', 'け': 'か行', 'こ': 'か行',
        'さ': 'さ行', 'し': 'さ行', 'す': 'さ行', 'せ': 'さ行', 'そ': 'さ行',
        'た': 'た行', 'ち': 'た行', 'つ': 'た行', 'て': 'た行', 'と': 'た行',
        'な': 'な行', 'に': 'な行', 'ぬ': 'な行', 'ね': 'な行', 'の': 'な行',
        'は': 'は行', 'ひ': 'は行', 'ふ': 'は行', 'へ': 'は行', 'ほ': 'は行',
        'ま': 'ま行', 'み': 'ま行', 'む': 'ま行', 'め': 'ま行', 'も': 'ま行',
        'や': 'や行', 'ゆ': 'や行', 'よ': 'や行',
        'ら': 'ら行', 'り': 'ら行', 'る': 'ら行', 'れ': 'ら行', 'ろ': 'ら行',
        'わ': 'わ行'
    }
    dan_map = {
        'あ': 'あ段', 'か': 'あ段', 'さ': 'あ段', 'た': 'あ段', 'な': 'あ段', 'は': 'あ段', 'ま': 'あ段', 'や': 'あ段', 'ら': 'あ段', 'わ': 'あ段',
        'い': 'い段', 'き': 'い段', 'し': 'い段', 'ち': 'い段', 'に': 'い段', 'ひ': 'い段', 'み': 'い段', 'り': 'い段',
        'う': 'う段', 'く': 'う段', 'す': 'う段', 'つ': 'う段', 'ぬ': 'う段', 'ふ': 'う段', 'む': 'う段', 'ゆ': 'う段', 'る': 'う段',
        'え': 'え段', 'け': 'え段', 'せ': 'え段', 'て': 'え段', 'ね': 'え段', 'へ': 'え段', 'め': 'え段', 'れ': 'え段',
        'お': 'お段', 'こ': 'お段', 'そ': 'お段', 'と': 'お段', 'の': 'お段', 'ほ': 'お段', 'も': 'お段', 'よ': 'お段', 'ろ': 'お段'
    }
    
    df['行'] = df['清音頭文字'].map(gyo_map)
    df['段'] = df['清音頭文字'].map(dan_map)
    
    # 都道府県ごとの合計人数（ベースライン）
    pref_total_pop = df.groupby('都道府県')['件数'].sum()
    
    # 最終的なJSON用データ構造
    result = {
        "prefs": list(pref_total_pop.index),
        "gyo": {},
        "dan": {},
        "char": {}
    }
    
    # 各「行」の属性と代表苗字を計算
    for gyo in df['行'].dropna().unique():
        subset = df[df['行'] == gyo]
        pop_share = subset.groupby('都道府県')['件数'].sum() / pref_total_pop * 100
        result["gyo"][gyo] = {
            "stats": pop_share.fillna(0).to_dict(),
            "top_names": {}
        }
        for pref in result["prefs"]:
            top3 = subset[subset['都道府県'] == pref].sort_values('件数', ascending=False).head(3)
            result["gyo"][gyo]["top_names"][pref] = [f"{r['名字']}({r['読み']})" for _, r in top3.iterrows()]
        
    # 各「段」の属性と代表苗字を計算
    for dan in df['段'].dropna().unique():
        subset = df[df['段'] == dan]
        pop_share = subset.groupby('都道府県')['件数'].sum() / pref_total_pop * 100
        result["dan"][dan] = {
            "stats": pop_share.fillna(0).to_dict(),
            "top_names": {}
        }
        for pref in result["prefs"]:
            top3 = subset[subset['都道府県'] == pref].sort_values('件数', ascending=False).head(3)
            result["dan"][dan]["top_names"][pref] = [f"{r['名字']}({r['読み']})" for _, r in top3.iterrows()]

    # 各「50音」の属性と代表苗字を計算
    for char in df['清音頭文字'].dropna().unique():
        subset = df[df['清音頭文字'] == char]
        pop_share = subset.groupby('都道府県')['件数'].sum() / pref_total_pop * 100
        result["char"][char] = {
            "stats": pop_share.fillna(0).to_dict(),
            "top_names": {}
        }
        for pref in result["prefs"]:
            top3 = subset[subset['都道府県'] == pref].sort_values('件数', ascending=False).head(3)
            result["char"][char]["top_names"][pref] = [f"{r['名字']}({r['読み']})" for _, r in top3.iterrows()]

    # 都道府県別の全体ランキング (苗字ランキング表示用)
    result["overall_top"] = {}
    for pref in result["prefs"]:
        top3 = df[df['都道府県'] == pref].sort_values('件数', ascending=False).head(3)
        result["overall_top"][pref] = [f"{r['名字']}({r['読み']})" for _, r in top3.iterrows()]

    with open('/Users/kentaroiida/Desktop/20260119test/苗字データ分析/map_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print("Map visualization data generated: map_stats.json")

if __name__ == "__main__":
    generate_map_data()
