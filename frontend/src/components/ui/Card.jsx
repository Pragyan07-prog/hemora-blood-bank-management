import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-slate-200' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`p-5 sm:p-6 pb-0 flex items-start justify-between gap-4 ${headerClassName}`}>
          <div>
            {title && <h3 className="font-heading text-lg font-bold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className={`px-5 py-3 sm:px-6 bg-slate-50 border-t border-slate-100 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
