import React, { forwardRef } from 'react';

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Select an option',
      className = '',
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-xl border text-slate-900 focus:outline-none focus:ring-2 transition-all duration-150 sm:text-sm py-2.5 px-3.5 bg-white ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
              : 'border-slate-200 focus:border-crimson-500 focus:ring-crimson-100 hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => {
                const value = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={value} value={value}>
                    {optLabel}
                  </option>
                );
              })
            : children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
