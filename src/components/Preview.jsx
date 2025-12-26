import React, { useMemo } from 'react';
import { parseMarkdown } from '../utils/markdown';
import { getColors } from '../utils/themes';
import { getPreviewStyles } from '../utils/styles';

export function Viewer({ content, theme = 'light', style }) {
  const colors = getColors(theme);
  const html = useMemo(() => parseMarkdown(content || ''), [content]);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: colors.bg,
      color: colors.text,
      ...style
    }}>
      <style>{getPreviewStyles(colors)}</style>
      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          padding: 24,
          fontSize: 16,
          lineHeight: 1.7
        }}
      />
    </div>
  );
}
