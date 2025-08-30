import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PatientRoster } from "@/components/PatientRoster";
import { TCCCCard } from "@/components/TCCCCard";
import { RealtimeVitals } from "@/components/RealtimeVitals";
import { Patient } from "@/data/medicalData";

const queryClient = new QueryClient();

type View = 'roster' | 'tccc' | 'vitals';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('roster');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleSelectPatient = (patient: Patient, view: 'tccc' | 'vitals') => {
    setSelectedPatient(patient);
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView('roster');
    setSelectedPatient(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {currentView === 'roster' && (
          <PatientRoster onSelectPatient={handleSelectPatient} />
        )}
        {currentView === 'tccc' && selectedPatient && (
          <TCCCCard patient={selectedPatient} onBack={handleBack} />
        )}
        {currentView === 'vitals' && selectedPatient && (
          <RealtimeVitals patient={selectedPatient} onBack={handleBack} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
