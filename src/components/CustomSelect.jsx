import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function CustomSelect({ value, onChange, options, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => (opt.value || opt) === value);
  const displayLabel = selectedOption ? (selectedOption.label || selectedOption.value || selectedOption) : 'Pilih...';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex justify-between items-center select-none cursor-pointer`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden max-h-60 overflow-y-auto">
          <ul className="py-1">
            {options.map((opt, idx) => {
              const val = opt.value || opt;
              const label = opt.label || opt.value || opt;
              const isSelected = val === value;
              return (
                <li 
                  key={idx}
                  onClick={() => {
                    onChange({ target: { value: val } });
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50 hover:text-teal-600'}`}
                >
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
