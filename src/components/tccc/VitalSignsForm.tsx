import { FC } from "react";
import { useTCCCContext } from "@/contexts/TCCCContext";

interface VitalSignsFormProps {}

const VitalSignsForm: FC<VitalSignsFormProps> = () => {
  const { patientData, updateVitalSigns } = useTCCCContext();
  
  const handleInputChange = (field: string, column: number, value: string) => {
    updateVitalSigns(field, column, value);
  };
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h2 className="text-lg font-medium mb-4 text-card-foreground">Vital Signs</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left border-b border-border text-xs text-muted-foreground"></th>
              <th className="p-2 text-center border-b border-border text-xs text-muted-foreground">TIME 1</th>
              <th className="p-2 text-center border-b border-border text-xs text-muted-foreground">TIME 2</th>
              <th className="p-2 text-center border-b border-border text-xs text-muted-foreground">TIME 3</th>
              <th className="p-2 text-center border-b border-border text-xs text-muted-foreground">TIME 4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b border-border font-medium text-xs text-card-foreground">Pulse</td>
              {[0, 1, 2, 3].map((column) => (
                <td key={`pulse-${column}`} className="p-2 border-b border-border">
                  <input 
                    type="text" 
                    className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={patientData.vitalSigns?.pulse[column] || ''}
                    onChange={(e) => handleInputChange('pulse', column, e.target.value)}
                    placeholder={column === 0 ? "92" : ""}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border-b border-border font-medium text-xs text-card-foreground">Blood Pressure</td>
              {[0, 1, 2, 3].map((column) => (
                <td key={`bp-${column}`} className="p-2 border-b border-border">
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      className="w-1/2 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      value={patientData.vitalSigns?.bloodPressureSystolic[column] || ''}
                      onChange={(e) => handleInputChange('bloodPressureSystolic', column, e.target.value)}
                      placeholder={column === 0 ? "120" : ""}
                    />
                    <span className="text-xs text-muted-foreground">/</span>
                    <input 
                      type="text" 
                      className="w-1/2 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      value={patientData.vitalSigns?.bloodPressureDiastolic[column] || ''}
                      onChange={(e) => handleInputChange('bloodPressureDiastolic', column, e.target.value)}
                      placeholder={column === 0 ? "80" : ""}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border-b border-border font-medium text-xs text-card-foreground">Respiratory Rate</td>
              {[0, 1, 2, 3].map((column) => (
                <td key={`rr-${column}`} className="p-2 border-b border-border">
                  <input 
                    type="text" 
                    className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={patientData.vitalSigns?.respiratoryRate[column] || ''}
                    onChange={(e) => handleInputChange('respiratoryRate', column, e.target.value)}
                    placeholder={column === 0 ? "16" : ""}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border-b border-border font-medium text-xs text-card-foreground">Oxygen Saturation</td>
              {[0, 1, 2, 3].map((column) => (
                <td key={`spo2-${column}`} className="p-2 border-b border-border">
                  <input 
                    type="text" 
                    className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={patientData.vitalSigns?.oxygenSaturation[column] || ''}
                    onChange={(e) => handleInputChange('oxygenSaturation', column, e.target.value)}
                    placeholder={column === 0 ? "98%" : ""}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border-b border-border font-medium text-xs text-card-foreground">AVPU</td>
              {[0, 1, 2, 3].map((column) => (
                <td key={`avpu-${column}`} className="p-2 border-b border-border">
                  <input 
                    type="text" 
                    className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={patientData.vitalSigns?.avpu[column] || ''}
                    onChange={(e) => handleInputChange('avpu', column, e.target.value)}
                    placeholder={column === 0 ? "A" : ""}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border-b border-border font-medium text-xs text-card-foreground">Pain (0-10)</td>
              {[0, 1, 2, 3].map((column) => (
                <td key={`pain-${column}`} className="p-2 border-b border-border">
                  <input 
                    type="text" 
                    className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={patientData.vitalSigns?.painScale[column] || ''}
                    onChange={(e) => handleInputChange('painScale', column, e.target.value)}
                    placeholder={column === 0 ? "7" : ""}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VitalSignsForm;
