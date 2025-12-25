import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { htmlToMarkdown, parseMarkdown } from '../utils/markdown';

const DEFAULT_CONTENT = `# Welcome to the Editor

This is a **WYSIWYG** markdown editor with *live preview*.

## Features
- **Bold**, *italic*, <u>underline</u>, ~~strikethrough~~, \`code\`
- [Links](https://example.com) and images
- Lists, quotes, and more

> This is a blockquote

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

---

Start editing to see the magic!`;

export function useEditor({ defaultValue, demo } = {}) {
  const initialContent = defaultValue ?? (demo ? DEFAULT_CONTENT : '');
  const [content, setContentRaw] = useState(initialContent);
  const [mode, setMode] = useState('split');
  const [theme, setTheme] = useState('light');
  const [splitDirection, setSplitDirection] = useState('horizontal');
  const [splitRatio, setSplitRatio] = useState(50);
  const [panelsSwapped, setPanelsSwapped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [spellCheck, setSpellCheck] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', title: '' });
  const [lastSaved, setLastSaved] = useState(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false
  });

  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const editorContainerRef = useRef(null);
  const skipSyncRef = useRef(false);
  const currentRangeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const savedSelectionRef = useRef({ start: 0, end: 0 });
  const lastActiveEditorRef = useRef('textarea');
  const pendingSelectionRef = useRef(null);
  const skipInputSyncRef = useRef(false);

  // Restore selection after React re-renders
  useLayoutEffect(() => {
    if (pendingSelectionRef.current !== null) {
      const { start, end } = pendingSelectionRef.current;
      pendingSelectionRef.current = null;
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(start, end);
        savedSelectionRef.current = { start, end };
      }
    }
  });

  // Autosave
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem('wysiwyg-content', content);
        setLastSaved(new Date());
      } catch (e) {}
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wysiwyg-content');
      if (saved) setContentRaw(saved);
      const savedTheme = localStorage.getItem('wysiwyg-theme');
      if (savedTheme) setTheme(savedTheme);
    } catch (e) {}
  }, []);

  // Save theme
  useEffect(() => {
    try {
      localStorage.setItem('wysiwyg-theme', theme);
    } catch (e) {}
  }, [theme]);

  // Auto-detect mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) setSplitDirection('vertical');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update spellcheck
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.spellcheck = spellCheck;
      previewRef.current.contentEditable = 'false';
      requestAnimationFrame(() => {
        if (previewRef.current) {
          previewRef.current.contentEditable = 'true';
        }
      });
    }
  }, [spellCheck]);

  // Sync preview
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    if (previewRef.current && document.activeElement !== previewRef.current) {
      previewRef.current.innerHTML = parseMarkdown(content);
    }
  }, [content, mode]);

  const syncToMarkdown = useCallback(() => {
    if (!previewRef.current) return;
    skipSyncRef.current = true;
    setContentRaw(htmlToMarkdown(previewRef.current));
  }, []);

  const detectFormats = useCallback(() => {
    if (lastActiveEditorRef.current === 'preview' && previewRef.current) {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        code: false
      });
    } else if (textareaRef.current) {
      const s = savedSelectionRef.current.start;
      const e = savedSelectionRef.current.end;
      const txt = content.substring(s, e);
      const before2 = content.substring(Math.max(0, s - 2), s);
      const after2 = content.substring(e, e + 2);
      const before1 = content.substring(Math.max(0, s - 1), s);
      const after1 = content.substring(e, e + 1);

      setActiveFormats({
        bold: (before2 === '**' && after2 === '**') || (txt.startsWith('**') && txt.endsWith('**')),
        italic: (before1 === '*' && after1 === '*' && before2 !== '**' && after2 !== '**') ||
          (txt.startsWith('*') && txt.endsWith('*') && !txt.startsWith('**')),
        underline: (content.substring(Math.max(0, s - 3), s) === '<u>' && content.substring(e, e + 4) === '</u>'),
        strikethrough: (before2 === '~~' && after2 === '~~') || (txt.startsWith('~~') && txt.endsWith('~~')),
        code: (before1 === '`' && after1 === '`') || (txt.startsWith('`') && txt.endsWith('`'))
      });
    }
  }, [content]);

  const formatText = useCallback((pre, suf, cmd) => {
    const ta = textareaRef.current;

    // Preview mode
    if (lastActiveEditorRef.current === 'preview' && (mode === 'render' || mode === 'split')) {
      if (cmd && currentRangeRef.current && previewRef.current) {
        previewRef.current.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(currentRangeRef.current);
        }
        skipInputSyncRef.current = true;
        document.execCommand(cmd, false, null);
        const newSel = window.getSelection();
        if (newSel && newSel.rangeCount > 0) {
          currentRangeRef.current = newSel.getRangeAt(0).cloneRange();
        }
        if (previewRef.current) {
          skipSyncRef.current = true;
          setContentRaw(htmlToMarkdown(previewRef.current));
        }
      }
      return;
    }

    // Textarea mode
    if (!ta) return;
    const s = savedSelectionRef.current.start;
    const e = savedSelectionRef.current.end;
    const txt = content.substring(s, e);
    const preLen = pre.length;
    const sufLen = suf.length;
    const before = content.substring(Math.max(0, s - preLen), s);
    const after = content.substring(e, e + sufLen);

    let newContent, newStart, newEnd;

    if (before === pre && after === suf) {
      newContent = content.substring(0, s - preLen) + txt + content.substring(e + sufLen);
      newStart = s - preLen;
      newEnd = newStart + txt.length;
    } else if (txt.startsWith(pre) && txt.endsWith(suf) && txt.length >= preLen + sufLen) {
      const inner = txt.substring(preLen, txt.length - sufLen);
      if (inner.startsWith(pre) && inner.endsWith(suf)) {
        newContent = content.substring(0, s) + pre + txt + suf + content.substring(e);
        newStart = s;
        newEnd = s + pre.length + txt.length + suf.length;
      } else {
        newContent = content.substring(0, s) + inner + content.substring(e);
        newStart = s;
        newEnd = s + inner.length;
      }
    } else {
      newContent = content.substring(0, s) + pre + txt + suf + content.substring(e);
      newStart = s;
      newEnd = s + pre.length + txt.length + suf.length;
    }

    pendingSelectionRef.current = { start: newStart, end: newEnd };
    setContentRaw(newContent);
  }, [content, mode]);

  const toggleBlock = useCallback((pre, tag) => {
    const ta = textareaRef.current;

    if (lastActiveEditorRef.current === 'preview' && (mode === 'render' || mode === 'split')) {
      if (currentRangeRef.current && previewRef.current) {
        previewRef.current.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(currentRangeRef.current);
        }
        if (tag) document.execCommand('formatBlock', false, tag);
        else if (pre === '- ') document.execCommand('insertUnorderedList', false, null);
        else if (pre === '1. ') document.execCommand('insertOrderedList', false, null);
        syncToMarkdown();
      }
      return;
    }

    if (!ta) return;
    const s = savedSelectionRef.current.start;
    const ls = content.lastIndexOf('\n', s - 1) + 1;
    const le = content.indexOf('\n', s);
    const ae = le === -1 ? content.length : le;
    const line = content.substring(ls, ae);
    let newContent, newCursorPos;

    if (line.startsWith(pre)) {
      newContent = content.substring(0, ls) + line.substring(pre.length) + content.substring(ae);
      newCursorPos = s - pre.length;
    } else {
      const clean = line.replace(/^#{1,6} /, '').replace(/^[-*] /, '').replace(/^\d+\. /, '').replace(/^> /, '');
      newContent = content.substring(0, ls) + pre + clean + content.substring(ae);
      newCursorPos = s + pre.length - (line.length - clean.length);
    }

    pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
    setContentRaw(newContent);
  }, [content, mode, syncToMarkdown]);

  const insertText = useCallback((txt, htmlOverride) => {
    const ta = textareaRef.current;

    if (lastActiveEditorRef.current === 'preview' && (mode === 'render' || mode === 'split')) {
      if (previewRef.current) {
        previewRef.current.focus();
        document.execCommand('insertHTML', false, htmlOverride || txt);
        syncToMarkdown();
      }
      return;
    }

    if (!ta) return;
    const s = savedSelectionRef.current.start;
    const e = savedSelectionRef.current.end;
    const newContent = content.substring(0, s) + txt + content.substring(e);
    const newCursorPos = s + txt.length;

    pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
    setContentRaw(newContent);
  }, [content, mode, syncToMarkdown]);

  const handleOpenLinkModal = useCallback(() => {
    let selectedText = '';
    if (lastActiveEditorRef.current === 'preview' && currentRangeRef.current) {
      selectedText = currentRangeRef.current.toString();
    } else if (textareaRef.current) {
      const s = savedSelectionRef.current.start;
      const e = savedSelectionRef.current.end;
      selectedText = content.substring(s, e);
    }
    setLinkData({ url: '', text: selectedText, title: '' });
    setLinkModalOpen(true);
  }, [content]);

  const handleInsertLink = useCallback((url, text, title) => {
    const linkText = text || url;
    const md = title ? `[${linkText}](${url} "${title}")` : `[${linkText}](${url})`;
    const html = title ? `<a href="${url}" title="${title}">${linkText}</a>` : `<a href="${url}">${linkText}</a>`;
    insertText(md, html);
  }, [insertText]);

  const handleTextareaChange = useCallback((e) => {
    const ta = e.target;
    setContentRaw(ta.value);
    savedSelectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  }, []);

  const handleTextareaSelect = useCallback((e) => {
    const ta = e.target;
    savedSelectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
    lastActiveEditorRef.current = 'textarea';
    detectFormats();
  }, [detectFormats]);

  const handleTextareaFocus = useCallback(() => {
    lastActiveEditorRef.current = 'textarea';
  }, []);

  const handlePreviewInput = useCallback(() => {
    if (skipInputSyncRef.current) {
      skipInputSyncRef.current = false;
      return;
    }
    syncToMarkdown();
  }, [syncToMarkdown]);

  const handlePreviewFocus = useCallback(() => {
    lastActiveEditorRef.current = 'preview';
  }, []);

  const handlePreviewMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      currentRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    detectFormats();
  }, [detectFormats]);

  const handlePreviewKeyUp = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      currentRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    detectFormats();
  }, [detectFormats]);

  // Drag handlers
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    e.target.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || !editorContainerRef.current) return;
    const rect = editorContainerRef.current.getBoundingClientRect();
    const isVertical = splitDirection === 'vertical';
    let ratio;
    if (isVertical) {
      ratio = ((e.clientY - rect.top) / rect.height) * 100;
    } else {
      ratio = ((e.clientX - rect.left) / rect.width) * 100;
    }
    setSplitRatio(Math.min(80, Math.max(20, ratio)));
  }, [splitDirection]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === 'b') {
        e.preventDefault();
        formatText('**', '**', 'bold');
      } else if (k === 'i') {
        e.preventDefault();
        formatText('*', '*', 'italic');
      } else if (k === 'u') {
        e.preventDefault();
        formatText('<u>', '</u>', 'underline');
      } else if (k === 'k') {
        e.preventDefault();
        handleOpenLinkModal();
      } else if (k === 's') {
        e.preventDefault();
        setExportModalOpen(true);
      }
    }
  }, [formatText, handleOpenLinkModal]);

  const clearSavedData = useCallback(() => {
    if (window.confirm('Clear saved data and reset to default content?')) {
      try {
        localStorage.removeItem('wysiwyg-content');
      } catch (e) {}
      setContentRaw(defaultValue ?? (demo ? DEFAULT_CONTENT : ''));
      setLastSaved(null);
    }
  }, [defaultValue, demo]);

  return {
    // State
    content,
    mode,
    theme,
    splitDirection,
    splitRatio,
    panelsSwapped,
    isDragging,
    spellCheck,
    linkModalOpen,
    exportModalOpen,
    linkData,
    lastSaved,
    activeFormats,

    // Setters
    setMode,
    setTheme,
    setSplitDirection,
    setPanelsSwapped,
    setSpellCheck,
    setLinkModalOpen,
    setExportModalOpen,

    // Refs
    textareaRef,
    previewRef,
    editorContainerRef,

    // Handlers
    formatText,
    toggleBlock,
    insertText,
    handleOpenLinkModal,
    handleInsertLink,
    handleTextareaChange,
    handleTextareaSelect,
    handleTextareaFocus,
    handlePreviewInput,
    handlePreviewFocus,
    handlePreviewMouseUp,
    handlePreviewKeyUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
    clearSavedData,
  };
}
