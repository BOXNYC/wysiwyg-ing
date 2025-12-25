import React from 'react';

export function ToolbarButton({ icon, label, onClick, active, colors }) {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        border: 'none',
        borderRadius: 6,
        background: active ? colors.accent : (hovered ? colors.bgTertiary : 'transparent'),
        color: active ? '#fff' : colors.textSecondary,
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}

export function ToolbarDivider({ colors }) {
  return (
    <div style={{ width: 1, height: 24, background: colors.border, margin: '0 4px' }} />
  );
}
