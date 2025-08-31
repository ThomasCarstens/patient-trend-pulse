// TCCC Card Types
export interface TCCCPatientData {
  battleRoster: string;
  name: string;
  patientId: string;
  gender: string;
  date: string;
  time: string;
  service: string;
  unit: string;
  allergies: string;
  evacPriority: string;
  mechanismOfInjury: string[];
  injuryDrawings: {
    front: string;
    back: string;
  };
  tourniquets: {
    rightArm: string[];
    leftArm: string[];
    rightLeg: string[];
    leftLeg: string[];
  };
  vitalSigns: {
    pulse: string[];
    bloodPressureSystolic: string[];
    bloodPressureDiastolic: string[];
    respiratoryRate: string[];
    oxygenSaturation: string[];
    avpu: string[];
    painScale: string[];
  };
  treatments: {
    tq: string[];
    dressing: string[];
    type: string;
    airway: string[];
    breathing: string[];
    fluids: FluidField[];
    meds: MedicationField[];
    other: string[];
    otherType: string;
  };
  notes: string;
  firstResponderName: string;
  firstResponderLast4: string;
}

export interface CurrentVitals {
  heartRate: number;
  heartRateStatus: VitalStatus;
  heartRateTrend: number[];
  
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodPressureStatus: VitalStatus;
  bloodPressureTrend: number[];
  
  respiratoryRate: number;
  respiratoryRateStatus: VitalStatus;
  respiratoryRateTrend: number[];
  
  oxygenSaturation: number;
  oxygenSaturationStatus: VitalStatus;
  oxygenSaturationTrend: number[];
  
  avpu: string;
  painScale: number;
}

export interface Alert {
  message: string;
  type: "info" | "warning" | "critical";
  timestamp: Date;
}

export enum VitalStatus {
  Normal = "normal",
  Warning = "warning",
  Critical = "critical"
}

export type TreatmentSection = "tq" | "dressing" | "airway" | "breathing" | "other";

export interface MedicationField {
  name: string;
  dose: string;
  route: string;
  time: string;
}

export interface FluidField {
  name: string;
  volume: string;
  route: string;
  time: string;
}
