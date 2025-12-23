import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  icon: string;
  description?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIconStyle = (optValue: string) => {
    switch (optValue) {
      case "vi":
        return "bg-nung-red text-white";
      case "nung":
        return "bg-nung-green text-white";
      case "central":
        return "bg-nung-blue text-white";
      default:
        return "bg-black text-white";
    }
  };

  return (
    <div className="flex-1" ref={selectRef}>
      <label className="block text-sm font-black text-nung-dark uppercase tracking-widest mb-3">
        {label}
      </label>
      <div className="relative">
        {/* Selected Value Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 border-4 border-black font-bold text-nung-dark bg-white cursor-pointer flex items-center justify-between hover:bg-nung-sand/20 transition-all shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 border-2 border-black flex items-center justify-center ${getIconStyle(
                selectedOption?.value || ""
              )}`}
            >
              <i className={`fa-solid ${selectedOption?.icon} text-lg`}></i>
            </span>
            <span className="text-lg font-serif">{selectedOption?.label}</span>
          </div>
          <i
            className={`fa-solid fa-chevron-down text-black transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          ></i>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-3 bg-white border-4 border-black shadow-brutal-lg animate-fade-in overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-nung-sand transition-colors border-b-2 border-black last:border-b-0 ${
                  value === option.value ? "bg-nung-sand/50" : ""
                }`}
              >
                <span
                  className={`w-12 h-12 border-2 border-black flex items-center justify-center shadow-brutal-sm ${getIconStyle(
                    option.value
                  )}`}
                >
                  <i className={`fa-solid ${option.icon} text-xl`}></i>
                </span>
                <div className="text-left flex-1">
                  <p
                    className={`font-black text-lg ${
                      value === option.value
                        ? "text-nung-red"
                        : "text-nung-dark"
                    }`}
                  >
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                      {option.description}
                    </p>
                  )}
                </div>
                {value === option.value && (
                  <div className="bg-black text-white w-6 h-6 flex items-center justify-center">
                    <i className="fa-solid fa-check text-xs"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
