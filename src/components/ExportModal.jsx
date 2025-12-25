import React from 'react';
import { CloseIcon } from '../icons';
import { parseMarkdown } from '../utils/markdown';

export function ExportModal({ isOpen, onClose, content, colors }) {
  if (!isOpen) return null;

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const exportMarkdown = () => {
    downloadFile(content, 'document.md', 'text/markdown');
  };

  const exportHtml = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
${parseMarkdown(content)}
</body>
</html>`;
    downloadFile(html, 'document.html', 'text/html');
  };

  const exportText = () => {
    const text = content
      .replace(/^#{1,6} /gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/<u>(.+?)<\/u>/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[-*] /gm, '• ')
      .replace(/^> /gm, '');
    downloadFile(text, 'document.txt', 'text/plain');
  };

  const buttonStyle = {
    padding: '12px 20px',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    background: colors.bgSecondary,
    color: colors.text,
    cursor: 'pointer',
    fontSize: 14,
    textAlign: 'left',
    display: 'block',
    width: '100%',
    marginBottom: 8
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: colors.bg,
        borderRadius: 12,
        padding: 24,
        width: 320,
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h3 style={{ margin: 0, color: colors.text }}>Export Document</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.textSecondary,
              padding: 4
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <button onClick={exportMarkdown} style={buttonStyle}>
          <strong>Markdown</strong>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            .md file with formatting
          </div>
        </button>

        <button onClick={exportHtml} style={buttonStyle}>
          <strong>HTML</strong>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            Standalone web page
          </div>
        </button>

        <button onClick={exportText} style={buttonStyle}>
          <strong>Plain Text</strong>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            .txt without formatting
          </div>
        </button>
      </div>
    </div>
  );
}
