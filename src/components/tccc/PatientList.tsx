import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTCCCContext } from "@/contexts/TCCCContext";

interface PatientListProps {}

const PatientList: FC<PatientListProps> = () => {
  const { loadPatient } = useTCCCContext();
  const [patients] = useState([
    { id: '1', name: 'John Smith', date: '12/05/2023', unit: '3rd Infantry Division' },
    { id: '2', name: 'Jane Doe', date: '14/05/2023', unit: '101st Airborne' },
    { id: '3', name: 'Michael Brown', date: '16/05/2023', unit: 'Marine Corps 2nd Battalion' },
  ]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="p-3 text-left border-b border-border text-sm font-medium text-muted-foreground">Name</th>
            <th className="p-3 text-left border-b border-border text-sm font-medium text-muted-foreground">Date</th>
            <th className="p-3 text-left border-b border-border text-sm font-medium text-muted-foreground">Unit</th>
            <th className="p-3 text-left border-b border-border text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
              <td className="p-3 border-b border-border text-card-foreground">{patient.name}</td>
              <td className="p-3 border-b border-border text-muted-foreground">{patient.date}</td>
              <td className="p-3 border-b border-border text-muted-foreground">{patient.unit}</td>
              <td className="p-3 border-b border-border">
                <Button 
                  size="sm"
                  onClick={() => loadPatient(patient.id)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Load
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
