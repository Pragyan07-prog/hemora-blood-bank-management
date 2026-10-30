import React from 'react';
import Card from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'crimson',
  trend,
  trendDirection = 'up',
  className = '',
}) => {
  const colorStyles = {
    crimson: 'bg-crimson-50 text-crimson-800 border-crimson-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">{value}</h3>
          {(subtitle || trend) && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    trendDirection === 'up'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {trendDirection === 'up' ? '↑' : '↓'} {trend}
                </span>
              )}
              {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${colorStyles[color] || colorStyles.crimson}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
