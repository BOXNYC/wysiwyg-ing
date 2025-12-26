import React from 'react';
import { LinkIcon } from '../icons';

export function LinkTooltip({ link, position, colors, onEdit, onMouseEnter, onMouseLeave }) {
  if (!link || !position) return null;

  const href = link.getAttribute('href') || '';
  const target = link.getAttribute('target') || '';
  const opensInNewTab = target === '_blank';

  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (opensInNewTab) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = href;
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: 350,
        fontSize: 13
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span style={{ color: colors.textSecondary, flexShrink: 0 }}>
        <LinkIcon />
      </span>
      <a
        href={href}
        onClick={handleOpen}
        style={{
          color: colors.accent,
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}
        title={href}
      >
        {href}
      </a>
      {opensInNewTab && (
        <span
          style={{
            fontSize: 11,
            color: colors.textSecondary,
            background: colors.codeBg || colors.border,
            padding: '2px 6px',
            borderRadius: 4,
            flexShrink: 0
          }}
        >
          new tab
        </span>
      )}
      <button
        onClick={handleEdit}
        style={{
          background: 'none',
          border: `1px solid ${colors.border}`,
          borderRadius: 4,
          padding: '4px 8px',
          cursor: 'pointer',
          color: colors.text,
          fontSize: 12,
          flexShrink: 0
        }}
      >
        Edit
      </button>
    </div>
  );
}
