import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WysiwygEditor from '../src/index.jsx';
import { Viewer } from '../src/components';

const DEMO_CONTENT = `# Viewer Component Demo

This is the **Viewer** component rendered below the editor.

It displays markdown content *without* any editing UI.

- Read-only display
- Supports light/dark themes
- Same styling as the editor preview`;

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <>
      <WysiwygEditor />

      <div style={{ marginTop: 40 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Viewer Component</h2>
          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Toggle Theme ({theme})
          </button>
        </div>
        <Viewer
          content={DEMO_CONTENT}
          theme={theme}
          style={{
            borderRadius: 12,
            border: '1px solid #e0e0e0'
          }}
        />
      </div>
    </>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
