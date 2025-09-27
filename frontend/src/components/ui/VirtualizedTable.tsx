import React, { useMemo, useCallback, memo } from 'react';
// Simplified implementation without react-window for build compatibility
import { LoadingSpinner } from './LoadingSpinner';

interface Column<T> {
  key: keyof T;
  header: string;
  width: number;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height: number;
  itemHeight?: number;
  onRowClick?: (item: T, index: number) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  loading?: boolean;
  emptyMessage?: string;
}

// RowProps interface removed - using any for simplicity

const Row = memo(({ index, style, data }: any) => {
  const { items, columns, onRowClick, rowClassName } = data;
  const item = items[index];

  const handleClick = useCallback(() => {
    onRowClick?.(item, index);
  }, [item, index, onRowClick]);

  const className = useMemo(() => {
    const baseClass = onRowClick 
      ? 'flex items-center border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150'
      : 'flex items-center border-b border-gray-200';
    
    if (typeof rowClassName === 'function') {
      return `${baseClass} ${rowClassName(item, index)}`;
    }
    return `${baseClass} ${rowClassName || ''}`;
  }, [item, index, rowClassName, onRowClick]);

  const renderedColumns = useMemo(() => {
    return columns.map((column: any) => {
      const value = item[column.key];
      const content = column.render ? column.render(value, item, index) : String(value);
      
      return (
        <div
          key={String(column.key)}
          className="px-4 py-2 text-sm text-gray-900 truncate"
          style={{ width: column.width, minWidth: column.width }}
          title={typeof content === 'string' ? content : undefined}
        >
          {content}
        </div>
      );
    });
  }, [columns, item, index]);

  return (
    <div 
      style={style} 
      className={className} 
      onClick={onRowClick ? handleClick : undefined}
      role={onRowClick ? "button" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onKeyDown={onRowClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {renderedColumns}
    </div>
  );
});

const VirtualizedTable = <T,>({
  data,
  columns,
  height,
  itemHeight = 48,
  onRowClick,
  onSort,
  sortKey,
  sortDirection,
  className = '',
  headerClassName = '',
  rowClassName,
  loading = false,
  emptyMessage = 'No data available'
}: VirtualizedTableProps<T>) => {
  const handleSort = useCallback((key: keyof T) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  }, [onSort, sortKey, sortDirection]);

  const getSortIcon = useCallback((key: keyof T) => {
    if (sortKey !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }, [sortKey, sortDirection]);

  const itemData = useMemo(() => ({
    items: data,
    columns,
    onRowClick,
    rowClassName
  }), [data, columns, onRowClick, rowClassName]);

  if (loading) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`flex bg-gray-50 border-b border-gray-200 ${headerClassName}`}>
        {columns.map((column) => (
          <div
            key={String(column.key)}
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
            }`}
            style={{ width: column.width, minWidth: column.width }}
            onClick={column.sortable ? () => handleSort(column.key) : undefined}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {column.sortable && getSortIcon(column.key)}
            </div>
          </div>
        ))}
      </div>

      {/* Virtual List */}
      <div style={{ height: height - 48, overflowY: 'auto' }}>
        {data.map((_item, index) => (
          <Row
            key={index}
            index={index}
            style={{ height: itemHeight }}
            data={itemData}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(VirtualizedTable);