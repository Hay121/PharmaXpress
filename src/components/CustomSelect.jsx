import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

export function CustomSelect({ value, onChange, options, label, placeholder = 'Pilih...' }) {
  const selectedOption = options.find(o => o.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative mt-1">
          {label && <Listbox.Label className="block text-sm font-medium text-slate-700 mb-1">{label}</Listbox.Label>}
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white/50 backdrop-blur-sm py-2.5 pl-4 pr-10 text-left shadow-sm ring-1 ring-inset ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm sm:leading-6 hover:bg-slate-50/80 transition-all duration-200 ease-fluid">
              <span className="block truncate text-slate-900">{selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl bg-white/95 backdrop-blur-xl py-1.5 text-base shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/80 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2.5 pl-10 pr-4 transition-all duration-200 ease-fluid rounded-lg mx-1.5 my-0.5 ${
                        active ? 'bg-primary-subtle text-primary-hover font-medium' : 'text-slate-700 hover:text-slate-900'
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-primary' : 'text-primary'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
