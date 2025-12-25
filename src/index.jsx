import React from 'react';
import { useEditor } from './hooks/useEditor';
import { getColors } from './utils/themes';
import { getPreviewStyles } from './utils/styles';
import {
  Toolbar,
  LinkModal,
  ExportModal,
  CodePanel,
  PreviewPanel,
  SplitDivider,
  ModeSelector
} from './components';
import { SunIcon, MoonIcon, SpellcheckIcon, SwapIcon } from './icons';

export default function WysiwygEditor({ defaultValue, demo } = {}) {
  const normalizedDefault = defaultValue?.replace(/^[ \t]+/gm, '').trim();
  const editor = useEditor({ defaultValue: normalizedDefault, demo });
  const colors = getColors(editor.theme);
  const isVertical = editor.splitDirection === 'vertical';

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: colors.bg,
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden'
    }}>
      <style>{getPreviewStyles(colors)}</style>

      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <Toolbar
          colors={colors}
          activeFormats={editor.activeFormats}
          onBold={() => editor.formatText('**', '**', 'bold')}
          onItalic={() => editor.formatText('*', '*', 'italic')}
          onUnderline={() => editor.formatText('<u>', '</u>', 'underline')}
          onStrikethrough={() => editor.formatText('~~', '~~', 'strikeThrough')}
          onCode={() => editor.formatText('`', '`')}
          onLink={editor.handleOpenLinkModal}
          onQuote={() => editor.toggleBlock('> ')}
          onBulletList={() => editor.toggleBlock('- ')}
          onNumberList={() => editor.toggleBlock('1. ')}
          onH1={() => editor.toggleBlock('# ', 'h1')}
          onH2={() => editor.toggleBlock('## ', 'h2')}
          onH3={() => editor.toggleBlock('### ', 'h3')}
          onHR={() => editor.insertText('\n\n---\n\n', '<hr/>')}
          onExport={() => editor.setExportModalOpen(true)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ModeSelector
            mode={editor.mode}
            onChange={editor.setMode}
            colors={colors}
          />

          {editor.mode === 'split' && (
            <>
              <button
                onClick={() => editor.setSplitDirection(d => d === 'horizontal' ? 'vertical' : 'horizontal')}
                title={isVertical ? 'Horizontal split' : 'Vertical split'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                  background: colors.bg,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  transform: isVertical ? 'rotate(90deg)' : 'none'
                }}
              >
                <SwapIcon />
              </button>
              <button
                onClick={() => editor.setPanelsSwapped(s => !s)}
                title="Swap panels"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                  background: colors.bg,
                  color: colors.textSecondary,
                  cursor: 'pointer'
                }}
              >
                ⇄
              </button>
            </>
          )}

          <button
            onClick={() => editor.setSpellCheck(s => !s)}
            title={editor.spellCheck ? 'Disable spellcheck' : 'Enable spellcheck'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              border: `1px solid ${editor.spellCheck ? colors.accent : colors.border}`,
              borderRadius: 6,
              background: editor.spellCheck ? colors.accentLight : colors.bg,
              color: editor.spellCheck ? colors.accent : colors.textSecondary,
              cursor: 'pointer'
            }}
          >
            <SpellcheckIcon />
          </button>

          <button
            onClick={() => editor.setTheme(t => t === 'light' ? 'dark' : 'light')}
            title={editor.theme === 'light' ? 'Dark mode' : 'Light mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              background: colors.bg,
              color: colors.textSecondary,
              cursor: 'pointer'
            }}
          >
            {editor.theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editor.editorContainerRef}
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          height: 500
        }}
      >
        {(() => {
          const codePanel = (editor.mode === 'code' || editor.mode === 'split') && (
            <CodePanel
              key="code"
              textareaRef={editor.textareaRef}
              content={editor.content}
              onChange={editor.handleTextareaChange}
              onSelect={editor.handleTextareaSelect}
              onFocus={editor.handleTextareaFocus}
              onKeyDown={editor.handleKeyDown}
              colors={colors}
              style={editor.mode === 'split'
                ? (isVertical
                  ? { height: `${editor.panelsSwapped ? 100 - editor.splitRatio : editor.splitRatio}%` }
                  : { width: `${editor.panelsSwapped ? 100 - editor.splitRatio : editor.splitRatio}%` })
                : { flex: 1 }
              }
            />
          );

          const divider = editor.mode === 'split' && (
            <SplitDivider
              key="divider"
              isVertical={isVertical}
              isDragging={editor.isDragging}
              onPointerDown={editor.handlePointerDown}
              onPointerMove={editor.handlePointerMove}
              onPointerUp={editor.handlePointerUp}
              colors={colors}
            />
          );

          const previewPanel = (editor.mode === 'render' || editor.mode === 'split') && (
            <PreviewPanel
              key="preview"
              previewRef={editor.previewRef}
              onInput={editor.handlePreviewInput}
              onKeyDown={editor.handleKeyDown}
              onFocus={editor.handlePreviewFocus}
              onMouseUp={editor.handlePreviewMouseUp}
              onKeyUp={editor.handlePreviewKeyUp}
              colors={colors}
              style={editor.mode === 'split'
                ? (isVertical
                  ? { height: `${editor.panelsSwapped ? editor.splitRatio : 100 - editor.splitRatio}%` }
                  : { width: `${editor.panelsSwapped ? editor.splitRatio : 100 - editor.splitRatio}%` })
                : { flex: 1 }
              }
            />
          );

          if (editor.mode === 'code') return codePanel;
          if (editor.mode === 'render') return previewPanel;

          return editor.panelsSwapped
            ? [previewPanel, divider, codePanel]
            : [codePanel, divider, previewPanel];
        })()}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${colors.border}`,
        fontSize: 12,
        color: colors.textMuted,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>{editor.content.length} characters</span>
        {editor.lastSaved && (
          <span
            onClick={editor.clearSavedData}
            style={{ cursor: 'pointer' }}
            title="Click to clear saved data"
          >
            Saved {editor.lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Modals */}
      <LinkModal
        isOpen={editor.linkModalOpen}
        onClose={() => editor.setLinkModalOpen(false)}
        onInsert={editor.handleInsertLink}
        initialUrl={editor.linkData.url}
        initialText={editor.linkData.text}
        initialTitle={editor.linkData.title}
        colors={colors}
      />

      <ExportModal
        isOpen={editor.exportModalOpen}
        onClose={() => editor.setExportModalOpen(false)}
        content={editor.content}
        colors={colors}
      />
    </div>
  );
}
