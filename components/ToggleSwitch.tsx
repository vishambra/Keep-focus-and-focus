import React from 'react';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, disabled = false }) => {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-base focus:ring-green-500 dark:focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
        isOn ? 'bg-green-500 dark:bg-primary' : 'bg-slate-400 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;