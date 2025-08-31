import { FC } from "react";
import CheckboxField from "./CheckboxField";
import { useTCCCContext } from "@/contexts/TCCCContext";

interface TreatmentsFormProps {}

const TreatmentsForm: FC<TreatmentsFormProps> = () => {
  const { 
    patientData, 
    updateTreatmentCheckbox,
    updateTreatmentField,
    updateFluidField,
    updateMedField,
    updateNotesField
  } = useTCCCContext();

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h2 className="text-lg font-medium mb-4 text-card-foreground">Treatments</h2>
      
      {/* TQ & Dressing Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-sm text-card-foreground">C: TQ / Dressing</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <CheckboxField 
            id="extremity" 
            label="Extremity" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.tq?.includes("extremity") || false}
            onChange={() => updateTreatmentCheckbox("tq", "extremity")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="junctional" 
            label="Junctional" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.tq?.includes("junctional") || false}
            onChange={() => updateTreatmentCheckbox("tq", "junctional")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="truncal" 
            label="Truncal" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.tq?.includes("truncal") || false}
            onChange={() => updateTreatmentCheckbox("tq", "truncal")}
            checkboxSize="sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <CheckboxField 
            id="pressure" 
            label="Pressure" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.dressing?.includes("pressure") || false}
            onChange={() => updateTreatmentCheckbox("dressing", "pressure")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="hemostatic" 
            label="Hemostatic" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.dressing?.includes("hemostatic") || false}
            onChange={() => updateTreatmentCheckbox("dressing", "hemostatic")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="other" 
            label="Other" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.dressing?.includes("other") || false}
            onChange={() => updateTreatmentCheckbox("dressing", "other")}
            checkboxSize="sm"
          />
        </div>
      </div>

      {/* Airway Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-sm text-card-foreground">A: Airway</label>
        <div className="grid grid-cols-3 gap-2">
          <CheckboxField 
            id="npa" 
            label="NPA" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.airway?.includes("npa") || false}
            onChange={() => updateTreatmentCheckbox("airway", "npa")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="opa" 
            label="OPA" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.airway?.includes("opa") || false}
            onChange={() => updateTreatmentCheckbox("airway", "opa")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="surgical" 
            label="Surgical" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.airway?.includes("surgical") || false}
            onChange={() => updateTreatmentCheckbox("airway", "surgical")}
            checkboxSize="sm"
          />
        </div>
      </div>

      {/* Breathing Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-sm text-card-foreground">B: Breathing</label>
        <div className="grid grid-cols-3 gap-2">
          <CheckboxField 
            id="chestSeal" 
            label="Chest Seal" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.breathing?.includes("chestSeal") || false}
            onChange={() => updateTreatmentCheckbox("breathing", "chestSeal")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="needleD" 
            label="Needle D" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.breathing?.includes("needleD") || false}
            onChange={() => updateTreatmentCheckbox("breathing", "needleD")}
            checkboxSize="sm"
          />
          <CheckboxField 
            id="bvm" 
            label="BVM" 
            labelClass="text-sm text-card-foreground"
            checked={patientData.treatments?.breathing?.includes("bvm") || false}
            onChange={() => updateTreatmentCheckbox("breathing", "bvm")}
            checkboxSize="sm"
          />
        </div>
      </div>

      {/* IV/Fluids Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-sm text-card-foreground">IV / Fluids</label>
        <div className="space-y-2">
          {patientData.treatments?.fluids?.map((fluid, index) => (
            <div key={index} className="grid grid-cols-4 gap-2">
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={fluid.name}
                onChange={(e) => updateFluidField(index, 'name', e.target.value)}
                placeholder="Saline" 
              />
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={fluid.volume}
                onChange={(e) => updateFluidField(index, 'volume', e.target.value)}
                placeholder="500ml" 
              />
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={fluid.route}
                onChange={(e) => updateFluidField(index, 'route', e.target.value)}
                placeholder="IV" 
              />
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={fluid.time}
                onChange={(e) => updateFluidField(index, 'time', e.target.value)}
                placeholder="10:30" 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Medications Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-sm text-card-foreground">Medications</label>
        <div className="space-y-2">
          {patientData.treatments?.meds?.map((med, index) => (
            <div key={index} className="grid grid-cols-4 gap-2">
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={med.name}
                onChange={(e) => updateMedField(index, 'name', e.target.value)}
                placeholder={index === 0 ? "Morphine" : index === 1 ? "Antibiotic" : "Other"} 
              />
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={med.dose}
                onChange={(e) => updateMedField(index, 'dose', e.target.value)}
                placeholder="10mg" 
              />
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={med.route}
                onChange={(e) => updateMedField(index, 'route', e.target.value)}
                placeholder="IV" 
              />
              <input 
                type="text" 
                className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={med.time}
                onChange={(e) => updateMedField(index, 'time', e.target.value)}
                placeholder="10:30" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-sm text-card-foreground">Notes</label>
        <textarea 
          className="w-full h-20 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          value={patientData.notes || ''}
          onChange={(e) => updateNotesField(e.target.value)}
          placeholder="Add treatment notes here..." 
        />
      </div>

      {/* First Responder Section */}
      <div>
        <label className="block font-medium mb-2 text-sm text-card-foreground">First Responder</label>
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            value={patientData.firstResponderName || ''}
            onChange={(e) => updateTreatmentField('firstResponderName', e.target.value)}
            placeholder="NAME (Last, First)" 
          />
          <input 
            type="text" 
            className="bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            value={patientData.firstResponderLast4 || ''}
            onChange={(e) => updateTreatmentField('firstResponderLast4', e.target.value)}
            placeholder="Last 4 SSN" 
          />
        </div>
      </div>
    </div>
  );
};

export default TreatmentsForm;
