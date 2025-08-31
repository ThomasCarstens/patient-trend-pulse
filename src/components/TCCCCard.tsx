import { Patient } from "@/data/medicalData";
import { TCCCProvider } from "@/contexts/TCCCContext";
import TCCCCardContainer from "./tccc/TCCCCardContainer";

interface TCCCCardProps {
  patient: Patient;
  onBack: () => void;
}

export function TCCCCard({ patient, onBack }: TCCCCardProps) {
  return (
    <TCCCProvider>
      <TCCCCardContainer onBack={onBack} />
    </TCCCProvider>
  );
}
