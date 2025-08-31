import { VitalSigns } from "@/data/medicalData";

export interface CSVVitalData {
  patientId: string;
  filename: string;
  vitals: VitalSigns[];
}

// CSV file mapping to patient UUIDs
const CSV_PATIENT_MAPPING = {
  "hemorrhage_alerts_tq.csv": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // Williams - Critical
  "hemorrhage_alerts_tq copy.csv": "b2c3d4e5-f6g7-8901-bcde-f23456789012", // Johnson - Immediate
  "hemorrhage_alerts_tq copy 2.csv": "c3d4e5f6-g7h8-9012-cdef-345678901234", // Martinez - Unknown
  "hemorrhage_alerts_tq copy 3.csv": "d4e5f6g7-h8i9-0123-defg-456789012345", // Rodriguez - Danger
  "hemorrhage_alerts_tq copy 4.csv": "e5f6g7h8-i9j0-1234-efgh-567890123456", // Thompson - Unknown
  "hemorrhage_alerts_tq copy 5.csv": "f6g7h8i9-j0k1-2345-fghi-678901234567", // Chen - Warning
  "hemorrhage_alerts_tq copy 6.csv": "g7h8i9j0-k1l2-3456-ghij-789012345678", // Dovzhenko - Secondary
};

// Parse CSV line into VitalSigns object
function parseCSVLine(line: string): VitalSigns | null {
  const parts = line.split(',');
  if (parts.length !== 10) return null;
  
  try {
    return {
      timestamp: parts[0],
      blood_loss_percent: parseFloat(parts[1]),
      pulse_bpm: parseInt(parts[2]),
      systolic_mmHg: parseInt(parts[3]),
      diastolic_mmHg: parseInt(parts[4]),
      resp_rate_bpm: parseInt(parts[5]),
      SpO2_percent: parseFloat(parts[6]),
      health_score: parseFloat(parts[7]),
      trend_score: parseFloat(parts[8]),
      alert_color: parts[9] as "green" | "yellow" | "red"
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
    
    return vitals;
  } catch (error) {
    console.error(`Error loading CSV file ${filename}:`, error);
    return [];
  }
}

// Load all CSV data mapped to patient UUIDs
export async function loadAllPatientVitals(): Promise<Map<string, VitalSigns[]>> {
  const patientVitalsMap = new Map<string, VitalSigns[]>();
  
  for (const [filename, patientId] of Object.entries(CSV_PATIENT_MAPPING)) {
    try {
      const vitals = await loadCSVData(filename);
      if (vitals.length > 0) {
        patientVitalsMap.set(patientId, vitals);
        console.log(`Loaded ${vitals.length} vital signs for patient ${patientId} from ${filename}`);
      }
    } catch (error) {
      console.error(`Failed to load vitals for patient ${patientId} from ${filename}:`, error);
    }
  }
  
  return patientVitalsMap;
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
