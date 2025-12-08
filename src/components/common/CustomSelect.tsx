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
        return "bg-red-100 text-red-600";
      case "nung":
        return "bg-emerald-100 text-emerald-600";
      case "central":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-purple-100 text-purple-600";
    }
  };

  return (
    <div className="flex-1" ref={selectRef}>
      <label className="block text-sm font-bold text-earth-800 mb-2">
        {label}
      </label>
      <div className="relative">
        {/* Selected Value Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-earth-300 rounded-xl focus:ring-2 focus:ring-bamboo-500 outline-none font-medium text-earth-900 bg-white cursor-pointer flex items-center justify-between hover:border-bamboo-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconStyle(
                selectedOption?.value || ""
              )}`}
            >
              <i className={`fa-solid ${selectedOption?.icon}`}></i>
            </span>
            <span>{selectedOption?.label}</span>
          </div>
          <i
            className={`fa-solid fa-chevron-down text-earth-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          ></i>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-earth-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-bamboo-50 transition-colors ${
                  value === option.value
                    ? "bg-bamboo-50 border-l-4 border-bamboo-500"
                    : "border-l-4 border-transparent"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconStyle(
                    option.value
                  )}`}
                >
                  <i className={`fa-solid ${option.icon} text-lg`}></i>
                </span>
                <div className="text-left flex-1">
                  <p
                    className={`font-medium ${
                      value === option.value
                        ? "text-bamboo-700"
                        : "text-earth-900"
                    }`}
                  >
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-earth-500">
                      {option.description}
                    </p>
                  )}
                </div>
                {value === option.value && (
                  <i className="fa-solid fa-check text-bamboo-600"></i>
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
