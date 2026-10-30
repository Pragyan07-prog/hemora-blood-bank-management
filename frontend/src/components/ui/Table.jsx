import React from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  emptyTitle,
  emptyAction,
  emptyActionLabel,
  keyField = 'id',
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Spinner size="md" text="Loading table data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          title={emptyTitle || 'No Data Available'}
          description={emptyMessage}
          actionLabel={emptyActionLabel}
          onAction={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-slate-100 text-left border-collapse">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                scope="col"
                className={`table-header ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((item, rowIndex) => (
            <tr
              key={item[keyField] || rowIndex}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40'
              }`}
            >
              {columns.map((col, colIndex) => {
                const cellValue = col.dataIndex ? item[col.dataIndex] : item;
                return (
                  <td
                    key={col.key || colIndex}
                    className={`table-cell ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  >
                    {col.render ? col.render(cellValue, item, rowIndex) : cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
