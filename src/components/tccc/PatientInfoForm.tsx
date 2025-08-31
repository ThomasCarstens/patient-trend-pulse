import { FC } from "react";
import CheckboxField from "./CheckboxField";
import InjuryDiagram from "./InjuryDiagram";
import { useTCCCContext } from "@/contexts/TCCCContext";

interface PatientInfoFormProps {}

const PatientInfoForm: FC<PatientInfoFormProps> = () => {
  const { 
    patientData, 
    updatePatientData, 
    updateEvacPriority,
    updateGender,
    updateMechanismOfInjury,
  } = useTCCCContext();

  return (
    <>
      {/* Patient Information Section */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-medium mb-4 text-card-foreground">Patient Information</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <label className="block text-card-foreground text-sm mb-1">Name</label>
            <input 
              type="text" 
              className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={patientData.name || ''}
              onChange={(e) => updatePatientData('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Battle Roster #</label>
            <input 
              type="text" 
              className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={patientData.battleRoster || ''}
              onChange={(e) => updatePatientData('battleRoster', e.target.value)}
              placeholder="12345"
            />
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Patient ID</label>
            <input 
              type="text" 
              className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={patientData.patientId || ''}
              onChange={(e) => updatePatientData('patientId', e.target.value)}
              placeholder="PID-001"
            />
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Gender</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="gender" 
                  className="form-radio h-4 w-4 text-primary"
                  checked={patientData.gender === 'male'}
                  onChange={() => updateGender('male')}
                />
                <span className="ml-2 text-sm text-card-foreground">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="gender" 
                  className="form-radio h-4 w-4 text-primary"
                  checked={patientData.gender === 'female'}
                  onChange={() => updateGender('female')}
                />
                <span className="ml-2 text-sm text-card-foreground">Female</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Date / Time</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="w-1/2 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={patientData.date || ''}
                onChange={(e) => updatePatientData('date', e.target.value)}
                placeholder="DD/MM/YY"
              />
              <input 
                type="text" 
                className="w-1/2 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={patientData.time || ''}
                onChange={(e) => updatePatientData('time', e.target.value)}
                placeholder="HH:MM"
              />
            </div>
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Service / Unit</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="w-1/2 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={patientData.service || ''}
                onChange={(e) => updatePatientData('service', e.target.value)}
                placeholder="Army"
              />
              <input 
                type="text" 
                className="w-1/2 bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={patientData.unit || ''}
                onChange={(e) => updatePatientData('unit', e.target.value)}
                placeholder="3rd Infantry"
              />
            </div>
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Allergies</label>
            <input 
              type="text" 
              className="w-full bg-input text-foreground rounded p-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={patientData.allergies || ''}
              onChange={(e) => updatePatientData('allergies', e.target.value)}
              placeholder="None known"
            />
          </div>
          <div>
            <label className="block text-card-foreground text-sm mb-1">Evacuation Priority</label>
            <div className="flex gap-4">
              {['A', 'B', 'C'].map((priority) => (
                <label key={priority} className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="evacPriority" 
                    className="form-radio h-4 w-4 text-primary"
                    checked={patientData.evacPriority === priority}
                    onChange={() => updateEvacPriority(priority)}
                  />
                  <span className="ml-2 text-sm text-card-foreground">{priority}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Mechanism of Injury Section */}
        <h3 className="text-base font-medium mt-6 mb-3 text-card-foreground">Mechanism of Injury</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            'IED Blast', 'Gunshot Wound', 'Mortar/Rocket', 'Vehicle Accident', 
            'Fall', 'Burn', 'Fragmentation', 'Blunt Trauma', 'Other'
          ].map((mechanism) => (
            <CheckboxField 
              key={mechanism}
              id={mechanism.replace(/\s+/g, '').toLowerCase()} 
              label={mechanism} 
              labelClass="text-sm text-card-foreground"
              checked={patientData.mechanismOfInjury?.includes(mechanism) || false}
              onChange={() => updateMechanismOfInjury(mechanism)}
              checkboxSize="sm"
            />
          ))}
        </div>

        {/* Injury Location Section */}
        <h3 className="text-base font-medium mt-6 mb-3 text-card-foreground">Injury Location</h3>
        <InjuryDiagram />
      </div>
    </>
  );
};

export default PatientInfoForm;
