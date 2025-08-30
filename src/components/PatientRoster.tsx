import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, QrCode, Activity, FileText } from "lucide-react";
import { Patient, samplePatients } from "@/data/medicalData";

interface PatientRosterProps {
  onSelectPatient: (patient: Patient, view: 'tccc' | 'vitals') => void;
}

export function PatientRoster({ onSelectPatient }: PatientRosterProps) {
  const [patients] = useState<Patient[]>(samplePatients);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-status-green';
      case 'yellow': return 'bg-status-yellow';
      case 'red': return 'bg-status-red';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'green': return 'Stable';
      case 'yellow': return 'Caution';
      case 'red': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Realtime Vitals</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 bg-status-green rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Streaming</span>
            </div>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">Patient List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#Battle Roster</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Updated</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(patient.status)}`}></div>
                          <div>
                            <div className="font-medium text-card-foreground">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">{patient.rank} - {patient.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-card-foreground font-mono">{patient.battleRoster}</td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(patient.status)} text-white border-0`}
                        >
                          {getStatusText(patient.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(patient.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectPatient(patient, 'vitals')}
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Activity className="w-4 h-4 mr-1" />
                            Vitals
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectPatient(patient, 'tccc')}
                            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            TCCC
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            className="border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-background"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}