import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Projekte from './pages/Projekte.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Projekte />
  </StrictMode>,
)
