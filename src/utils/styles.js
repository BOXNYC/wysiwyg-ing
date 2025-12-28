export function getPreviewStyles(colors) {
  return `
    .preview-content h1 { font-size: 2em; font-weight: 700; margin: 0 0 0.5em 0; border-bottom: 2px solid ${colors.border}; padding-bottom: 0.3em; }
    .preview-content h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em 0; }
    .preview-content h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em 0; }
    .preview-content p { margin: 0 0 1em 0; }
    .preview-content a { color: ${colors.accent}; text-decoration: none; }
    .preview-content a:hover { text-decoration: underline; }
    .preview-content code.inline-code { background: ${colors.bgTertiary}; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    .preview-content pre { background: ${colors.bgSecondary}; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
    .preview-content pre code { background: none; padding: 0; font-family: monospace; }
    .preview-content blockquote { border-left: 4px solid ${colors.accent}; margin: 1em 0; padding-left: 1em; color: ${colors.textSecondary}; }
    .preview-content ul, .preview-content ol { margin: 0 0 1em 1.5em; padding: 0; }
    .preview-content li { margin: 0.25em 0; }
    .preview-content hr { border: none; border-top: 2px solid ${colors.border}; margin: 2em 0; }
    .preview-content img { max-width: 100%; border-radius: 8px; }
  `;
}
