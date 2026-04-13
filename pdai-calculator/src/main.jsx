import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:lang" element={<App />} />
        <Route path="*" element={<Navigate to="/ru" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
