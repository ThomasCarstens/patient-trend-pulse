import { VitalSigns } from "@/data/medicalData";

const WINDOW = 5; // rolling window
const WEIGHTS = {
  hr: 0.16,
  sbp: 0.20,
  map: 0.20,
  rr: 0.08,
  spo2: 0.08,
  si: 0.28
};

// Risk component functions (0..100 each), mid-range sensitivity preserved
function riskHr(hr: number | null | undefined): number {
  if (hr == null || isNaN(hr)) return 0.0;
  if (hr <= 100) return 0.0;
  if (hr <= 110) return 10 * (hr - 100) / 10;
  if (hr <= 125) return 10 + 20 * (hr - 110) / 15;
  if (hr <= 140) return 30 + 25 * (hr - 125) / 15;
  if (hr <= 160) return 55 + 30 * (hr - 140) / 20;
  return 85 + 15 * Math.min((hr - 160) / 30, 1.0);
}

function riskSbp(sbp: number | null | undefined): number {
  if (sbp == null || isNaN(sbp)) return 0.0;
  if (sbp >= 110) return 0.0;
  if (sbp >= 100) return 12 * (110 - sbp) / 10;
  if (sbp >= 90) return 12 + 22 * (100 - sbp) / 10;
  if (sbp >= 80) return 34 + 26 * (90 - sbp) / 10;
  if (sbp >= 70) return 60 + 25 * (80 - sbp) / 10;
  return 85 + 15 * Math.min((70 - sbp) / 20, 1.0);
}

function riskMap(mapMmHg: number | null | undefined): number {
  if (mapMmHg == null || isNaN(mapMmHg)) return 0.0;
  if (mapMmHg >= 85) return 0.0;
  if (mapMmHg >= 75) return 18 * (85 - mapMmHg) / 10;
  if (mapMmHg >= 65) return 18 + 24 * (75 - mapMmHg) / 10;
  if (mapMmHg >= 55) return 42 + 28 * (65 - mapMmHg) / 10;
  if (mapMmHg >= 45) return 70 + 20 * (55 - mapMmHg) / 10;
  return 90 + 10 * Math.min((45 - mapMmHg) / 15, 1.0);
}

function riskRr(rr: number | null | undefined): number {
  if (rr == null || isNaN(rr)) return 0.0;
  if (rr <= 20) return 0.0;
  if (rr <= 28) return 15 * (rr - 20) / 8;
  if (rr <= 36) return 15 + 25 * (rr - 28) / 8;
  if (rr <= 45) return 40 + 30 * (rr - 36) / 9;
  return 70 + 30 * Math.min((rr - 45) / 15, 1.0);
}

function riskSpo2(spo2: number | null | undefined): number {
  if (spo2 == null || isNaN(spo2)) return 0.0;
  if (spo2 >= 96) return 0.0;
  if (spo2 >= 93) return 12 * (96 - spo2) / 3;
  if (spo2 >= 90) return 12 + 20 * (93 - spo2) / 3;
  if (spo2 >= 85) return 32 + 24 * (90 - spo2) / 5;
  if (spo2 >= 80) return 56 + 24 * (85 - spo2) / 5;
  return 80 + 20 * Math.min((80 - spo2) / 15, 1.0);
}

function riskSi(hr: number | null | undefined, sbp: number | null | undefined): number {
  if (hr == null || sbp == null || isNaN(hr) || isNaN(sbp) || sbp <= 0) return 0.0;
  const si = hr / sbp;
  if (si <= 0.8) return 0.0;
  if (si <= 1.0) return 28 * (si - 0.8) / 0.2;
  if (si <= 1.2) return 28 + 32 * (si - 1.0) / 0.2;
  if (si <= 1.5) return 60 + 25 * (si - 1.2) / 0.3;
  return 85 + 15 * Math.min((si - 1.5) / 0.5, 1.0);
}

// Calculate Mean Arterial Pressure (MAP) from systolic and diastolic
function calculateMAP(systolic: number, diastolic: number): number {
  return diastolic + (systolic - diastolic) / 3;
}

// Rolling window average
function rollingMean(values: number[], windowSize: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const sum = window.reduce((a, b) => a + b, 0);
    result.push(sum / window.length);
  }
  return result;
}

// Calculate trend penalty (slope)
function trendPenalty(values: number[]): number[] {
  const smoothed = rollingMean(values, WINDOW);
  const diffs: number[] = [0]; // First value has no diff
  for (let i = 1; i < smoothed.length; i++) {
    diffs.push(smoothed[i] - smoothed[i - 1]);
  }
  return diffs;
}

// Loss prior: soft ramps at 15/30/40% to push alert transitions
function lossPrior(bloodLossPercent: number): number {
  const x = bloodLossPercent || 0;
  const sig = (x: number, c: number, w: number) => 1 / (1 + Math.exp(-(x - c) / w));
  
  const boost = (
    8 * sig(x, 15, 2.0) +   // +0..8 after ~15%
    12 * sig(x, 30, 2.0) +  // +0..12 after ~30%
    18 * sig(x, 40, 2.0)    // +0..18 after ~40%
  );
  return boost;
}

// Compute risk for a single row
function computeRowRisk(vital: VitalSigns): number {
  const map = calculateMAP(vital.systolic_mmHg, vital.diastolic_mmHg);
  
  let risk = 0.0;
  risk += WEIGHTS.hr * riskHr(vital.pulse_bpm);
  risk += WEIGHTS.sbp * riskSbp(vital.systolic_mmHg);
  risk += WEIGHTS.map * riskMap(map);
  risk += WEIGHTS.rr * riskRr(vital.resp_rate_bpm);
  risk += WEIGHTS.spo2 * riskSpo2(vital.SpO2_percent);
  risk += WEIGHTS.si * riskSi(vital.pulse_bpm, vital.systolic_mmHg);
  
  return risk;
}



// Convert risk score to alert color (matching original Python colors)
function riskToColor(score: number): "white" | "yellow" | "orange" | "red" | "brown" {
  if (score < 12) return "white";    // Low risk
  if (score < 30) return "yellow";   // Moderate risk
  if (score < 55) return "orange";   // High risk
  if (score < 78) return "red";      // Critical risk
  return "brown";                    // Severe risk
}



// Optimized function to compute alert colors for a series of vitals (10Hz performance)
export function computeAlertColors(vitals: VitalSigns[]): VitalSigns[] {
  if (vitals.length === 0) return vitals;

  const length = vitals.length;
  const results: VitalSigns[] = new Array(length);

  // Pre-allocate arrays for better performance
  const baseRisks = new Array(length);
  const sbpValues = new Array(length);
  const mapValues = new Array(length);
  const siValues = new Array(length);

  // Single pass to compute base risks and extract values
  for (let i = 0; i < length; i++) {
    const vital = vitals[i];
    baseRisks[i] = computeRowRisk(vital);
    sbpValues[i] = vital.systolic_mmHg;
    mapValues[i] = calculateMAP(vital.systolic_mmHg, vital.diastolic_mmHg);
    siValues[i] = vital.systolic_mmHg > 0 ? vital.pulse_bpm / vital.systolic_mmHg : 0;
  }

  // Optimized trend penalties calculation
  const tpSbp = trendPenalty(sbpValues).map(v => -v);
  const tpMap = trendPenalty(mapValues).map(v => -v);
  const tpSi = trendPenalty(siValues);

  // Fast percentile calculation (approximate for performance)
  const p95Sbp = fastPercentile95(tpSbp.map(Math.abs));
  const p95Map = fastPercentile95(tpMap.map(Math.abs));
  const p95Si = fastPercentile95(tpSi.map(Math.abs));

  // Single pass final computation
  for (let i = 0; i < length; i++) {
    const vital = vitals[i];
    const baseRisk = baseRisks[i];

    // Optimized trend penalty calculation
    let trendPenalty = 0.0;
    trendPenalty += 8.33 * Math.max(0, Math.min(tpSbp[i] / (p95Sbp || 1.0), 1)); // 25/3 = 8.33
    trendPenalty += 8.33 * Math.max(0, Math.min(tpMap[i] / (p95Map || 1.0), 1));
    trendPenalty += 8.33 * Math.max(0, Math.min(tpSi[i] / (p95Si || 1.0), 1));

    const lossBoost = lossPrior(vital.blood_loss_percent);
    const totalRisk = Math.max(0, Math.min(100, baseRisk + trendPenalty + lossBoost));

    results[i] = {
      ...vital,
      health_score: Math.max(0, Math.min(100, 100 - totalRisk)),
      trend_score: Math.max(0, Math.min(100, 100 - trendPenalty)),
      alert_color: riskToColor(totalRisk)
    };
  }

  return results;
}

// Fast approximate 95th percentile for performance
function fastPercentile95(values: number[]): number {
  if (values.length === 0) return 1.0;

  // For small arrays, use exact calculation
  if (values.length < 20) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 1.0;
  }

  // For larger arrays, use approximate method for speed
  let max = values[0];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val > max) max = val;
    sum += val;
  }

  // Approximate 95th percentile as 0.8 * max + 0.2 * mean
  const mean = sum / values.length;
  return 0.8 * max + 0.2 * mean;
}

// Compute alert color for a single vital sign reading
export function computeSingleAlertColor(vital: VitalSigns): "white" | "yellow" | "orange" | "red" | "brown" {
  const baseRisk = computeRowRisk(vital);
  const lossBoost = lossPrior(vital.blood_loss_percent);
  const totalRisk = Math.max(0, Math.min(100, baseRisk + lossBoost));
  return riskToColor(totalRisk);
}
