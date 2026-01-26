import pandas as pd

df = pd.read_csv('/Users/kentaroiida/Desktop/20260119test/苗字データ分析/surname_distribution_with_readings.csv')

# Normalized initial
dakuon_map = str.maketrans('がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ', 'かきくけこさしすせそたちつてとはひふへほはひふへほ')
df['清音頭文字'] = df['読み'].str[0].str.translate(dakuon_map)

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
df['行'] = df['清音頭文字'].map(gyo_map)

pref_total = df.groupby('都道府県')['件数'].sum()

# 1. Latter Half (は～わ行) Top Prefs
latter_rows = ['は行', 'ま行', 'や行', 'ら行', 'わ行']
latter_share = (df[df['行'].isin(latter_rows)].groupby('都道府県')['件数'].sum() / pref_total * 100).sort_values(ascending=False)

print('### Latter Half (は～わ行) Share Top 10')
print(latter_share.head(10))

# 2. Tottori Deep Dive
tottori_df = df[df['都道府県'] == '鳥取県']
tottori_top = tottori_df.sort_values('件数', ascending=False).head(15)
print('\n### Tottori Top 15 Surnames')
print(tottori_top[['名字', '読み', '件数']].to_string(index=False))

# Gyo distribution analysis
tottori_gyo = tottori_df.groupby('行')['件数'].sum() / pref_total['鳥取県'] * 100
national_gyo = df.groupby('行')['件数'].sum() / df['件数'].sum() * 100
diff_gyo = (tottori_gyo - national_gyo).sort_values(ascending=False)

print('\n### Tottori Feature: Gyo Difference from National Avg')
print(diff_gyo.to_string())
