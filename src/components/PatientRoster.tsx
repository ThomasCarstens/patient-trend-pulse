import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Activity, FileText, X, Plus, RefreshCw } from "lucide-react";
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
  const [patientVitalsMap, setPatientVitalsMap] = useState<Map<string, VitalSigns[]>>(new Map());
  const [currentVitalIndex, setCurrentVitalIndex] = useState<Map<string, number>>(new Map());

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
        setPatients(dynamicPatients);

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
        setIsStreaming(true); // Start 5Hz streaming

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

        // Update each patient's current vital index
        for (const [patientId, currentIndex] of prevIndexMap.entries()) {
          const vitals = patientVitalsMap.get(patientId);
          if (vitals && currentIndex < vitals.length - 1) {
            newIndexMap.set(patientId, currentIndex + 1);
            hasUpdates = true;
          }
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
    }, 200); // 5Hz = 200ms intervals

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
      case 'unknown': return 'bg-black text-white'; // Black
      default: return 'bg-gray-500 text-white';
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

  const refreshPatients = async () => {
    setIsLoading(true);
    try {
      const dynamicPatients = await generatePatientsFromCSV();
      setPatients(dynamicPatients);
      console.log(`Refreshed ${dynamicPatients.length} patients from CSV files`);
    } catch (error) {
      console.error('Error refreshing patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPatient = () => {
    const newPatientId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newPatient: Patient = {
      id: newPatientId,
      name: "Unknown",
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
      vitals: defaultVitals
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Patient Roster</h2>
            <p className="text-sm text-gray-400">Sorted by Triage Priority</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`${isStreaming ? 'text-red-400 hover:bg-red-600' : 'text-green-400 hover:bg-green-600'} hover:text-white`}
            >
              <Activity className="w-4 h-4 mr-1" />
              {isStreaming ? 'Stop 5Hz Stream' : 'Start 5Hz Stream'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPatients}
              disabled={isLoading}
              className="text-purple-400 hover:text-white hover:bg-purple-600"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewPatient}
              className="text-green-400 hover:text-white hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Patient
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPatientInfo(!showPatientInfo)}
              className="text-blue-400 hover:text-white hover:bg-blue-600"
            >
              {showPatientInfo ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[calc(80vh-80px)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Triage</th>
                    {showPatientInfo && (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Details</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Condition</th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Trend</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const latestVitals = patient.vitals[patient.vitals.length - 1];

                    return (
                      <tr key={patient.id} className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors border-l-4 ${getTriageBorderColor(patient.triageCategory)}`}>
                        {/* Patient Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className="text-xs text-gray-400 mb-1">#{patient.triagePriority}</div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getTriageColor(patient.triageCategory)}`}>
                                {patient.triageCategory.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                {patient.name}
                                {/* Real-time alert color indicator */}
                                <div className={`w-3 h-3 rounded-full ${getAlertColorIndicator(patient)} ${isStreaming ? 'animate-pulse' : ''}`} title="Real-time alert status"></div>
                              </div>
                              <div className="text-sm text-gray-300">{patient.battleRoster}</div>
                              <div className="text-xs text-gray-500 font-mono">{patient.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>

                        {/* Triage Category */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <Badge className={`text-xs font-medium ${getTriageColor(patient.triageCategory)}`}>
                              {patient.triageCategory.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-400">Priority {patient.triagePriority}</div>
                          </div>
                        </td>
                        {/* Conditional Patient Details */}
                        {showPatientInfo && (
                          <>
                            <td className="py-4 px-4">
                              <div className="space-y-1 text-xs">
                                <div className="text-white font-medium">{patient.age}y {patient.gender?.charAt(0).toUpperCase()}</div>
                                <div className="text-gray-300">{patient.bloodType}</div>
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
                          </>
                        )}

                        {/* Trend Column */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${
                                latestVitals?.pulse_bpm > 100 ? 'text-red-400' :
                                latestVitals?.pulse_bpm > 90 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {latestVitals?.pulse_bpm} BPM
                              </span>
                              <div className="flex space-x-1">
                                {patient.vitals.slice(-8).map((vital, i) => {
                                  const height = Math.max(2, Math.min(16, (vital.pulse_bpm - 60) / 4));
                                  return (
                                    <div
                                      key={i}
                                      className="w-1 bg-blue-500 rounded-sm"
                                      style={{ height: `${height}px` }}
                                    ></div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-xs text-gray-300">
                              {latestVitals?.systolic_mmHg}/{latestVitals?.diastolic_mmHg} mmHg
                            </div>
                            <div className="text-xs text-gray-400">
                              SpO2: {latestVitals?.SpO2_percent}%
                            </div>
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectPatient(patient, 'vitals')}
                              className="text-blue-400 hover:text-white hover:bg-blue-600"
                              title="View Vitals"
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTCCCCardOpen(patient)}
                              className="text-green-400 hover:text-white hover:bg-green-600"
                              title="TCCC Card"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateQRCode(patient.id)}
                              className="text-gray-400 hover:text-white hover:bg-gray-600"
                              title="Generate QR Code"
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