import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { 
  TCCCPatientData, 
  CurrentVitals, 
  Alert, 
  VitalStatus, 
  TreatmentSection,
  MedicationField,
  FluidField
} from "@/types/tccc";

// Initial patient data
const initialPatientData: TCCCPatientData = {
  battleRoster: "",
  name: "",
  patientId: "",
  gender: "",
  date: "",
  time: "",
  service: "",
  unit: "",
  allergies: "",
  evacPriority: "",
  mechanismOfInjury: [],
  injuryDrawings: {
    front: "",
    back: ""
  },
  tourniquets: {
    rightArm: ["", ""],
    leftArm: ["", ""],
    rightLeg: ["", ""],
    leftLeg: ["", ""]
  },
  vitalSigns: {
    pulse: ["", "", "", ""],
    bloodPressureSystolic: ["", "", "", ""],
    bloodPressureDiastolic: ["", "", "", ""],
    respiratoryRate: ["", "", "", ""],
    oxygenSaturation: ["", "", "", ""],
    avpu: ["", "", "", ""],
    painScale: ["", "", "", ""]
  },
  treatments: {
    tq: [],
    dressing: [],
    type: "",
    airway: [],
    breathing: [],
    fluids: [
      { name: "", volume: "", route: "", time: "" },
      { name: "", volume: "", route: "", time: "" }
    ],
    meds: [
      { name: "", dose: "", route: "", time: "" },
      { name: "", dose: "", route: "", time: "" },
      { name: "", dose: "", route: "", time: "" }
    ],
    other: [],
    otherType: ""
  },
  notes: "",
  firstResponderName: "",
  firstResponderLast4: ""
};

// Initial mock data for vitals
const initialVitals: CurrentVitals = {
  heartRate: 85,
  heartRateStatus: VitalStatus.Normal,
  heartRateTrend: [85, 84, 86, 85, 85],
  
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  bloodPressureStatus: VitalStatus.Normal,
  bloodPressureTrend: [120, 119, 121, 120, 120],
  
  respiratoryRate: 16,
  respiratoryRateStatus: VitalStatus.Normal,
  respiratoryRateTrend: [16, 15, 16, 16, 16],
  
  oxygenSaturation: 98,
  oxygenSaturationStatus: VitalStatus.Normal,
  oxygenSaturationTrend: [98, 98, 99, 98, 98],
  
  avpu: "A",
  painScale: 0
};

interface TCCCContextValue {
  patientData: TCCCPatientData;
  currentVitals: CurrentVitals;
  alerts: Alert[];
  createNewPatient: () => void;
  loadPatient: (id: string) => Promise<void>;
  updatePatientData: (field: string, value: string) => void;
  updateEvacPriority: (priority: string) => void;
  updateGender: (gender: string) => void;
  updateMechanismOfInjury: (mechanism: string) => void;
  updateInjuryDrawing: (side: 'front' | 'back', dataUrl: string) => void;
  updateTourniquetField: (limb: string, index: number, value: string) => void;
  updateVitalSigns: (vitalSign: string, column: number, value: string) => void;
  updateTreatmentCheckbox: (section: TreatmentSection, value: string) => void;
  updateTreatmentField: (field: string, value: string) => void;
  updateFluidField: (index: number, field: keyof FluidField, value: string) => void;
  updateMedField: (index: number, field: keyof MedicationField, value: string) => void;
  updateNotesField: (value: string) => void;
  savePatientRecord: () => Promise<void>;
  printCard: () => void;
  sendCard: () => Promise<void>;
}

// Create context
const TCCCContext = createContext({} as TCCCContextValue);

interface TCCCProviderProps {
  children: ReactNode;
}

export const TCCCProvider: React.FC<TCCCProviderProps> = ({ children }) => {
  const [patientData, setPatientData] = useState<TCCCPatientData>(initialPatientData);
  const [currentVitals] = useState<CurrentVitals>(initialVitals);
  const [alerts] = useState<Alert[]>([
    { message: "Patient data initialized", type: "info", timestamp: new Date() }
  ]);

  // Create new patient
  const createNewPatient = useCallback(() => {
    setPatientData({
      ...initialPatientData,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });
  }, []);

  // Load patient (mock implementation)
  const loadPatient = useCallback(async (id: string) => {
    // In a real app, this would load from IndexedDB or API
    console.log(`Loading patient ${id}`);
  }, []);

  // Update patient data
  const updatePatientData = useCallback((field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Update evacuation priority
  const updateEvacPriority = useCallback((priority: string) => {
    setPatientData(prev => ({
      ...prev,
      evacPriority: priority
    }));
  }, []);

  // Update gender
  const updateGender = useCallback((gender: string) => {
    setPatientData(prev => ({
      ...prev,
      gender
    }));
  }, []);

  // Update mechanism of injury
  const updateMechanismOfInjury = useCallback((mechanism: string) => {
    setPatientData(prev => ({
      ...prev,
      mechanismOfInjury: prev.mechanismOfInjury.includes(mechanism)
        ? prev.mechanismOfInjury.filter(m => m !== mechanism)
        : [...prev.mechanismOfInjury, mechanism]
    }));
  }, []);

  // Update injury drawing
  const updateInjuryDrawing = useCallback((side: 'front' | 'back', dataUrl: string) => {
    setPatientData(prev => ({
      ...prev,
      injuryDrawings: {
        ...prev.injuryDrawings,
        [side]: dataUrl
      }
    }));
  }, []);

  // Update tourniquet field
  const updateTourniquetField = useCallback((limb: string, index: number, value: string) => {
    setPatientData(prev => ({
      ...prev,
      tourniquets: {
        ...prev.tourniquets,
        [limb]: prev.tourniquets[limb as keyof typeof prev.tourniquets].map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  }, []);

  // Update vital signs
  const updateVitalSigns = useCallback((vitalSign: string, column: number, value: string) => {
    setPatientData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [vitalSign]: prev.vitalSigns[vitalSign as keyof typeof prev.vitalSigns].map((item, i) => 
          i === column ? value : item
        )
      }
    }));
  }, []);

  // Update treatment checkbox
  const updateTreatmentCheckbox = useCallback((section: TreatmentSection, value: string) => {
    setPatientData(prev => ({
      ...prev,
      treatments: {
        ...prev.treatments,
        [section]: prev.treatments[section].includes(value)
          ? prev.treatments[section].filter((item: string) => item !== value)
          : [...prev.treatments[section], value]
      }
    }));
  }, []);

  // Update treatment field
  const updateTreatmentField = useCallback((field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      treatments: {
        ...prev.treatments,
        [field]: value
      }
    }));
  }, []);

  // Update fluid field
  const updateFluidField = useCallback((index: number, field: keyof FluidField, value: string) => {
    setPatientData(prev => ({
      ...prev,
      treatments: {
        ...prev.treatments,
        fluids: prev.treatments.fluids.map((fluid, i) => 
          i === index ? { ...fluid, [field]: value } : fluid
        )
      }
    }));
  }, []);

  // Update medication field
  const updateMedField = useCallback((index: number, field: keyof MedicationField, value: string) => {
    setPatientData(prev => ({
      ...prev,
      treatments: {
        ...prev.treatments,
        meds: prev.treatments.meds.map((med, i) => 
          i === index ? { ...med, [field]: value } : med
        )
      }
    }));
  }, []);

  // Update notes field
  const updateNotesField = useCallback((value: string) => {
    setPatientData(prev => ({
      ...prev,
      notes: value
    }));
  }, []);

  // Save patient record
  const savePatientRecord = useCallback(async () => {
    console.log('Saving patient record:', patientData);
    // In a real app, this would save to IndexedDB or API
  }, [patientData]);

  // Print card
  const printCard = useCallback(() => {
    console.log('Printing TCCC card');
    window.print();
  }, []);

  // Send card
  const sendCard = useCallback(async () => {
    console.log('Sending TCCC card');
    // In a real app, this would send via API
  }, []);

  const contextValue = {
    patientData,
    currentVitals,
    alerts,
    createNewPatient,
    loadPatient,
    updatePatientData,
    updateEvacPriority,
    updateGender,
    updateMechanismOfInjury,
    updateInjuryDrawing,
    updateTourniquetField,
    updateVitalSigns,
    updateTreatmentCheckbox,
    updateTreatmentField,
    updateFluidField,
    updateMedField,
    updateNotesField,
    savePatientRecord,
    printCard,
    sendCard
  };

  return (
    <TCCCContext.Provider value={contextValue}>
      {children}
    </TCCCContext.Provider>
  );
};

export const useTCCCContext = () => useContext(TCCCContext);
