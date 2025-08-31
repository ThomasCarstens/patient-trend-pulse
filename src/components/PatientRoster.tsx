import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Activity, FileText, X, Plus } from "lucide-react";
import { Patient, samplePatients } from "@/data/medicalData";
import { TCCCProvider } from "@/contexts/TCCCContext";
import TCCCCardContainer from "./tccc/TCCCCardContainer";
import QRCode from "qrcode";

interface PatientRosterProps {
  onSelectPatient: (patient: Patient, view: 'tccc' | 'vitals') => void;
  onClose: () => void;
}

export function PatientRoster({ onSelectPatient, onClose }: PatientRosterProps) {
  const [patients, setPatients] = useState<Patient[]>(
    // Sort patients by triage priority (1 = highest priority)
    samplePatients.sort((a, b) => a.triagePriority - b.triagePriority)
  );
  const [showTCCCCard, setShowTCCCCard] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{[key: string]: string}>({});

  const handleTCCCCardOpen = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowTCCCCard(true);
  };

  const handleTCCCCardClose = () => {
    setShowTCCCCard(false);
    setSelectedPatient(null);
  };

  // Generate QR codes for all patients on component mount
  useEffect(() => {
    patients.forEach(patient => {
      generateQRCode(patient.id);
    });
  }, []);  // Empty dependency array to run only once on mount

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
      vitals: [{
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
      }]
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
                              <div className="font-medium text-white">{patient.name}</div>
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