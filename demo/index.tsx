import { createRoot } from 'react-dom/client';
import WysiwygEditor from '../src/index.jsx';

function App() {
  return <WysiwygEditor />;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
