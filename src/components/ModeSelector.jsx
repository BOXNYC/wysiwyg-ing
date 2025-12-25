import React from 'react';

export function ModeSelector({ mode, onChange, colors }) {
  const modes = [
    { value: 'code', label: 'Code' },
    { value: 'split', label: 'Split' },
    { value: 'render', label: 'Preview' }
  ];

  return (
    <div style={{
      display: 'flex',
      background: colors.bgSecondary,
      borderRadius: 8,
      padding: 3
    }}>
      {modes.map(m => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          style={{
            padding: '6px 16px',
            border: 'none',
            borderRadius: 6,
            background: mode === m.value ? colors.bg : 'transparent',
            color: mode === m.value ? colors.text : colors.textSecondary,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: mode === m.value ? 500 : 400,
            boxShadow: mode === m.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
