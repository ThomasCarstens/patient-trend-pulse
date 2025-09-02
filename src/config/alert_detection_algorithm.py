
import pandas as pd
import numpy as np

WINDOW = 5  # rolling window

# --- Risk component functions (0..100 each), mid-range sensitivity preserved ---
def risk_hr(hr):
    if pd.isna(hr): return 0.0
    if hr <= 100: return 0.0
    if hr <= 110: return 10 * (hr - 100) / 10
    if hr <= 125: return 10 + 20 * (hr - 110) / 15
    if hr <= 140: return 30 + 25 * (hr - 125) / 15
    if hr <= 160: return 55 + 30 * (hr - 140) / 20
    return 85 + 15 * min((hr - 160) / 30, 1.0)

def risk_sbp(sbp):
    if pd.isna(sbp): return 0.0
    if sbp >= 110: return 0.0
    if sbp >= 100: return 12 * (110 - sbp) / 10   # a bit sharper
    if sbp >= 90:  return 12 + 22 * (100 - sbp) / 10
    if sbp >= 80:  return 34 + 26 * (90 - sbp) / 10
    if sbp >= 70:  return 60 + 25 * (80 - sbp) / 10
    return 85 + 15 * min((70 - sbp) / 20, 1.0)

def risk_map(map_mmHg):
    if pd.isna(map_mmHg): return 0.0
    if map_mmHg >= 85: return 0.0
    if map_mmHg >= 75: return 18 * (85 - map_mmHg) / 10
    if map_mmHg >= 65: return 18 + 24 * (75 - map_mmHg) / 10
    if map_mmHg >= 55: return 42 + 28 * (65 - map_mmHg) / 10
    if map_mmHg >= 45: return 70 + 20 * (55 - map_mmHg) / 10
    return 90 + 10 * min((45 - map_mmHg)/15, 1.0)

def risk_rr(rr):
    if pd.isna(rr): return 0.0
    if rr <= 20: return 0.0
    if rr <= 28: return 15 * (rr - 20) / 8
    if rr <= 36: return 15 + 25 * (rr - 28) / 8
    if rr <= 45: return 40 + 30 * (rr - 36) / 9
    return 70 + 30 * min((rr - 45) / 15, 1.0)

def risk_spo2(spo2):
    if pd.isna(spo2): return 0.0
    if spo2 >= 96: return 0.0
    if spo2 >= 93: return 12 * (96 - spo2) / 3
    if spo2 >= 90: return 12 + 20 * (93 - spo2) / 3
    if spo2 >= 85: return 32 + 24 * (90 - spo2) / 5
    if spo2 >= 80: return 56 + 24 * (85 - spo2) / 5
    return 80 + 20 * min((80 - spo2)/15, 1.0)

def risk_si(hr, sbp):
    if pd.isna(hr) or pd.isna(sbp) or sbp <= 0: return 0.0
    si = hr / sbp
    if si <= 0.8: return 0.0
    if si <= 1.0: return 28 * (si - 0.8) / 0.2   # slightly stronger mid
    if si <= 1.2: return 28 + 32 * (si - 1.0) / 0.2
    if si <= 1.5: return 60 + 25 * (si - 1.2) / 0.3
    return 85 + 15 * min((si - 1.5)/0.5, 1.0)

def trend_penalty(series):
    s = pd.to_numeric(series, errors='coerce').rolling(WINDOW, min_periods=1).mean()
    diff = s.diff().fillna(0)
    # Penalize *worsening*: SBP/MAP downwards (negative slope), SI upwards (positive slope)
    return diff

# Loss prior: soft ramps at 15/30/40% to push alert transitions
def loss_prior(blood_loss_percent):
    # sum of sigmoids centered at 15, 30, 40 with width ~2%
    x = pd.to_numeric(blood_loss_percent, errors='coerce').fillna(0)
    def sig(x, c, w):
        return 1 / (1 + np.exp(-(x - c) / w))
    boost = (
        8  * sig(x, 15, 2.0) +   # +0..8 after ~15%
        12 * sig(x, 30, 2.0) +   # +0..12 after ~30%
        18 * sig(x, 40, 2.0)     # +0..18 after ~40%
    )
    return boost

WEIGHTS = {'hr':0.16,'sbp':0.20,'map':0.20,'rr':0.08,'spo2':0.08,'si':0.28}

def compute_row_risk(row):
    r = 0.0
    r += WEIGHTS['hr']  * risk_hr(row.get('pulse_bpm'))
    r += WEIGHTS['sbp'] * risk_sbp(row.get('systolic_mmHg'))
    r += WEIGHTS['map'] * risk_map(row.get('MAP_mmHg'))
    r += WEIGHTS['rr']  * risk_rr(row.get('resp_rate_bpm'))
    r += WEIGHTS['spo2']* risk_spo2(row.get('SpO2_percent'))
    r += WEIGHTS['si']  * risk_si(row.get('pulse_bpm'), row.get('systolic_mmHg'))
    return r

def run(input_csv, output_csv):
    df = pd.read_csv(input_csv)

    # Base risk per row
    base = df.apply(compute_row_risk, axis=1)

    # Trend penalties: worsening SBP/MAP (negative slope) and SI (positive slope)
    tp_sbp = -trend_penalty(df['systolic_mmHg'])   # negative slope -> positive penalty
    tp_map = -trend_penalty(df['MAP_mmHg'])
    si_series = df['pulse_bpm'] / df['systolic_mmHg'].replace(0, np.nan)
    tp_si  =  trend_penalty(si_series)             # positive slope -> positive penalty

    # Scale and clip trend penalties to 0..25 total
    tp = 0.0
    for comp in [tp_sbp, tp_map, tp_si]:
        comp = comp.fillna(0)
        # normalize per-series robustly: map 95th percentile to 1.0
        p95 = np.nanpercentile(np.abs(comp), 95) if np.isfinite(comp).all() else 1.0
        if p95 <= 0: p95 = 1.0
        comp_scaled = 25.0 * np.clip(comp / p95, 0, 1) / 3.0  # split budget over three series
        tp = tp + comp_scaled

    # Loss prior boost
    lp = loss_prior(df.get('blood_loss_percent', 0))

    total = np.clip(base + tp + lp, 0, 100)

    # Finer mid thresholds to move earlier
    def risk_to_color(score):
        if score < 12:  return "white"
        if score < 30:  return "yellow"
        if score < 55:  return "orange"
        if score < 78:  return "red"
        return "brown"

    colors = [risk_to_color(v) for v in total]
    df['health_score'] = np.clip(100 - total, 0, 100)
    df['trend_score']  = np.clip(100 - tp, 0, 100)
    df['alert_color']  = colors
    df.to_csv(output_csv, index=False)
