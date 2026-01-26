import pandas as pd

def get_stats(year, include_jc=False):
    base = '/Users/kentaroiida/Desktop/20260119test/2025教育基本調査/'
    xl_grad = pd.ExcelFile(f'{base}ey0289_{year}.xlsx')
    df_adv = pd.read_excel(f'{base}ey0292_{year}.xlsx', sheet_name='ey0292-1', header=None)
    
    def sum_g(sheets):
        tot = None
        for s in sheets:
            df = pd.read_excel(xl_grad, sheet_name=s, header=None)
            v = pd.to_numeric(df.iloc[6:53, 1], errors='coerce').fillna(0)
            tot = v if tot is None else tot + v
        return tot

    m_g = sum_g(['ey0289-4','ey0289-5','ey0289-6'])
    f_g = sum_g(['ey0289-7','ey0289-8','ey0289-9'])
    
    # Univ Adv
    m_a = pd.to_numeric(df_adv.iloc[6:53, 5], errors='coerce').fillna(0)
    f_a = pd.to_numeric(df_adv.iloc[6:53, 6], errors='coerce').fillna(0)
    
    if include_jc:
        m_a += pd.to_numeric(df_adv.iloc[6:53, 8], errors='coerce').fillna(0)
        f_a += pd.to_numeric(df_adv.iloc[6:53, 9], errors='coerce').fillna(0)
        
    m_r = (m_a.values / m_g.values * 100)
    f_r = (f_a.values / f_g.values * 100)
    gap = f_r - m_r
    return gap.mean(), f_r.mean(), m_r.mean()

print("--- University Only ---")
print("2024: Gap Avg {:.2f}, F Avg {:.2f}, M Avg {:.2f}".format(*get_stats(2024)))
print("2025: Gap Avg {:.2f}, F Avg {:.2f}, M Avg {:.2f}".format(*get_stats(2025)))

print("\n--- Including JC ---")
print("2024: Gap Avg {:.2f}, F Avg {:.2f}, M Avg {:.2f}".format(*get_stats(2024, True)))
print("2025: Gap Avg {:.2f}, F Avg {:.2f}, M Avg {:.2f}".format(*get_stats(2025, True)))
