import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Mitgliederliste from './pages/Mitgliederliste.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Mitgliederliste />
  </StrictMode>,
)
