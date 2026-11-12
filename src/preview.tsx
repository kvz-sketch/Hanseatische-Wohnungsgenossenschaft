// Single-file preview: all pages in one document, switched in memory.
// Built with `npm run build:preview` (see scripts/inline-preview.mjs).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Preview from './pages/Preview.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)
