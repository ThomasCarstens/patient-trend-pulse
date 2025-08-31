import { FC } from "react";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  labelClass?: string;
  checkboxSize?: 'sm' | 'md' | 'lg';
}

const CheckboxField: FC<CheckboxFieldProps> = ({ 
  id, 
  label, 
  checked, 
  onChange,
  labelClass = '',
  checkboxSize = 'lg'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className={`mr-2 ${sizeClasses[checkboxSize]} accent-primary`}
      />
      <label htmlFor={id} className={`cursor-pointer select-none text-sm ${labelClass}`}>
        {label}
      </label>
    </div>
  );
};

export default CheckboxField;
