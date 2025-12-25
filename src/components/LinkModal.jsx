import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from '../icons';

export function LinkModal({ isOpen, onClose, onInsert, initialUrl, initialText, initialTitle, colors }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [text, setText] = useState(initialText || '');
  const [title, setTitle] = useState(initialTitle || '');
  const urlInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || '');
      setText(initialText || '');
      setTitle(initialTitle || '');
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialUrl, initialText, initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onInsert(url, text, title);
      onClose();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 14,
    background: colors.bg,
    color: colors.text,
    outline: 'none',
    boxSizing: 'border-box'
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
        width: 400,
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h3 style={{ margin: 0, color: colors.text }}>Insert Link</h3>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              marginBottom: 6,
              color: colors.textSecondary,
              fontSize: 13
            }}>
              URL *
            </label>
            <input
              ref={urlInputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              marginBottom: 6,
              color: colors.textSecondary,
              fontSize: 13
            }}>
              Text (optional)
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 6,
              color: colors.textSecondary,
              fontSize: 13
            }}>
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link title (tooltip)"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                background: colors.bg,
                color: colors.text,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 6,
                background: colors.accent,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              Insert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
