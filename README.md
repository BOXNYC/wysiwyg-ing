# wysiwyg-ing

A beautiful, feature-rich WYSIWYG markdown editor for React with dual-mode editing, live preview, and extensive formatting options.

## Features

- **Dual-mode editing**: Switch between code (markdown), preview (WYSIWYG), and split view
- **Live preview**: See your formatted content in real-time
- **Rich formatting**: Bold, italic, underline, strikethrough, code, headings, lists, quotes, links
- **Active format detection**: Toolbar buttons highlight when cursor is on formatted text
- **Format toggling**: Click a format button again to remove formatting
- **Dark/Light themes**: Beautiful themes with smooth transitions
- **Responsive split view**: Horizontal or vertical split with draggable resizer
- **Keyboard shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline), Ctrl+K (link)
- **Auto-save**: Content automatically saved to localStorage
- **Export options**: Export as Markdown, HTML, or plain text
- **Spell check toggle**: Enable/disable browser spell checking
- **Mobile friendly**: Responsive design with touch support

## Installation

```bash
npm install wysiwyg-ing
```

## Usage

```jsx
import WysiwygEditor from 'wysiwyg-ing';

function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <WysiwygEditor />
    </div>
  );
}

export default App;
```

## Development

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/wysiwyg-ing.git
cd wysiwyg-ing

# Install dependencies
npm install
```

### Running the Demo

```bash
# Start development server with hot reload
npm run dev
```

This opens a demo at `http://localhost:5173` where you can test the editor.

### Building

```bash
# Build the library for npm
npm run build

# Build the demo site
npm run build:demo

# Test both builds
npm run test:build
```

### Publishing to npm

```bash
# Make sure you're logged in
npm login

# Build and publish
npm publish
```

## Project Structure

```
wysiwyg-ing/
├── src/
│   ├── components/       # React components
│   │   ├── Toolbar.jsx
│   │   ├── CodePanel.jsx
│   │   ├── PreviewPanel.jsx
│   │   ├── LinkModal.jsx
│   │   ├── ExportModal.jsx
│   │   └── ...
│   ├── hooks/
│   │   └── useEditor.js  # Main editor logic
│   ├── icons/
│   │   └── index.jsx     # SVG icons
│   ├── utils/
│   │   ├── themes.js     # Color themes
│   │   ├── markdown.js   # MD parser
│   │   └── styles.js     # CSS styles
│   └── index.jsx         # Main export
├── demo/                 # Demo app for testing
│   ├── index.html
│   └── index.jsx
├── dist/                 # Built library (after npm run build)
├── package.json
├── rollup.config.js      # Library build config
└── vite.config.js        # Demo dev server config
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+U | Underline |
| Ctrl+K | Insert link |
| Ctrl+S | Open export modal |

## License

MIT
