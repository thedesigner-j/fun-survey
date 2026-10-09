import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Survey from './survey/Survey.jsx'
import Admin from './admin/Admin.jsx'
import './styles.css'

const params = new URLSearchParams(window.location.search)
if (params.get('bg') === 'transparent') document.documentElement.classList.add('transparent')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Survey />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
