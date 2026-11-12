import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Passwort from './pages/Passwort.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Passwort />
  </StrictMode>,
)
