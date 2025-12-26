import React from 'react';

export function PreviewPanel({
  previewRef,
  onInput,
  onKeyDown,
  onFocus,
  onMouseUp,
  onKeyUp,
  onMouseOver,
  onMouseOut,
  colors,
  style
}) {
  return (
    <div
      ref={previewRef}
      contentEditable
      onInput={onInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onMouseUp={onMouseUp}
      onKeyUp={onKeyUp}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      suppressContentEditableWarning
      className="preview-content"
      style={{
        padding: 24,
        overflow: 'auto',
        background: colors.bg,
        fontSize: 16,
        lineHeight: 1.7,
        outline: 'none',
        color: colors.text,
        minWidth: 0,
        minHeight: 0,
        ...style
      }}
    />
  );
}
