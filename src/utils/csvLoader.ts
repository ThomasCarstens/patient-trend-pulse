import { VitalSigns } from "@/data/medicalData";
import { computeAlertColors } from "@/utils/alertDetection";

export interface CSVVitalData {
  patientId: string;
  filename: string;
  vitals: VitalSigns[];
}

export interface PatientProfile {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  filename: string;
}

// Function to get 5 CSV files for 5 patients (1:1 mapping)
export async function getAvailableCSVFiles(): Promise<string[]> {
  try {
    // We have 5 unique CSV files, one per patient
    const patientFiles = [
      'individ_age20_sexF_h165_w60.csv',
      'individ_age20_sexM_h165_w100.csv',
      'individ_age20_sexM_h175_w80.csv',
      'individ_age30_sexF_h175_w80.csv',
      'individ_age30_sexM_h165_w80.csv'
    ];

    console.log(`Using ${patientFiles.length} unique CSV files for ${patientFiles.length} patients`);
    return patientFiles;
  } catch (error) {
    console.error('Error getting CSV files:', error);
    return [];
  }
}

// Parse patient info from filename
export function parsePatientFromFilename(filename: string): PatientProfile | null {
  const match = filename.match(/individ_age(\d+)_sex([FM])_h(\d+)_w(\d+)\.csv/);
  if (!match) return null;

  const [, age, sex, height, weight] = match;
  return {
    age: parseInt(age),
    gender: sex === 'F' ? 'female' : 'male',
    height: parseInt(height),
    weight: parseInt(weight),
    filename
  };
}

// Parse CSV line into VitalSigns object
function parseCSVLine(line: string): VitalSigns | null {
  const parts = line.split(',');
  if (parts.length < 10) return null;

  try {
    return {
      timestamp: parts[0],
      blood_loss_percent: parseFloat(parts[1]) || 0,
      pulse_bpm: parseInt(parts[2]) || 75,
      systolic_mmHg: parseInt(parts[3]) || 120,
      diastolic_mmHg: parseInt(parts[4]) || 80,
      resp_rate_bpm: parseInt(parts[5]) || 16,
      SpO2_percent: parseFloat(parts[6]) || 98,
      health_score: parseFloat(parts[7]) || 100,
      trend_score: parseFloat(parts[8]) || 0,
      alert_color: (parts[15] || parts[9] || "green") as "green" | "yellow" | "red" // Use alert_color column (15) or fallback
    };
  } catch (error) {
    console.error('Error parsing CSV line:', line, error);
    return null;
  }
}

// Load CSV data from public folder
export async function loadCSVData(filename: string): Promise<VitalSigns[]> {
  try {
    const response = await fetch(`/setup_data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    // Skip header line
    const dataLines = lines.slice(1);

    const vitals: VitalSigns[] = [];
    for (const line of dataLines) {
      const vital = parseCSVLine(line.trim());
      if (vital) {
        vitals.push(vital);
      }
    }

    // Apply alert detection algorithm to compute proper alert colors
    const vitalsWithAlerts = computeAlertColors(vitals);
    console.log(`Processed ${vitalsWithAlerts.length} vitals with alert detection for ${filename}`);

    return vitalsWithAlerts;
  } catch (error) {
    console.error(`Error loading CSV file ${filename}:`, error);
    return [];
  }
}

// Load all CSV data for available files
export async function loadAllPatientVitals(): Promise<Map<string, VitalSigns[]>> {
  const patientVitalsMap = new Map<string, VitalSigns[]>();

  try {
    const csvFiles = await getAvailableCSVFiles();

    for (const filename of csvFiles) {
      try {
        const vitals = await loadCSVData(filename);
        if (vitals.length > 0) {
          // Use filename as key for now, will be mapped to patient IDs later
          patientVitalsMap.set(filename, vitals);
          console.log(`Loaded ${vitals.length} vital signs from ${filename}`);
        }
      } catch (error) {
        console.error(`Failed to load vitals from ${filename}:`, error);
      }
    }
  } catch (error) {
    console.error('Error loading patient vitals:', error);
  }

  return patientVitalsMap;
}

// Load vitals for a specific patient by filename
export async function loadPatientVitalsByFilename(filename: string): Promise<VitalSigns[]> {
  try {
    return await loadCSVData(filename);
  } catch (error) {
    console.error(`Error loading vitals for ${filename}:`, error);
    return [];
  }
}

// Get patient vitals by UUID
export function getPatientVitals(patientId: string, vitalsMap: Map<string, VitalSigns[]>): VitalSigns[] {
  return vitalsMap.get(patientId) || [];
}

// Get current alert status from latest vitals
export function getCurrentAlertStatus(vitals: VitalSigns[]): "green" | "yellow" | "red" {
  if (vitals.length === 0) return "green";
  return vitals[vitals.length - 1].alert_color;
}
