import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ChevronDown } from 'lucide-react';

export function CustomSelect({ value, onChange, options, label, placeholder = 'Pilih...' }) {
  // If options is an array of strings, map to {value, label}
  const formattedOptions = options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt);
  const selectedOption = formattedOptions.find(o => o.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative mt-1">
          {label && <Listbox.Label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</Listbox.Label>}
          <div className="relative z-50">
            <Listbox.Button className="appearance-none w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium transition-all text-left relative">
              <span className="block truncate pr-6">{selectedOption ? selectedOption.label : <span className="text-slate-400 font-normal">{placeholder}</span>}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-[100] mt-1.5 max-h-60 w-full overflow-auto rounded-xl bg-white/95 backdrop-blur-xl py-1.5 text-base shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200 focus:outline-none sm:text-sm">
                {formattedOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-all duration-200 ease-fluid mx-1.5 my-0.5 rounded-lg ${
                        active ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700 hover:text-slate-900'
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium text-teal-700' : 'font-normal'}`}>
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-teal-600' : 'text-teal-600'
                            }`}
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}
