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
  vitals: VitalSigns[];
}

export const sampleVitalData: VitalSigns[] = [
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

export const samplePatients: Patient[] = [
  {
    id: "1",
    name: "Dovzhenko",
    battleRoster: "TV-001",
    rank: "SGT",
    unit: "Alpha Company",
    age: 28,
    bloodType: "O+",
    allergies: ["Penicillin"],
    medications: ["Ibuprofen"],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "green",
    vitals: sampleVitalData
  },
  {
    id: "2", 
    name: "Rodriguez",
    battleRoster: "TV-002",
    rank: "CPL",
    unit: "Alpha Company",
    age: 25,
    bloodType: "A+",
    allergies: [],
    medications: [],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "green",
    vitals: sampleVitalData.map(v => ({ ...v, pulse_bpm: v.pulse_bpm + 5 }))
  },
  {
    id: "3",
    name: "Johnson",  
    battleRoster: "TV-003",
    rank: "PFC",
    unit: "Alpha Company", 
    age: 22,
    bloodType: "B+",
    allergies: ["Shellfish"],
    medications: ["Acetaminophen"],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "yellow",
    vitals: sampleVitalData.map(v => ({ ...v, pulse_bpm: v.pulse_bpm + 10, systolic_mmHg: v.systolic_mmHg + 15 }))
  },
  {
    id: "4",
    name: "Chen",
    battleRoster: "TV-004", 
    rank: "SPC",
    unit: "Bravo Company",
    age: 26,
    bloodType: "AB+",
    allergies: [],
    medications: [],
    lastUpdated: "2025-08-30T08:01:19.288911Z",
    status: "green",
    vitals: sampleVitalData.map(v => ({ ...v, pulse_bpm: v.pulse_bpm - 3 }))
  },
  {
    id: "5",
    name: "Williams",
    battleRoster: "TV-005",
    rank: "LT",
    unit: "HQ Company",
    age: 30,
    bloodType: "O-",
    allergies: ["Latex"],
    medications: ["Aspirin"],
    lastUpdated: "2025-08-30T08:01:19.288911Z", 
    status: "red",
    vitals: sampleVitalData.map(v => ({ ...v, pulse_bpm: v.pulse_bpm + 20, systolic_mmHg: v.systolic_mmHg - 20, blood_loss_percent: v.blood_loss_percent + 10 }))
  }
];