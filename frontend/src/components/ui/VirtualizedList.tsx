import React, { memo, useCallback, useMemo } from 'react';
// Simplified implementation without react-window for build compatibility
import { LoadingSpinner } from './LoadingSpinner';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  overscanCount?: number;
}

// ItemProps interface removed - using any for simplicity

const ListItem = memo(({ index, style, data }: any) => {
  const { items, renderItem, onItemClick } = data;
  const item = items[index];

  const handleClick = useCallback(() => {
    onItemClick?.(item, index);
  }, [item, index, onItemClick]);

  const className = useMemo(() => {
    return onItemClick 
      ? 'cursor-pointer hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-100'
      : '';
  }, [onItemClick]);

  const renderedContent = useMemo(() => {
    return renderItem(item, index);
  }, [renderItem, item, index]);

  return (
    <div
      style={style}
      className={className}
      onClick={onItemClick ? handleClick : undefined}
      role={onItemClick ? "button" : undefined}
      tabIndex={onItemClick ? 0 : undefined}
      onKeyDown={onItemClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {renderedContent}
    </div>
  );
});

const VirtualizedList = <T,>({
  items,
  height,
  itemHeight,
  renderItem,
  onItemClick,
  className = '',
  loading = false,
  emptyMessage = 'No items available',
}: Omit<VirtualizedListProps<T>, 'overscanCount'>) => {
  const itemData = useMemo(() => ({
    items,
    renderItem,
    onItemClick
  }), [items, renderItem, onItemClick]);

  const isVariableHeight = typeof itemHeight === 'function';

  if (loading) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📝</div>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isVariableHeight) {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div style={{ height, overflowY: 'auto' }}>
          {items.map((_item, index) => (
            <ListItem
              key={index}
              index={index}
              style={{ height: typeof itemHeight === 'function' ? itemHeight(index) : itemHeight }}
              data={itemData}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div style={{ height, overflowY: 'auto' }}>
        {items.map((_item, index) => (
          <ListItem
            key={index}
            index={index}
            style={{ height: itemHeight as number }}
            data={itemData}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(VirtualizedList);