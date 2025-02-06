import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App';

import './index.css';

window.Buffer = Buffer;

const container = document.querySelector('#app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Failed to find the app container');
}
