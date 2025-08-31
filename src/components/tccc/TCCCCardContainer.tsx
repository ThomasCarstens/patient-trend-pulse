import { FC, useState } from "react";
import PatientInfoForm from "./PatientInfoForm";
import VitalSignsForm from "./VitalSignsForm";
import TreatmentsForm from "./TreatmentsForm";
import NavigationControls from "./NavigationControls";
import PatientList from "./PatientList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TCCCCardContainerProps {
  onBack?: () => void;
}

const TCCCCardContainer: FC<TCCCCardContainerProps> = ({ onBack }) => {
  const [showPatientList, setShowPatientList] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col gap-4 p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground">TCCC Card</h1>
            <p className="text-muted-foreground">Tactical Combat Casualty Care</p>
          </div>
        </div>

        {/* Patient List (toggled by button) */}
        {showPatientList && (
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-card-foreground">Saved Patients</CardTitle>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPatientList(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PatientList />
            </CardContent>
          </Card>
        )}

        {/* All components stacked vertically */}
        <PatientInfoForm />
        <VitalSignsForm />
        <TreatmentsForm />
      </div>
      
      <NavigationControls 
        onTogglePatientList={() => setShowPatientList(!showPatientList)}
        showPatientList={showPatientList}
        onBack={onBack}
      />
    </div>
  );
};

export default TCCCCardContainer;
