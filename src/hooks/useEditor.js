import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { htmlToMarkdown, parseMarkdown } from '../utils/markdown';
import { getColors } from '../utils/themes';

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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', title: '', target: '', imageData: null });
  const [imageData, setImageData] = useState({ url: '', alt: '', existingRange: null });
  const [lastSaved, setLastSaved] = useState(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    image: false,
    link: false
  });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [linkTooltipPosition, setLinkTooltipPosition] = useState(null);
  const isOverTooltipRef = useRef(false);
  const hideTooltipTimeoutRef = useRef(null);

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
      const colors = getColors(theme);
      previewRef.current.innerHTML = parseMarkdown(content, colors);
    }
  }, [content, mode, theme]);

  const syncToMarkdown = useCallback(() => {
    if (!previewRef.current) return;
    skipSyncRef.current = true;
    setContentRaw(htmlToMarkdown(previewRef.current));
  }, []);

  const detectFormats = useCallback(() => {
    if (lastActiveEditorRef.current === 'preview' && previewRef.current) {
      // Check if an image or link is selected in preview
      let isImage = false;
      let isLink = false;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Check for link - look for ancestor <a> element
        let node = container;
        while (node && node !== previewRef.current) {
          if (node.nodeName === 'A') {
            isLink = true;
            break;
          }
          node = node.parentNode;
        }

        // Case 1: The container itself is an img
        if (container.nodeName === 'IMG') {
          isImage = true;
        }
        // Case 2: Selection contains an img element
        else if (container.nodeType === Node.ELEMENT_NODE) {
          const fragment = range.cloneContents();
          if (fragment.querySelector('img')) {
            isImage = true;
          }
        }
        // Case 3: Cursor is right before or after an img (collapsed selection)
        if (!isImage && range.collapsed) {
          const node = range.startContainer;
          const offset = range.startOffset;
          if (node.nodeType === Node.ELEMENT_NODE) {
            const child = node.childNodes[offset];
            const prevChild = node.childNodes[offset - 1];
            if ((child && child.nodeName === 'IMG') || (prevChild && prevChild.nodeName === 'IMG')) {
              isImage = true;
            }
          }
        }
      }

      // Check for actual <u> tag, not just link styling
      let hasUnderlineTag = false;
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer;
        while (node && node !== previewRef.current) {
          if (node.nodeName === 'U') {
            hasUnderlineTag = true;
            break;
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: hasUnderlineTag,
        strikethrough: document.queryCommandState('strikeThrough'),
        code: false,
        image: isImage,
        link: isLink
      });
    } else if (textareaRef.current) {
      const s = savedSelectionRef.current.start;
      const e = savedSelectionRef.current.end;
      const txt = content.substring(s, e);
      const before2 = content.substring(Math.max(0, s - 2), s);
      const after2 = content.substring(e, e + 2);
      const before1 = content.substring(Math.max(0, s - 1), s);
      const after1 = content.substring(e, e + 1);

      // Check if cursor is within an image or link markdown syntax
      let isImage = false;
      let isLink = false;
      const searchStart = Math.max(0, s - 200);
      const searchEnd = Math.min(content.length, e + 200);
      const searchText = content.substring(searchStart, searchEnd);
      const cursorInSearch = s - searchStart;

      // Check for image: ![alt](url)
      const imgRegex = /!\[([^\]]*)\]\(((?:[^)(]+|\([^)]*\))+)\)/g;
      let match;
      while ((match = imgRegex.exec(searchText)) !== null) {
        if (cursorInSearch >= match.index && cursorInSearch <= match.index + match[0].length) {
          isImage = true;
          break;
        }
      }

      // Check for link: [text](url) - but not image links
      const linkRegex = /(?<!!)\[([^\]]+)\]\(((?:[^)(]+|\([^)]*\))+)\)/g;
      while ((match = linkRegex.exec(searchText)) !== null) {
        if (cursorInSearch >= match.index && cursorInSearch <= match.index + match[0].length) {
          isLink = true;
          break;
        }
      }

      setActiveFormats({
        bold: (before2 === '**' && after2 === '**') || (txt.startsWith('**') && txt.endsWith('**')),
        italic: (before1 === '*' && after1 === '*' && before2 !== '**' && after2 !== '**') ||
          (txt.startsWith('*') && txt.endsWith('*') && !txt.startsWith('**')),
        underline: (content.substring(Math.max(0, s - 3), s) === '<u>' && content.substring(e, e + 4) === '</u>'),
        strikethrough: (before2 === '~~' && after2 === '~~') || (txt.startsWith('~~') && txt.endsWith('~~')),
        code: (before1 === '`' && after1 === '`') || (txt.startsWith('`') && txt.endsWith('`')),
        image: isImage,
        link: isLink
      });
    }
  }, [content]);

  const formatText = useCallback((pre, suf, cmd) => {
    const ta = textareaRef.current;

    // Preview mode
    if (lastActiveEditorRef.current === 'preview' && (mode === 'render' || mode === 'split')) {
      if (currentRangeRef.current && previewRef.current) {
        previewRef.current.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(currentRangeRef.current);
        }
        skipInputSyncRef.current = true;
        if (cmd) {
          document.execCommand(cmd, false, null);
        } else {
          // Wrap selection with HTML tags
          const selectedText = currentRangeRef.current.toString();
          document.execCommand('insertHTML', false, `${pre}${selectedText}${suf}`);
        }
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
    const isList = pre === '- ' || pre === '1. ';

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

    // Check for existing list prefixes (with possible indentation)
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';
    const lineContent = line.substring(indent.length);

    const bulletMatch = lineContent.match(/^[-*] /);
    const numberMatch = lineContent.match(/^\d+\. /);
    const isCurrentlyBullet = !!bulletMatch;
    const isCurrentlyNumber = !!numberMatch;
    const isCurrentlyList = isCurrentlyBullet || isCurrentlyNumber;

    if (isList && isCurrentlyList) {
      // Already a list item
      const currentPrefix = isCurrentlyBullet ? bulletMatch[0] : numberMatch[0];
      const isSameType = (pre === '- ' && isCurrentlyBullet) || (pre === '1. ' && isCurrentlyNumber);

      if (isSameType) {
        // Same list type: add indentation for nesting
        const newIndent = indent + '  ';
        const restOfLine = lineContent.substring(currentPrefix.length);
        newContent = content.substring(0, ls) + newIndent + pre + restOfLine + content.substring(ae);
        newCursorPos = s + 2; // Added 2 spaces of indentation
      } else {
        // Different list type: switch between bullet and numbered
        const restOfLine = lineContent.substring(currentPrefix.length);
        newContent = content.substring(0, ls) + indent + pre + restOfLine + content.substring(ae);
        newCursorPos = s + (pre.length - currentPrefix.length);
      }
    } else if (line.startsWith(pre)) {
      // Exact match at start (no indent): remove the prefix
      newContent = content.substring(0, ls) + line.substring(pre.length) + content.substring(ae);
      newCursorPos = s - pre.length;
    } else {
      // Not a list or different block type: clean and add prefix
      const clean = lineContent.replace(/^#{1,6} /, '').replace(/^[-*] /, '').replace(/^\d+\. /, '').replace(/^> /, '');
      newContent = content.substring(0, ls) + indent + pre + clean + content.substring(ae);
      newCursorPos = s + pre.length - (lineContent.length - clean.length);
    }

    pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
    setContentRaw(newContent);
  }, [content, mode, syncToMarkdown]);

  const insertText = useCallback((txt, htmlOverride) => {
    const ta = textareaRef.current;

    if (lastActiveEditorRef.current === 'preview' && (mode === 'render' || mode === 'split')) {
      if (previewRef.current && currentRangeRef.current) {
        previewRef.current.focus();
        // Restore the saved selection before inserting
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(currentRangeRef.current);
        }
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
    let imageInfo = null;
    let existingLinkInfo = null;

    if (lastActiveEditorRef.current === 'preview' && previewRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // Check if an image is selected - need to find the actual DOM element, not a clone
        let img = null;
        const container = range.commonAncestorContainer;

        if (container.nodeName === 'IMG') {
          img = container;
        } else if (range.collapsed) {
          // Cursor is collapsed - check adjacent nodes
          const node = range.startContainer;
          const offset = range.startOffset;
          if (node.nodeType === Node.ELEMENT_NODE) {
            const child = node.childNodes[offset];
            const prevChild = node.childNodes[offset - 1];
            if (child && child.nodeName === 'IMG') img = child;
            else if (prevChild && prevChild.nodeName === 'IMG') img = prevChild;
          }
        } else {
          // Selection range - check if it contains an image
          // We need to find the actual element in the DOM, not from cloneContents
          if (container.nodeType === Node.ELEMENT_NODE) {
            // Check children within the selection range
            const imgs = container.querySelectorAll('img');
            for (const candidate of imgs) {
              if (sel.containsNode(candidate, true)) {
                img = candidate;
                break;
              }
            }
          }
          // Also check if the selection is within an element that contains an img
          if (!img) {
            let parent = container;
            while (parent && parent !== previewRef.current) {
              if (parent.querySelector) {
                const found = parent.querySelector('img');
                if (found && sel.containsNode(found, true)) {
                  img = found;
                  break;
                }
              }
              parent = parent.parentNode;
            }
          }
        }

        if (img) {
          // Check if image is already wrapped in a link
          const parentLink = img.closest('a');
          const imgSrc = img.getAttribute('src') || '';
          imageInfo = {
            src: imgSrc,
            alt: img.getAttribute('alt') || '',
            type: 'preview',
            imgSrc: imgSrc, // Use src to re-find the image later
            existingUrl: parentLink ? parentLink.getAttribute('href') : '',
            existingTarget: parentLink ? parentLink.getAttribute('target') || '' : ''
          };
        } else {
          // Check if cursor is inside a text link
          let node = container;
          while (node && node !== previewRef.current) {
            if (node.nodeName === 'A') {
              existingLinkInfo = {
                type: 'preview',
                url: node.getAttribute('href') || '',
                text: node.textContent || '',
                title: node.getAttribute('title') || '',
                target: node.getAttribute('target') || '',
                element: node
              };
              break;
            }
            node = node.parentNode;
          }
          if (!existingLinkInfo && currentRangeRef.current) {
            selectedText = currentRangeRef.current.toString();
          }
        }
      }
    } else if (textareaRef.current) {
      const s = savedSelectionRef.current.start;
      const e = savedSelectionRef.current.end;

      // Check if cursor is within an image markdown syntax
      const searchStart = Math.max(0, s - 200);
      const searchEnd = Math.min(content.length, e + 200);
      const searchText = content.substring(searchStart, searchEnd);
      const cursorInSearch = s - searchStart;

      const imgRegex = /!\[([^\]]*)\]\(((?:[^)(]+|\([^)]*\))+)\)/g;
      let match;
      while ((match = imgRegex.exec(searchText)) !== null) {
        if (cursorInSearch >= match.index && cursorInSearch <= match.index + match[0].length) {
          imageInfo = {
            type: 'textarea',
            src: match[2],
            alt: match[1],
            start: searchStart + match.index,
            end: searchStart + match.index + match[0].length,
            existingUrl: ''
          };
          // Check if already wrapped in a link: [![alt](src)](url)
          const beforeImg = content.substring(Math.max(0, imageInfo.start - 1), imageInfo.start);
          if (beforeImg === '[') {
            const afterImg = content.substring(imageInfo.end);
            const linkMatch = afterImg.match(/^\]\(([^)]+)\)/);
            if (linkMatch) {
              imageInfo.existingUrl = linkMatch[1];
              imageInfo.start = imageInfo.start - 1;
              imageInfo.end = imageInfo.end + linkMatch[0].length;
            }
          }
          break;
        }
      }

      // Check if cursor is within a markdown link: [text](url) or [text](url "title")
      if (!imageInfo) {
        const linkRegex = /(?<!!)\[([^\]]+)\]\(((?:[^)(]+|\([^)]*\))+)(?:\s+"([^"]+)")?\)/g;
        while ((match = linkRegex.exec(searchText)) !== null) {
          if (cursorInSearch >= match.index && cursorInSearch <= match.index + match[0].length) {
            existingLinkInfo = {
              type: 'textarea',
              text: match[1],
              url: match[2],
              title: match[3] || '',
              target: '',
              start: searchStart + match.index,
              end: searchStart + match.index + match[0].length
            };
            break;
          }
        }

        // Check if cursor is within an HTML link: <a href="..." ...>text</a>
        if (!existingLinkInfo) {
          const htmlLinkRegex = /<a\s+([^>]*)>([^<]*)<\/a>/g;
          while ((match = htmlLinkRegex.exec(searchText)) !== null) {
            if (cursorInSearch >= match.index && cursorInSearch <= match.index + match[0].length) {
              const attrs = match[1];
              const hrefMatch = attrs.match(/href="([^"]*)"/);
              const titleMatch = attrs.match(/title="([^"]*)"/);
              const targetMatch = attrs.match(/target="([^"]*)"/);
              existingLinkInfo = {
                type: 'textarea',
                text: match[2],
                url: hrefMatch ? hrefMatch[1] : '',
                title: titleMatch ? titleMatch[1] : '',
                target: targetMatch ? targetMatch[1] : '',
                start: searchStart + match.index,
                end: searchStart + match.index + match[0].length
              };
              break;
            }
          }
        }

        if (!existingLinkInfo) {
          selectedText = content.substring(s, e);
        }
      }
    }

    setLinkData({
      url: imageInfo?.existingUrl || existingLinkInfo?.url || '',
      text: existingLinkInfo?.text || selectedText,
      title: existingLinkInfo?.title || '',
      target: imageInfo?.existingTarget || existingLinkInfo?.target || '',
      imageData: imageInfo,
      existingLink: existingLinkInfo
    });
    setLinkModalOpen(true);
  }, [content]);

  const editLinkFromTooltip = useCallback((linkElement) => {
    if (!linkElement) return;

    // Check if it's an image link
    const img = linkElement.querySelector('img');
    if (img) {
      const imgSrc = img.getAttribute('src') || '';
      setLinkData({
        url: linkElement.getAttribute('href') || '',
        text: '',
        title: linkElement.getAttribute('title') || '',
        target: linkElement.getAttribute('target') || '',
        imageData: {
          src: imgSrc,
          alt: img.getAttribute('alt') || '',
          type: 'preview',
          imgSrc: imgSrc,
          existingUrl: linkElement.getAttribute('href') || '',
          existingTarget: linkElement.getAttribute('target') || ''
        },
        existingLink: null
      });
    } else {
      // Text link
      setLinkData({
        url: linkElement.getAttribute('href') || '',
        text: linkElement.textContent || '',
        title: linkElement.getAttribute('title') || '',
        target: linkElement.getAttribute('target') || '',
        imageData: null,
        existingLink: {
          type: 'preview',
          url: linkElement.getAttribute('href') || '',
          text: linkElement.textContent || '',
          title: linkElement.getAttribute('title') || '',
          target: linkElement.getAttribute('target') || '',
          element: linkElement
        }
      });
    }
    setLinkModalOpen(true);
  }, []);

  const handleInsertLink = useCallback((url, text, title, target) => {
    const imgData = linkData.imageData;
    const existingLink = linkData.existingLink;

    // Build HTML attributes
    const buildAttrs = (extraAttrs = '') => {
      let attrs = `href="${url}"`;
      if (title) attrs += ` title="${title}"`;
      if (target) attrs += ` target="${target}"`;
      if (extraAttrs) attrs += ` ${extraAttrs}`;
      return attrs;
    };

    if (imgData) {
      // Wrapping an image in a link
      const imgMd = `![${imgData.alt}](${imgData.src})`;
      // If target is set, use HTML syntax since markdown doesn't support target
      const linkedImgMd = target
        ? `<a ${buildAttrs()}>${imgMd}</a>`
        : `[${imgMd}](${url})`;

      if (imgData.type === 'preview' && previewRef.current) {
        // Preview mode: find the image by src and wrap or update its link
        const img = previewRef.current.querySelector(`img[src="${imgData.imgSrc}"]`);
        if (img) {
          const parentLink = img.closest('a');
          if (parentLink) {
            parentLink.setAttribute('href', url);
            if (target) parentLink.setAttribute('target', target);
            else parentLink.removeAttribute('target');
            if (title) parentLink.setAttribute('title', title);
            else parentLink.removeAttribute('title');
          } else {
            const link = document.createElement('a');
            link.href = url;
            if (target) link.target = target;
            if (title) link.title = title;
            img.parentNode.insertBefore(link, img);
            link.appendChild(img);
          }
          skipSyncRef.current = true;
          setContentRaw(htmlToMarkdown(previewRef.current));
        }
      } else if (imgData.type === 'textarea' && imgData.start !== undefined) {
        // Textarea mode: replace the image (or linked image) with linked version
        const newContent = content.substring(0, imgData.start) + linkedImgMd + content.substring(imgData.end);
        const newCursorPos = imgData.start + linkedImgMd.length;
        pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
        setContentRaw(newContent);
      }
    } else if (existingLink) {
      // Updating an existing link
      const linkText = text || url;
      const md = target
        ? `<a ${buildAttrs()}>${linkText}</a>`
        : (title ? `[${linkText}](${url} "${title}")` : `[${linkText}](${url})`);
      const html = `<a ${buildAttrs()}>${linkText}</a>`;

      if (existingLink.type === 'preview' && existingLink.element && previewRef.current) {
        // Update the existing link element in preview
        existingLink.element.setAttribute('href', url);
        existingLink.element.textContent = linkText;
        if (target) existingLink.element.setAttribute('target', target);
        else existingLink.element.removeAttribute('target');
        if (title) existingLink.element.setAttribute('title', title);
        else existingLink.element.removeAttribute('title');
        skipSyncRef.current = true;
        setContentRaw(htmlToMarkdown(previewRef.current));
      } else if (existingLink.type === 'textarea' && existingLink.start !== undefined) {
        // Replace the existing link in textarea
        const newContent = content.substring(0, existingLink.start) + md + content.substring(existingLink.end);
        const newCursorPos = existingLink.start + md.length;
        pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
        setContentRaw(newContent);
      }
    } else {
      // Regular text link (new)
      const linkText = text || url;
      // If target is set, use HTML syntax since markdown doesn't support target
      const md = target
        ? `<a ${buildAttrs()}>${linkText}</a>`
        : (title ? `[${linkText}](${url} "${title}")` : `[${linkText}](${url})`);
      const html = `<a ${buildAttrs()}>${linkText}</a>`;
      insertText(md, html);
    }
  }, [insertText, linkData.imageData, linkData.existingLink, content]);

  const handleOpenImageModal = useCallback(() => {
    let imgUrl = '';
    let imgAlt = '';
    let existingRange = null;

    // Check if an image is selected in preview mode
    if (lastActiveEditorRef.current === 'preview' && previewRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // Check if selection contains or is within an image
        let img = null;
        if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
          img = range.startContainer.querySelector('img');
        }
        if (!img && range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {
          img = range.commonAncestorContainer.querySelector('img');
        }
        if (!img) {
          // Check if the selection is right before/after an img
          const parent = range.startContainer.parentElement;
          if (parent) {
            img = parent.querySelector('img');
          }
        }
        if (img) {
          imgUrl = img.getAttribute('src') || '';
          imgAlt = img.getAttribute('alt') || '';
          // Store a reference to select the image for replacement
          existingRange = { type: 'preview', element: img };
        }
      }
    } else if (textareaRef.current) {
      // Check if cursor is within an image markdown syntax in textarea
      const s = savedSelectionRef.current.start;
      const e = savedSelectionRef.current.end;

      // Look for image pattern around cursor: ![alt](url)
      const searchStart = Math.max(0, s - 200);
      const searchEnd = Math.min(content.length, e + 200);
      const searchText = content.substring(searchStart, searchEnd);
      const cursorInSearch = s - searchStart;

      // Find all image patterns in the search area
      const imgRegex = /!\[([^\]]*)\]\(((?:[^)(]+|\([^)]*\))+)\)/g;
      let match;
      while ((match = imgRegex.exec(searchText)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        // Check if cursor is within this match
        if (cursorInSearch >= matchStart && cursorInSearch <= matchEnd) {
          imgAlt = match[1];
          imgUrl = match[2];
          // Store the absolute position of the match for replacement
          existingRange = {
            type: 'textarea',
            start: searchStart + matchStart,
            end: searchStart + matchEnd
          };
          break;
        }
      }
    }

    setImageData({ url: imgUrl, alt: imgAlt, existingRange });
    setImageModalOpen(true);
  }, [content]);

  const handleInsertImage = useCallback((url, alt) => {
    const md = `![${alt || ''}](${url})`;
    const html = `<img src="${url}" alt="${alt || ''}" style="max-width:100%"/>`;
    const existing = imageData.existingRange;

    if (existing) {
      if (existing.type === 'textarea') {
        // Replace the existing image in textarea
        const newContent = content.substring(0, existing.start) + md + content.substring(existing.end);
        const newCursorPos = existing.start + md.length;
        pendingSelectionRef.current = { start: newCursorPos, end: newCursorPos };
        setContentRaw(newContent);
      } else if (existing.type === 'preview' && existing.element && previewRef.current) {
        // Replace the existing image in preview
        const newImg = document.createElement('img');
        newImg.src = url;
        newImg.alt = alt || '';
        newImg.style.maxWidth = '100%';
        existing.element.replaceWith(newImg);
        skipSyncRef.current = true;
        setContentRaw(htmlToMarkdown(previewRef.current));
      }
    } else {
      // Insert new image
      insertText(md, html);
    }
  }, [insertText, imageData.existingRange, content]);

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

  const handlePreviewMouseOver = useCallback((e) => {
    const link = e.target.closest('a');
    if (link && previewRef.current?.contains(link)) {
      // Clear any pending hide timeout
      if (hideTooltipTimeoutRef.current) {
        clearTimeout(hideTooltipTimeoutRef.current);
        hideTooltipTimeoutRef.current = null;
      }
      const rect = link.getBoundingClientRect();
      setHoveredLink(link);
      setLinkTooltipPosition({
        x: rect.left,
        y: rect.bottom + 4
      });
    }
  }, []);

  const handlePreviewMouseOut = useCallback((e) => {
    const link = e.target.closest('a');
    const relatedTarget = e.relatedTarget;
    // Only start hide timer if we're leaving the link and not going to another part of it
    if (link && (!relatedTarget || !link.contains(relatedTarget))) {
      // Delay hiding to allow mouse to reach the tooltip
      hideTooltipTimeoutRef.current = setTimeout(() => {
        if (!isOverTooltipRef.current) {
          setHoveredLink(null);
          setLinkTooltipPosition(null);
        }
      }, 100);
    }
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    isOverTooltipRef.current = true;
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current);
      hideTooltipTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    isOverTooltipRef.current = false;
    setHoveredLink(null);
    setLinkTooltipPosition(null);
  }, []);

  const hideLinkTooltip = useCallback(() => {
    isOverTooltipRef.current = false;
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current);
      hideTooltipTimeoutRef.current = null;
    }
    setHoveredLink(null);
    setLinkTooltipPosition(null);
  }, []);

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
    imageModalOpen,
    exportModalOpen,
    linkData,
    imageData,
    lastSaved,
    activeFormats,
    hoveredLink,
    linkTooltipPosition,

    // Setters
    setMode,
    setTheme,
    setSplitDirection,
    setPanelsSwapped,
    setSpellCheck,
    setLinkModalOpen,
    setImageModalOpen,
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
    editLinkFromTooltip,
    handleInsertLink,
    handleOpenImageModal,
    handleInsertImage,
    handleTextareaChange,
    handleTextareaSelect,
    handleTextareaFocus,
    handlePreviewInput,
    handlePreviewFocus,
    handlePreviewMouseUp,
    handlePreviewKeyUp,
    handlePreviewMouseOver,
    handlePreviewMouseOut,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    hideLinkTooltip,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
    clearSavedData,
  };
}
