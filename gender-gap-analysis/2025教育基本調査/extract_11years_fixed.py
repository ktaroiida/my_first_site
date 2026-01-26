import pandas as pd
import os

folder = '/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/'
years = range(2015, 2026)

def extract_data(year):
    f289 = f'ey0289_{year}.xlsx'
    f292 = f'ey0292_{year}.xlsx'
    path289 = os.path.join(folder, f289)
    path292 = os.path.join(folder, f292)
    
    if not (os.path.exists(path289) and os.path.exists(path292)):
        return None

    # --- Extract Graduates (ey0289) ---
    xl_grad = pd.ExcelFile(path289)
    if len(xl_grad.sheet_names) >= 9:
        # Multi-sheet format (2021-2025)
        def sum_grads(sheets):
            total = None
            for s in sheets:
                df = pd.read_excel(xl_grad, sheet_name=s, header=None)
                vals = pd.to_numeric(df.iloc[6:53, 1], errors='coerce').fillna(0)
                total = vals if total is None else total + vals
            return total.values, df.iloc[6:53, 0].values

        male_grads, prefs = sum_grads(['ey0289-4', 'ey0289-5', 'ey0289-6'])
        female_grads, _ = sum_grads(['ey0289-7', 'ey0289-8', 'ey0289-9'])
    else:
        # Single sheet format (2015-2020)
        df_sheet = pd.read_excel(xl_grad, sheet_name=0, header=None)
        def find_section_grads(df, kw):
            col0 = df[0].astype(str).str.replace(' ', '').str.replace('\u3000', '').str.replace('\n', '')
            matches = df[col0.str.contains(kw, na=False, regex=False)].index
            if len(matches) > 0:
                row = matches[0]
                for r in range(row, row+40):
                    if '北海道' in str(df.iloc[r, 0]):
                        return pd.to_numeric(df.iloc[r:r+47, 1], errors='coerce').fillna(0).values, df.iloc[r:r+47, 0].values
            return None, None
        
        m_nat, prefs = find_section_grads(df_sheet, '男国立')
        m_pub, _ = find_section_grads(df_sheet, '男公立')
        m_pri, _ = find_section_grads(df_sheet, '男私立')
        
        # Check for alternative keyword '男公・私・諸' if single section
        if m_nat is None: m_nat = 0
        if m_pub is None: m_pub = 0
        if m_pri is None: m_pri = 0
        male_grads = m_nat + m_pub + m_pri
        
        f_nat, _ = find_section_grads(df_sheet, '女国立')
        f_pub, _ = find_section_grads(df_sheet, '女公立')
        f_pri, _ = find_section_grads(df_sheet, '女私立')
        if f_nat is None: f_nat = 0
        if f_pub is None: f_pub = 0
        if f_pri is None: f_pri = 0
        female_grads = f_nat + f_pub + f_pri

    # --- Extract University Advancers (ey0292) ---
    xl_adv = pd.ExcelFile(path292)
    first_df = pd.read_excel(xl_adv, sheet_name=0, header=None)
    header_label = str(first_df.iloc[2, 0])
    
    if '計' in header_label and '国立' not in header_label:
        # High-level total sheet available (2022-2025)
        male_univ = pd.to_numeric(first_df.iloc[6:53, 5], errors='coerce').fillna(0).values
        female_univ = pd.to_numeric(first_df.iloc[6:53, 6], errors='coerce').fillna(0).values
    elif len(xl_adv.sheet_names) > 1:
        # Multi-sheet without total sheet (2021)
        m_total = 0
        f_total = 0
        for s in xl_adv.sheet_names:
            df = pd.read_excel(xl_adv, sheet_name=s, header=None)
            m_total += pd.to_numeric(df.iloc[6:53, 5], errors='coerce').fillna(0).values
            f_total += pd.to_numeric(df.iloc[6:53, 6], errors='coerce').fillna(0).values
        male_univ, female_univ = m_total, f_total
    else:
        # Single sheet format (2015-2020)
        m_total = 0
        f_total = 0
        for kw in ['国立', '公立', '私立']:
            matches = first_df[first_df[0].astype(str).str.replace(' ', '').str.replace('\u3000','').str.contains(kw, na=False)].index
            if len(matches) > 0:
                row = matches[0]
                for r in range(row, row+20):
                    if '北海道' in str(first_df.iloc[r, 0]):
                        m_total += pd.to_numeric(first_df.iloc[r:r+47, 5], errors='coerce').fillna(0).values
                        f_total += pd.to_numeric(first_df.iloc[r:r+47, 6], errors='coerce').fillna(0).values
                        break
        male_univ, female_univ = m_total, f_total

    return pd.DataFrame({
        'Year': year,
        'Prefecture': prefs.reshape(-1),
        'Male_Grads': male_grads.reshape(-1),
        'Female_Grads': female_grads.reshape(-1),
        'Male_Univ_Adv': male_univ.reshape(-1),
        'Female_Univ_Adv': female_univ.reshape(-1)
    })

all_data = []
for y in years:
    print(f"Extracting {y}...")
    try:
        df = extract_data(y)
        if df is not None:
            all_data.append(df)
    except Exception as e:
        print(f"Error in {y}: {e}")

final_df = pd.concat(all_data)
final_df['Male_Rate'] = (final_df['Male_Univ_Adv'] / final_df['Male_Grads'] * 100).fillna(0)
final_df['Female_Rate'] = (final_df['Female_Univ_Adv'] / final_df['Female_Grads'] * 100).fillna(0)
final_df['Gap'] = final_df['Female_Rate'] - final_df['Male_Rate']

final_df.to_csv('/Users/kentaroiida/Desktop/20260119test/processed_11years_data_fixed.csv', index=False)
print("Data extraction complete. Saved to processed_11years_data_fixed.csv")
