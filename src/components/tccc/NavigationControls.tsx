import { FC } from "react";
import { Button } from "@/components/ui/button";
import { useTCCCContext } from "@/contexts/TCCCContext";
import { Save, Printer, Send, Users, Plus, ArrowLeft } from "lucide-react";

interface NavigationControlsProps {
  onTogglePatientList: () => void;
  showPatientList: boolean;
  onBack?: () => void;
}

const NavigationControls: FC<NavigationControlsProps> = ({
  onTogglePatientList,
  showPatientList,
  onBack
}) => {
  const { createNewPatient, savePatientRecord, printCard, sendCard } = useTCCCContext();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg p-4 flex justify-between items-center z-40 border-t border-border">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-background"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <Button 
          variant={showPatientList ? "secondary" : "outline"}
          size="sm"
          onClick={onTogglePatientList}
          className={showPatientList ? "" : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"}
        >
          <Users className="w-4 h-4 mr-1" />
          {showPatientList ? 'Hide Patients' : 'Show Patients'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={createNewPatient}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={savePatientRecord}
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={printCard}
          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={sendCard}
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default NavigationControls;
