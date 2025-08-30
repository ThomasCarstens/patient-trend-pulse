import { ArrowLeft, Heart, Droplets, Wind, Thermometer, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Patient } from "@/data/medicalData";

interface TCCCCardProps {
  patient: Patient;
  onBack: () => void;
}

export function TCCCCard({ patient, onBack }: TCCCCardProps) {
  const latestVitals = patient.vitals[patient.vitals.length - 1];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-status-green';
      case 'yellow': return 'bg-status-yellow';
      case 'red': return 'bg-status-red';
      default: return 'bg-muted';
    }
  };

  const treatments = [
    { id: 'extremity', label: 'Extremity', category: 'TQ' },
    { id: 'junctional', label: 'Junctional', category: 'TQ' },
    { id: 'truncal', label: 'Truncal', category: 'TQ' },
    { id: 'pelvic', label: 'Pelvic Sling', category: 'TQ' },
  ];

  const dressing = [
    { id: 'hemostatic', label: 'Hemostatic' },
    { id: 'pressure', label: 'Pressure' },
    { id: 'standard', label: 'Standard' },
    { id: 'glass', label: 'Glass' },
  ];

  const airway = [
    { id: 'npa', label: 'NPA' },
    { id: 'sga', label: 'SGA' },
    { id: 'ettube', label: 'ET-Tube' },
    { id: 'cric', label: 'CRIC' },
  ];

  const breathing = [
    { id: 'o2mask', label: 'O2 Mask' },
    { id: 'chestseal', label: 'Chest-Seal' },
    { id: 'chesttube', label: 'Chest-Tube' },
    { id: 'needle', label: 'Needle-D' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roster
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(patient.status)}`}></div>
            <h1 className="text-2xl font-bold text-foreground">{patient.name} - TCCC Card</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Battle Roster</label>
                  <div className="text-card-foreground font-mono">{patient.battleRoster}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Rank/Unit</label>
                  <div className="text-card-foreground">{patient.rank} - {patient.unit}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Age</label>
                  <div className="text-card-foreground">{patient.age}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Blood Type</label>
                  <div className="text-card-foreground font-bold">{patient.bloodType}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Allergies</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.allergies?.length ? patient.allergies.map((allergy, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">{allergy}</Badge>
                  )) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Current Medications</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.medications?.length ? patient.medications.map((med, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{med}</Badge>
                  )) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Vitals */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-status-red" />
                Current Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-card-foreground">{latestVitals?.pulse_bpm}</div>
                  <div className="text-sm text-muted-foreground">HR (bpm)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-card-foreground">
                    {latestVitals?.systolic_mmHg}/{latestVitals?.diastolic_mmHg}
                  </div>
                  <div className="text-sm text-muted-foreground">BP (mmHg)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-card-foreground">{latestVitals?.resp_rate_bpm}</div>
                  <div className="text-sm text-muted-foreground">RR (rpm)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold text-card-foreground">{latestVitals?.SpO2_percent}%</div>
                  <div className="text-sm text-muted-foreground">SpO2</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-secondary">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Blood Loss</span>
                  <span className="text-lg font-bold text-destructive">{latestVitals?.blood_loss_percent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-destructive h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${latestVitals?.blood_loss_percent}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatments */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Treatments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-card-foreground mb-3">TQ</h4>
                <div className="grid grid-cols-2 gap-3">
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="flex items-center space-x-2">
                      <Checkbox id={treatment.id} />
                      <label htmlFor={treatment.id} className="text-sm text-card-foreground">
                        {treatment.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-card-foreground mb-3">Dressing</h4>
                <div className="grid grid-cols-2 gap-3">
                  {dressing.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox id={item.id} />
                      <label htmlFor={item.id} className="text-sm text-card-foreground">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-card-foreground mb-3">Airway</h4>
                <div className="grid grid-cols-2 gap-3">
                  {airway.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox id={item.id} />
                      <label htmlFor={item.id} className="text-sm text-card-foreground">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-card-foreground mb-3">Breathing</h4>
                <div className="grid grid-cols-2 gap-3">
                  {breathing.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox id={item.id} />
                      <label htmlFor={item.id} className="text-sm text-card-foreground">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Treatment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <div className="w-2 h-2 bg-status-green rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-card-foreground">Patient Admitted</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(patient.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary opacity-50">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">No treatments recorded</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}