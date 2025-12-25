import React from 'react';

export function CodePanel({
  textareaRef,
  content,
  onChange,
  onSelect,
  onFocus,
  onKeyDown,
  colors,
  style
}) {
  const lines = content.split('\n');

  return (
    <div style={{
      display: 'flex',
      background: colors.bgSecondary,
      overflow: 'hidden',
      minWidth: 0,
      minHeight: 0,
      ...style
    }}>
      {/* Line numbers */}
      <div style={{
        padding: '16px 0',
        background: colors.bgTertiary,
        borderRight: `1px solid ${colors.border}`,
        minWidth: 50,
        overflow: 'auto'
      }}>
        {lines.map((_, i) => (
          <div
            key={i}
            style={{
              padding: '0 12px',
              fontSize: 14,
              lineHeight: 1.7,
              color: colors.textMuted,
              textAlign: 'right',
              fontFamily: 'monospace'
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={onChange}
        onSelect={onSelect}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        spellCheck={false}
        style={{
          flex: 1,
          padding: 16,
          border: 'none',
          background: 'transparent',
          fontSize: 14,
          lineHeight: 1.7,
          fontFamily: 'monospace',
          resize: 'none',
          outline: 'none',
          color: colors.text
        }}
      />
    </div>
  );
}
