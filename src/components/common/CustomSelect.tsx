import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  shortLabel?: string;
  icon: string;
  description?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  hideLabel?: boolean;
  isCompact?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
  hideLabel = false,
  isCompact = false,
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
    <div className={`flex-1 ${isCompact ? "w-full" : ""}`} ref={selectRef}>
      {!hideLabel && (
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Selected Value Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border-2 border-black font-bold text-black bg-white cursor-pointer flex items-center justify-between transition-all shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 ${
            isCompact ? "p-2 sm:p-3" : "p-4"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span
              className={`border-2 border-black flex items-center justify-center shrink-0 ${
                isCompact ? "w-7 h-7 sm:w-8 sm:h-8" : "w-10 h-10"
              } ${getIconStyle(selectedOption?.value || "")}`}
            >
              <i
                className={`fa-solid ${selectedOption?.icon} ${
                  isCompact ? "text-sm" : "text-lg"
                }`}
              ></i>
            </span>
            <span
              className={`font-bold uppercase tracking-tight truncate ${
                isCompact ? "text-xs" : "text-lg"
              }`}
            >
              {isCompact && selectedOption?.shortLabel
                ? selectedOption.shortLabel
                : selectedOption?.label}
            </span>
          </div>
          <i
            className={`fa-solid fa-chevron-down text-black transition-transform shrink-0 ml-2 ${
              isOpen ? "rotate-180" : ""
            } ${isCompact ? "text-[10px]" : "text-xs"}`}
          ></i>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-black shadow-brutal-sm animate-in fade-in zoom-in duration-200 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors border-b-2 border-black last:border-b-0 ${
                  isCompact ? "px-3 py-2 sm:px-4 sm:py-3" : "px-6 py-4"
                } ${value === option.value ? "bg-gray-50" : ""}`}
              >
                <span
                  className={`border-2 border-black flex items-center justify-center shrink-0 ${
                    isCompact ? "w-8 h-8 sm:w-10 sm:h-10" : "w-12 h-12"
                  } ${getIconStyle(option.value)}`}
                >
                  <i
                    className={`fa-solid ${option.icon} ${
                      isCompact ? "text-base" : "text-xl"
                    }`}
                  ></i>
                </span>
                <div className="text-left flex-1 overflow-hidden">
                  <p
                    className={`font-black uppercase tracking-tight truncate ${
                      isCompact ? "text-[10px] sm:text-xs" : "text-lg"
                    } ${
                      value === option.value ? "text-nung-red" : "text-black"
                    }`}
                  >
                    {option.label}
                  </p>
                  {option.description && !isCompact && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">
                      {option.description}
                    </p>
                  )}
                </div>
                {value === option.value && (
                  <div className="bg-black text-white w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-check text-[10px]"></i>
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
