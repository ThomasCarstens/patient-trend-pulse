export interface VitalSigns {
  timestamp: string;
  blood_loss_percent: number;
  pulse_bpm: number;
  systolic_mmHg: number;
  diastolic_mmHg: number;
  resp_rate_bpm: number;
  SpO2_percent: number;
  health_score: number;
  trend_score: number;
  alert_color: 'green' | 'yellow' | 'red';
}

export type TriageCategory = 'critical' | 'immediate' | 'danger' | 'warning' | 'secondary' | 'unknown';

export interface Patient {
  id: string;
  name: string;
  battleRoster: string;
  rank?: string;
  unit?: string;
  age?: number;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  lastUpdated: string;
  status: 'green' | 'yellow' | 'red';
  triageCategory: TriageCategory;
  triagePriority: number; // 1-5, 1 being highest priority
  vitals: VitalSigns[];
  // Additional patient information
  gender?: 'male' | 'female';
  serviceNumber?: string;
  nextOfKin?: string;
  medicalHistory?: string[];
  currentCondition?: string;
  injuries?: string[];
  treatmentNotes?: string;
}

// Linear interpolation function
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Function to interpolate between two vital signs
function interpolateVitals(start: VitalSigns, end: VitalSigns, t: number): VitalSigns {
  const startTime = new Date(start.timestamp);
  const endTime = new Date(end.timestamp);
  const interpolatedTime = new Date(startTime.getTime() + (endTime.getTime() - startTime.getTime()) * t);

  // Add some realistic noise to make the data more natural
  const noise = () => (Math.random() - 0.5) * 0.1;

  return {
    timestamp: interpolatedTime.toISOString(),
    blood_loss_percent: Math.max(0, lerp(start.blood_loss_percent, end.blood_loss_percent, t) + noise()),
    pulse_bpm: Math.round(Math.max(40, lerp(start.pulse_bpm, end.pulse_bpm, t) + noise() * 2)),
    systolic_mmHg: Math.round(Math.max(60, lerp(start.systolic_mmHg, end.systolic_mmHg, t) + noise() * 3)),
    diastolic_mmHg: Math.round(Math.max(40, lerp(start.diastolic_mmHg, end.diastolic_mmHg, t) + noise() * 2)),
    resp_rate_bpm: Math.round(Math.max(8, lerp(start.resp_rate_bpm, end.resp_rate_bpm, t) + noise())),
    SpO2_percent: Math.round(Math.min(100, Math.max(70, lerp(start.SpO2_percent, end.SpO2_percent, t) + noise()))),
    health_score: Math.max(0, Math.min(100, lerp(start.health_score, end.health_score, t) + noise() * 0.5)),
    trend_score: lerp(start.trend_score, end.trend_score, t) + noise() * 0.02,
    alert_color: start.alert_color // Keep the same alert color for interpolated points
  };
}

// Function to create interpolated data with 10x more points
function createInterpolatedVitalData(originalData: VitalSigns[]): VitalSigns[] {
  const interpolatedData: VitalSigns[] = [];

  for (let i = 0; i < originalData.length - 1; i++) {
    const start = originalData[i];
    const end = originalData[i + 1];

    // Add the original point
    interpolatedData.push(start);

    // Add 9 interpolated points between each pair of original points
    for (let j = 1; j < 10; j++) {
      const t = j / 10;
      interpolatedData.push(interpolateVitals(start, end, t));
    }
  }

  // Add the last original point
  interpolatedData.push(originalData[originalData.length - 1]);

  return interpolatedData;
}

// Original sample data (24 points)
const originalSampleVitalData: VitalSigns[] = [
  { timestamp: "2025-08-30T07:38:19.288911Z", blood_loss_percent: 0, pulse_bpm: 75, systolic_mmHg: 120, diastolic_mmHg: 80, resp_rate_bpm: 16, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:39:19.288911Z", blood_loss_percent: 1, pulse_bpm: 76, systolic_mmHg: 120, diastolic_mmHg: 80, resp_rate_bpm: 16, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:40:19.288911Z", blood_loss_percent: 2, pulse_bpm: 78, systolic_mmHg: 120, diastolic_mmHg: 79, resp_rate_bpm: 17, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:41:19.288911Z", blood_loss_percent: 3, pulse_bpm: 79, systolic_mmHg: 120, diastolic_mmHg: 79, resp_rate_bpm: 17, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:42:19.288911Z", blood_loss_percent: 4, pulse_bpm: 80, systolic_mmHg: 120, diastolic_mmHg: 79, resp_rate_bpm: 17, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:43:19.288911Z", blood_loss_percent: 5, pulse_bpm: 82, systolic_mmHg: 120, diastolic_mmHg: 78, resp_rate_bpm: 17, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:44:19.288911Z", blood_loss_percent: 6, pulse_bpm: 83, systolic_mmHg: 120, diastolic_mmHg: 78, resp_rate_bpm: 18, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:45:19.288911Z", blood_loss_percent: 7, pulse_bpm: 84, systolic_mmHg: 120, diastolic_mmHg: 78, resp_rate_bpm: 18, SpO2_percent: 98, health_score: 100, trend_score: 0, alert_color: "green" },
  { timestamp: "2025-08-30T07:46:19.288911Z", blood_loss_percent: 8, pulse_bpm: 86, systolic_mmHg: 120, diastolic_mmHg: 77, resp_rate_bpm: 18, SpO2_percent: 98, health_score: 99.9, trend_score: -0.02, alert_color: "green" },
  { timestamp: "2025-08-30T07:47:19.288911Z", blood_loss_percent: 9, pulse_bpm: 87, systolic_mmHg: 120, diastolic_mmHg: 77, resp_rate_bpm: 18, SpO2_percent: 98, health_score: 99.9, trend_score: -0.02, alert_color: "green" },
  { timestamp: "2025-08-30T07:48:19.288911Z", blood_loss_percent: 10, pulse_bpm: 88, systolic_mmHg: 120, diastolic_mmHg: 77, resp_rate_bpm: 19, SpO2_percent: 98, health_score: 99.8, trend_score: -0.05, alert_color: "green" },
  { timestamp: "2025-08-30T07:49:19.288911Z", blood_loss_percent: 11, pulse_bpm: 90, systolic_mmHg: 120, diastolic_mmHg: 76, resp_rate_bpm: 19, SpO2_percent: 98, health_score: 99.8, trend_score: -0.05, alert_color: "green" },
  { timestamp: "2025-08-30T07:50:19.288911Z", blood_loss_percent: 12, pulse_bpm: 91, systolic_mmHg: 120, diastolic_mmHg: 76, resp_rate_bpm: 19, SpO2_percent: 98, health_score: 99.7, trend_score: -0.05, alert_color: "green" },
  { timestamp: "2025-08-30T07:51:19.288911Z", blood_loss_percent: 13, pulse_bpm: 92, systolic_mmHg: 120, diastolic_mmHg: 76, resp_rate_bpm: 19, SpO2_percent: 98, health_score: 99.7, trend_score: -0.05, alert_color: "green" },
  { timestamp: "2025-08-30T07:52:19.288911Z", blood_loss_percent: 14, pulse_bpm: 94, systolic_mmHg: 120, diastolic_mmHg: 75, resp_rate_bpm: 20, SpO2_percent: 98, health_score: 99.6, trend_score: -0.05, alert_color: "green" },
  { timestamp: "2025-08-30T07:53:19.288911Z", blood_loss_percent: 15, pulse_bpm: 95, systolic_mmHg: 120, diastolic_mmHg: 75, resp_rate_bpm: 20, SpO2_percent: 98, health_score: 99.5, trend_score: -0.07, alert_color: "green" },
  { timestamp: "2025-08-30T07:54:19.288911Z", blood_loss_percent: 16, pulse_bpm: 97, systolic_mmHg: 119, diastolic_mmHg: 75, resp_rate_bpm: 20, SpO2_percent: 98, health_score: 99.4, trend_score: -0.07, alert_color: "green" },
  { timestamp: "2025-08-30T07:55:19.288911Z", blood_loss_percent: 17, pulse_bpm: 98, systolic_mmHg: 119, diastolic_mmHg: 74, resp_rate_bpm: 21, SpO2_percent: 98, health_score: 99.0, trend_score: -0.18, alert_color: "green" },
  { timestamp: "2025-08-30T07:56:19.288911Z", blood_loss_percent: 18, pulse_bpm: 100, systolic_mmHg: 118, diastolic_mmHg: 74, resp_rate_bpm: 21, SpO2_percent: 98, health_score: 98.9, trend_score: -0.17, alert_color: "green" },
  { timestamp: "2025-08-30T07:57:19.288911Z", blood_loss_percent: 19, pulse_bpm: 102, systolic_mmHg: 117, diastolic_mmHg: 74, resp_rate_bpm: 22, SpO2_percent: 98, health_score: 97.9, trend_score: -0.4, alert_color: "green" },
  { timestamp: "2025-08-30T07:58:19.288911Z", blood_loss_percent: 20, pulse_bpm: 102, systolic_mmHg: 117, diastolic_mmHg: 74, resp_rate_bpm: 22, SpO2_percent: 98, health_score: 97.9, trend_score: -0.38, alert_color: "green" },
  { timestamp: "2025-08-30T07:59:19.288911Z", blood_loss_percent: 20, pulse_bpm: 102, systolic_mmHg: 117, diastolic_mmHg: 74, resp_rate_bpm: 22, SpO2_percent: 98, health_score: 97.9, trend_score: -0.27, alert_color: "green" },
  { timestamp: "2025-08-30T08:00:19.288911Z", blood_loss_percent: 20, pulse_bpm: 102, systolic_mmHg: 117, diastolic_mmHg: 74, resp_rate_bpm: 22, SpO2_percent: 98, health_score: 97.9, trend_score: -0.25, alert_color: "green" },
  { timestamp: "2025-08-30T08:01:19.288911Z", blood_loss_percent: 20, pulse_bpm: 102, systolic_mmHg: 117, diastolic_mmHg: 74, resp_rate_bpm: 22, SpO2_percent: 98, health_score: 97.9, trend_score: 0, alert_color: "green" }
];

// Create interpolated data with 10x more points (240 points total)
export const sampleVitalData: VitalSigns[] = createInterpolatedVitalData(originalSampleVitalData);

// Default vitals for patients without CSV data
export const defaultVitals: VitalSigns[] = [{
  timestamp: new Date().toISOString(),
  blood_loss_percent: 0,
  pulse_bpm: 75,
  systolic_mmHg: 120,
  diastolic_mmHg: 80,
  resp_rate_bpm: 16,
  SpO2_percent: 98,
  health_score: 100,
  trend_score: 0,
  alert_color: "green"
}];

export const samplePatients: Patient[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Williams",
    battleRoster: "TV-005",
    age: 30,
    bloodType: "O-",
    allergies: ["Latex"],
    medications: ["Aspirin"],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "red",
    triageCategory: "critical",
    triagePriority: 1,
    gender: "male",
    serviceNumber: "123-45-6789",
    nextOfKin: "Sarah Williams (Wife)",
    medicalHistory: ["Hypertension", "Previous concussion"],
    currentCondition: "Severe hemorrhagic shock, penetrating abdominal trauma",
    injuries: ["GSW to abdomen", "Suspected internal bleeding", "Class III hemorrhage"],
    treatmentNotes: "Requires immediate surgical intervention. Blood loss >30%. Hypotensive.",
    vitals: defaultVitals
  },
  {
    id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    name: "Johnson",
    battleRoster: "TV-003",
    age: 22,
    bloodType: "B+",
    allergies: ["Shellfish"],
    medications: ["Acetaminophen"],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "red",
    triageCategory: "immediate",
    triagePriority: 2,
    gender: "male",
    serviceNumber: "987-65-4321",
    nextOfKin: "Robert Johnson (Father)",
    medicalHistory: ["Asthma"],
    currentCondition: "Tension pneumothorax, respiratory distress",
    injuries: ["Blast injury to chest", "Pneumothorax", "Multiple rib fractures"],
    treatmentNotes: "Needle decompression performed. Requires chest tube placement.",
    vitals: defaultVitals
  },
  {
    id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
    name: "Martinez",
    battleRoster: "TV-007",
    age: 24,
    bloodType: "A+",
    allergies: [],
    medications: [],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "yellow",
    triageCategory: "unknown",
    triagePriority: 6,
    gender: "male",
    serviceNumber: "456-78-9123",
    nextOfKin: "Unknown",
    medicalHistory: ["None significant"],
    currentCondition: "Awaiting assessment",
    injuries: ["Unknown injuries"],
    treatmentNotes: "",
    vitals: defaultVitals
  },
  {
    id: "d4e5f6g7-h8i9-0123-defg-456789012345",
    name: "Rodriguez",
    battleRoster: "TV-002",
    age: 25,
    bloodType: "A+",
    allergies: [],
    medications: [],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "yellow",
    triageCategory: "danger",
    triagePriority: 3,
    gender: "female",
    serviceNumber: "456-78-9123",
    nextOfKin: "Carlos Rodriguez (Husband)",
    medicalHistory: ["None significant"],
    currentCondition: "Moderate blood loss, stable but requires monitoring",
    injuries: ["Shrapnel wounds to extremities", "Moderate hemorrhage"],
    treatmentNotes: "Tourniquets applied. Hemostatic agents used. Stable for transport.",
    vitals: defaultVitals
  },
  {
    id: "e5f6g7h8-i9j0-1234-efgh-567890123456",
    name: "Thompson",
    battleRoster: "TV-008",
    age: 19,
    bloodType: "B-",
    allergies: [],
    medications: [],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "yellow",
    triageCategory: "unknown",
    triagePriority: 6,
    gender: "male",
    serviceNumber: "234-56-7890",
    nextOfKin: "Unknown",
    medicalHistory: ["None significant"],
    currentCondition: "Awaiting assessment",
    injuries: ["Visible trauma to lower extremities"],
    treatmentNotes: "",
    vitals: defaultVitals
  },
  {
    id: "f6g7h8i9-j0k1-2345-fghi-678901234567",
    name: "Chen",
    battleRoster: "TV-004",
    age: 26,
    bloodType: "AB+",
    allergies: [],
    medications: [],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "yellow",
    triageCategory: "warning",
    triagePriority: 4,
    gender: "male",
    serviceNumber: "789-12-3456",
    nextOfKin: "Linda Chen (Mother)",
    medicalHistory: ["Allergic rhinitis"],
    currentCondition: "Minor injuries, ambulatory, psychological trauma",
    injuries: ["Superficial lacerations", "Mild concussion", "Tinnitus"],
    treatmentNotes: "Wounds cleaned and dressed. Neurological assessment normal. Monitor for delayed symptoms.",
    vitals: defaultVitals
  },
  {
    id: "g7h8i9j0-k1l2-3456-ghij-789012345678",
    name: "Dovzhenko",
    battleRoster: "TV-001",
    age: 28,
    bloodType: "O+",
    allergies: ["Penicillin"],
    medications: ["Ibuprofen"],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "green",
    triageCategory: "secondary",
    triagePriority: 5,
    gender: "male",
    serviceNumber: "321-54-9876",
    nextOfKin: "Anna Dovzhenko (Wife)",
    medicalHistory: ["Previous knee surgery"],
    currentCondition: "Minor injuries, fully ambulatory",
    injuries: ["Minor abrasions", "Bruised ribs"],
    treatmentNotes: "Walking wounded. Basic first aid applied. Can assist with other casualties.",
    vitals: defaultVitals
  }
];