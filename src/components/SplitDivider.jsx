import React from 'react';

export function SplitDivider({
  isVertical,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  colors
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        background: isDragging ? colors.accent : colors.border,
        cursor: isVertical ? 'row-resize' : 'col-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        flexShrink: 0,
        ...(isVertical
          ? { width: '100%', height: 12 }
          : { width: 12, height: '100%' })
      }}
    >
      <div style={{
        display: 'flex',
        gap: 3,
        flexDirection: isVertical ? 'row' : 'column'
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: isDragging ? '#fff' : colors.textMuted
            }}
          />
        ))}
      </div>
    </div>
  );
}
