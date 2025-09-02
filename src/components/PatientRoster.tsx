import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Activity, FileText, X, Plus, Eye, EyeOff, Heart, Stethoscope } from "lucide-react";
import { Patient, generatePatientsFromCSV, defaultVitals, VitalSigns } from "@/data/medicalData";
import { TCCCProvider } from "@/contexts/TCCCContext";
import TCCCCardContainer from "./tccc/TCCCCardContainer";
import { loadPatientVitalsByFilename } from "@/utils/csvLoader";
import { computeSingleAlertColor } from "@/utils/alertDetection";
import QRCode from "qrcode";

interface PatientRosterProps {
  onSelectPatient: (patient: Patient, view: 'tccc' | 'vitals') => void;
  onClose: () => void;
}

export function PatientRoster({ onSelectPatient, onClose }: PatientRosterProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showTCCCCard, setShowTCCCCard] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingState, setStreamingState] = useState<'stopped' | 'streaming' | 'finished'>('stopped');
  const [streamingProgress, setStreamingProgress] = useState<number>(0);
  const [patientVitalsMap, setPatientVitalsMap] = useState<Map<string, VitalSigns[]>>(new Map());
  const [currentVitalIndex, setCurrentVitalIndex] = useState<Map<string, number>>(new Map());


  // Function to restart the datastream
  const restartDatastream = useCallback(() => {
    // Reset all patient vital indices to 0 (start from beginning)
    const resetIndexMap = new Map<string, number>();
    for (const patientId of patientVitalsMap.keys()) {
      resetIndexMap.set(patientId, 0);
    }
    setCurrentVitalIndex(resetIndexMap);

    // Reset patients to their initial state with first vital signs
    setPatients(prevPatients => {
      const resetPatients = prevPatients.map(patient => {
        const vitals = patientVitalsMap.get(patient.id);
        if (vitals && vitals.length > 0) {
          const firstVital = vitals[0];
          const alertColor = firstVital.alert_color;

          // Map alert colors to status and triage
          let status: "green" | "yellow" | "red" = 'green';
          let triageCategory = patient.triageCategory;
          let triagePriority = patient.triagePriority;

          switch (alertColor) {
            case 'brown':
              status = 'red';
              triageCategory = 'critical';
              triagePriority = 1;
              break;
            case 'red':
              status = 'red';
              triageCategory = 'immediate';
              triagePriority = 2;
              break;
            case 'orange':
              status = 'yellow';
              triageCategory = 'danger';
              triagePriority = 3;
              break;
            case 'yellow':
              status = 'yellow';
              triageCategory = 'warning';
              triagePriority = 4;
              break;
            case 'white':
              status = 'green';
              triageCategory = 'secondary';
              triagePriority = 5;
              break;
          }

          return {
            ...patient,
            status,
            triageCategory,
            triagePriority,
            vitals: [firstVital],
            lastUpdated: new Date().toISOString()
          };
        }
        return patient;
      });

      // Sort by triage priority
      return resetPatients.sort((a, b) => a.triagePriority - b.triagePriority);
    });

    // Start streaming
    setIsStreaming(true);
    setStreamingState('streaming');
  }, [patientVitalsMap]);

  const handleTCCCCardOpen = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowTCCCCard(true);
  };

  const handleTCCCCardClose = () => {
    setShowTCCCCard(false);
    setSelectedPatient(null);
  };

  // Load patients dynamically from CSV files and their vitals data
  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const dynamicPatients = await generatePatientsFromCSV();

        // Add two permanent "Unknown" patients
        const unknownPatients: Patient[] = [
          {
            id: "unknown-patient-1",
            name: "Невідомий",
            battleRoster: "TV-UNK1",
            age: 25,
            bloodType: "Unknown",
            allergies: [],
            medications: [],
            lastUpdated: new Date().toISOString(),
            status: "yellow",
            triageCategory: "unknown",
            triagePriority: 6,
            gender: "male",
            serviceNumber: "UNK-00-0001",
            nextOfKin: "Unknown",
            medicalHistory: [],
            currentCondition: "Awaiting assessment",
            injuries: ["Unknown injuries"],
            treatmentNotes: "",
            vitals: defaultVitals,
            treatmentLastChecked: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(), // Random time within last hour
            consciousnessLastChecked: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString() // Random time within last 30 minutes
          },
          {
            id: "unknown-patient-2",
            name: "Невідома",
            battleRoster: "TV-UNK2",
            age: 30,
            bloodType: "Unknown",
            allergies: [],
            medications: [],
            lastUpdated: new Date().toISOString(),
            status: "yellow",
            triageCategory: "unknown",
            triagePriority: 6,
            gender: "female",
            serviceNumber: "UNK-00-0002",
            nextOfKin: "Unknown",
            medicalHistory: [],
            currentCondition: "Awaiting assessment",
            injuries: ["Unknown injuries"],
            treatmentNotes: "",
            vitals: defaultVitals,
            treatmentLastChecked: new Date(Date.now() - Math.random() * 90 * 60 * 1000).toISOString(), // Random time within last 90 minutes
            consciousnessLastChecked: new Date(Date.now() - Math.random() * 45 * 60 * 1000).toISOString() // Random time within last 45 minutes
          }
        ];

        const allPatients = [...dynamicPatients, ...unknownPatients];
        setPatients(allPatients);

        // Load vitals data for each patient
        const vitalsMap = new Map<string, VitalSigns[]>();
        const indexMap = new Map<string, number>();

        for (const patient of dynamicPatients) {
          if (patient.csvFilename) {
            try {
              const vitals = await loadPatientVitalsByFilename(patient.csvFilename);
              if (vitals.length > 0) {
                vitalsMap.set(patient.id, vitals);
                indexMap.set(patient.id, 0); // Start at beginning
              }
            } catch (error) {
              console.error(`Error loading vitals for ${patient.name}:`, error);
            }
          }
        }

        setPatientVitalsMap(vitalsMap);
        setCurrentVitalIndex(indexMap);
        setStreamingState('streaming');
        setStreamingProgress(0);
        setIsStreaming(true); // Start 1Hz streaming

        console.log(`Loaded ${dynamicPatients.length} patients with vitals data`);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  // 5Hz streaming effect to update patient vitals and rankings
  useEffect(() => {
    if (!isStreaming || patientVitalsMap.size === 0) return;

    const interval = setInterval(() => {
      setCurrentVitalIndex(prevIndexMap => {
        const newIndexMap = new Map(prevIndexMap);
        let hasUpdates = false;

        // Update each patient's current vital index and calculate progress
        let allPatientsFinished = true;
        let totalProgress = 0;
        let patientCount = 0;

        for (const [patientId, currentIndex] of prevIndexMap.entries()) {
          const vitals = patientVitalsMap.get(patientId);
          if (vitals && currentIndex < vitals.length - 1) {
            newIndexMap.set(patientId, currentIndex + 1);
            hasUpdates = true;
            allPatientsFinished = false;
          } else if (vitals && currentIndex >= vitals.length - 1) {
            // Patient has reached the end of their data
            allPatientsFinished = allPatientsFinished && true;
          }

          // Calculate progress for this patient
          if (vitals && vitals.length > 0) {
            const progress = Math.min(100, ((currentIndex + 1) / vitals.length) * 100);
            totalProgress += progress;
            patientCount++;
          }
        }

        // Update streaming progress
        if (patientCount > 0) {
          const averageProgress = Math.round(totalProgress / patientCount);
          setStreamingProgress(averageProgress);
        }

        // Check if all patients have finished streaming
        if (allPatientsFinished && hasUpdates === false) {
          setIsStreaming(false);
          setStreamingState('finished');
          setStreamingProgress(100);
        }

        // Update patient statuses and rankings if there were changes
        if (hasUpdates) {
          setPatients(prevPatients => {
            const updatedPatients = prevPatients.map(patient => {
              const vitals = patientVitalsMap.get(patient.id);
              const currentIndex = newIndexMap.get(patient.id) || 0;

              if (vitals && vitals[currentIndex]) {
                const currentVital = vitals[currentIndex];
                const alertColor = currentVital.alert_color;

                // Map alert colors to status and triage
                let status: "green" | "yellow" | "red" = 'green';
                let triageCategory = patient.triageCategory;
                let triagePriority = patient.triagePriority;

                switch (alertColor) {
                  case 'brown':
                    status = 'red';
                    triageCategory = 'critical';
                    triagePriority = 1;
                    break;
                  case 'red':
                    status = 'red';
                    triageCategory = 'immediate';
                    triagePriority = 2;
                    break;
                  case 'orange':
                    status = 'yellow';
                    triageCategory = 'danger';
                    triagePriority = 3;
                    break;
                  case 'yellow':
                    status = 'yellow';
                    triageCategory = 'warning';
                    triagePriority = 4;
                    break;
                  case 'white':
                    status = 'green';
                    triageCategory = 'secondary';
                    triagePriority = 5;
                    break;
                }

                return {
                  ...patient,
                  status,
                  triageCategory,
                  triagePriority,
                  vitals: [currentVital], // Update with current vital
                  lastUpdated: new Date().toISOString()
                };
              }
              return patient;
            });

            // Sort by triage priority (dynamic ranking)
            return updatedPatients.sort((a, b) => a.triagePriority - b.triagePriority);
          });
        }

        return newIndexMap;
      });
    }, 1000); // 1Hz = 1000ms intervals

    return () => clearInterval(interval);
  }, [isStreaming, patientVitalsMap]);



  // Generate QR codes for all patients when patients change
  useEffect(() => {
    patients.forEach(patient => {
      generateQRCode(patient.id);
    });
  }, [patients]);

  const getTriageColor = (category: string) => {
    switch (category) {
      case 'critical': return 'bg-amber-800 text-white'; // Brown
      case 'immediate': return 'bg-red-600 text-white'; // Red
      case 'danger': return 'bg-orange-500 text-white'; // Orange
      case 'warning': return 'bg-yellow-500 text-black'; // Yellow
      case 'secondary': return 'bg-white text-black border border-gray-300'; // White
      case 'unknown': return 'bg-green-800 text-white'; // Camo green
      default: return 'bg-gray-500 text-white';
    }
  };

  // Helper function to calculate minutes since last check
  const getMinutesSince = (timestamp?: string): number => {
    if (!timestamp) return 0;
    const now = new Date();
    const lastCheck = new Date(timestamp);
    return Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60));
  };

  // Helper function to get vital status color
  const getVitalStatus = (value: number | undefined, type: string): string => {
    if (!value) return 'text-gray-400';

    switch (type) {
      case 'pulse':
        if (value > 100) return 'text-red-400';
        if (value > 90) return 'text-yellow-400';
        return 'text-green-400';
      case 'spo2':
        if (value < 90) return 'text-red-400';
        if (value < 95) return 'text-yellow-400';
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };



  const getTriageBorderColor = (category: string) => {
    switch (category) {
      case 'critical': return 'border-l-amber-800';
      case 'immediate': return 'border-l-red-600';
      case 'danger': return 'border-l-orange-500';
      case 'warning': return 'border-l-yellow-500';
      case 'secondary': return 'border-l-gray-300';
      case 'unknown': return 'border-l-black';
      default: return 'border-l-gray-500';
    }
  };

  // Get alert color indicator based on current vitals
  const getAlertColorIndicator = (patient: Patient) => {
    if (patient.vitals && patient.vitals.length > 0) {
      const currentVital = patient.vitals[patient.vitals.length - 1];
      const alertColor = currentVital.alert_color;

      switch (alertColor) {
        case 'brown': return 'bg-amber-800'; // Brown
        case 'red': return 'bg-red-600'; // Red
        case 'orange': return 'bg-orange-500'; // Orange
        case 'yellow': return 'bg-yellow-500'; // Yellow
        case 'white': return 'bg-white border border-gray-300'; // White
        default: return 'bg-gray-500';
      }
    }
    return 'bg-gray-500';
  };

  const generateQRCode = async (patientId: string) => {
    try {
      const qrData = JSON.stringify({
        id: patientId,
        timestamp: new Date().toISOString(),
        type: "patient_record"
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 64,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeData(prev => ({ ...prev, [patientId]: qrCodeUrl }));
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };



  const createNewPatient = () => {
    const newPatientId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newPatient: Patient = {
      id: newPatientId,
      name: "Невідомий",
      battleRoster: `TV-${String(patients.length + 1).padStart(3, '0')}`,
      age: 25,
      bloodType: "O+",
      allergies: [],
      medications: [],
      lastUpdated: new Date().toISOString(),
      status: "yellow",
      triageCategory: "unknown",
      triagePriority: 6,
      gender: "male",
      serviceNumber: "000-00-0000",
      nextOfKin: "Unknown",
      medicalHistory: [],
      currentCondition: "Awaiting assessment",
      injuries: [],
      treatmentNotes: "",
      vitals: defaultVitals,
      treatmentLastChecked: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(), // Random time within last hour
      consciousnessLastChecked: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString() // Random time within last 30 minutes
    };

    setPatients(prev => [...prev, newPatient].sort((a, b) => a.triagePriority - b.triagePriority));
    generateQRCode(newPatientId);
    handleTCCCCardOpen(newPatient);
  };

  if (showTCCCCard && selectedPatient) {
    return (
      <TCCCProvider>
        <TCCCCardContainer onBack={handleTCCCCardClose} />
      </TCCCProvider>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gray-900 border-b border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Patient Roster</h1>
                <p className="text-gray-400 text-sm">Live Medical Status Dashboard</p>
              </div>

              <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-3 py-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  streamingState === 'streaming' ? 'bg-green-400 animate-pulse' :
                  streamingState === 'finished' ? 'bg-yellow-400' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm text-gray-300 font-medium">
                  {streamingState === 'streaming' ? `Streaming ${streamingProgress}%` :
                   streamingState === 'finished' ? 'Stopped' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={restartDatastream}
                className={`${
                  streamingState === 'streaming'
                    ? 'text-green-400 hover:bg-green-600'
                    : streamingState === 'finished'
                    ? 'text-yellow-400 hover:bg-yellow-600'
                    : 'text-green-400 hover:bg-green-600'
                } hover:text-white transition-colors`}
              >
                <Activity className="w-4 h-4 mr-2" />
                {streamingState === 'streaming' ? `Streaming ${streamingProgress}%` : streamingState === 'finished' ? 'Restart Stream' : 'Start Streaming'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPatientInfo(!showPatientInfo)}
                className="text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
              >
                {showPatientInfo ? 'Show Less Information' : 'Show More Information'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={createNewPatient}
                className="text-green-400 hover:text-white hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Patient
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[calc(80vh-80px)] medical-table-scroll">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-gray-700 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Triage</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Patient</th>
                    {showPatientInfo && (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Details</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Condition</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Last Checks</th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Vitals Data</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const latestVitals = patient.vitals[patient.vitals.length - 1];

                    return (
                      <tr key={patient.id} className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors border-l-4 ${getTriageBorderColor(patient.triageCategory)}`}>
                        {/* Enhanced Triage Category - Now First Column */}
                        <td className="py-5 px-4">
                          <div className="space-y-2">
                            <Badge className={`text-sm font-bold px-3 py-1 shadow-sm ${getTriageColor(patient.triageCategory)}`}>
                              {patient.triageCategory.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-400 font-medium">Priority {patient.triagePriority}</div>
                          </div>
                        </td>

                        {/* Enhanced Patient Info - Now Second Column */}
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-white text-lg flex items-center gap-3">
                                {patient.name}
                                {/* Enhanced real-time alert indicator */}
                                <div className={`w-3 h-3 rounded-full shadow-sm ${getAlertColorIndicator(patient)} ${isStreaming ? 'animate-pulse' : ''}`} title="Real-time alert status"></div>
                              </div>
                              <div className="text-sm text-gray-300 font-medium">{patient.battleRoster}</div>
                              <div className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
                                {patient.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Conditional Patient Details */}
                        {showPatientInfo && (
                          <>
                            <td className="py-4 px-4">
                              <div className="space-y-1 text-xs">
                                <div className="text-white font-medium">{patient.age}y {patient.gender?.charAt(0).toUpperCase()}</div>
                                <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-xs inline-block">
                                  {patient.bloodType}
                                </div>
                                <div className="text-gray-400">
                                  {patient.allergies?.length ? `Allergies: ${patient.allergies.join(', ')}` : 'No allergies'}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1 text-xs">
                                <div className="text-white font-medium">{patient.currentCondition}</div>
                                <div className="text-gray-300">
                                  {patient.injuries?.slice(0, 2).map((injury, i) => (
                                    <div key={i}>• {injury}</div>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Treatment:</span>
                                  <span className={`font-bold px-2 py-1 rounded ${
                                    getMinutesSince(patient.treatmentLastChecked) > 60 ? 'text-red-400 bg-red-950' :
                                    getMinutesSince(patient.treatmentLastChecked) > 30 ? 'text-yellow-400 bg-yellow-950' :
                                    'text-green-400 bg-green-950'
                                  }`}>
                                    {getMinutesSince(patient.treatmentLastChecked)}m ago
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Consciousness:</span>
                                  <span className={`font-bold px-2 py-1 rounded ${
                                    getMinutesSince(patient.consciousnessLastChecked) > 30 ? 'text-red-400 bg-red-950' :
                                    getMinutesSince(patient.consciousnessLastChecked) > 15 ? 'text-yellow-400 bg-yellow-950' :
                                    'text-green-400 bg-green-950'
                                  }`}>
                                    {getMinutesSince(patient.consciousnessLastChecked)}m ago
                                  </span>
                                </div>
                              </div>
                            </td>
                          </>
                        )}

                        {/* Enhanced Vitals Column */}
                        <td className="py-5 px-4">
                          {patient.triageCategory === 'unknown' ? (
                            <div
                              className="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600"
                              onClick={() => onSelectPatient(patient, 'vitals')}
                              title="Click to view vitals"
                            >
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Stethoscope className="w-5 h-5 text-gray-400" />
                                <span className="font-bold text-gray-300">Not Connected</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                No sensor data available
                              </div>
                            </div>
                          ) : (
                            <div
                              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600 hover:border-blue-500"
                              onClick={() => onSelectPatient(patient, 'vitals')}
                              title="Click to view vitals"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Heart className={`w-4 h-4 ${getVitalStatus(latestVitals?.pulse_bpm, 'pulse')}`} />
                                    <span className={`text-lg font-bold ${getVitalStatus(latestVitals?.pulse_bpm, 'pulse')}`}>
                                      {latestVitals?.pulse_bpm}
                                    </span>
                                    <span className="text-xs text-gray-400">BPM</span>
                                  </div>

                                  <div className="flex items-end gap-1 h-6">
                                    {patient.vitals.slice(-8).map((vital, i) => {
                                      const height = Math.max(4, Math.min(24, (vital.pulse_bpm - 40) / 4));
                                      return (
                                        <div
                                          key={i}
                                          className={`w-1.5 rounded-sm ${getVitalStatus(vital.pulse_bpm, 'pulse')} opacity-70`}
                                          style={{
                                            height: `${height}px`,
                                            backgroundColor: 'currentColor'
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-300">
                                    {latestVitals?.systolic_mmHg}/{latestVitals?.diastolic_mmHg} mmHg
                                  </span>
                                  <span className={`${getVitalStatus(latestVitals?.SpO2_percent, 'spo2')}`}>
                                    SpO2: {latestVitals?.SpO2_percent}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Enhanced Actions */}
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTCCCCardOpen(patient)}
                              className="text-green-400 hover:text-white hover:bg-green-600 transition-colors"
                              title="TCCC Card"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateQRCode(patient.id)}
                              className="text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                              title="QR Code"
                            >
                              {qrCodeData[patient.id] ? (
                                <img
                                  src={qrCodeData[patient.id]}
                                  alt="QR Code"
                                  className="w-6 h-6"
                                />
                              ) : (
                                <QrCode className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }