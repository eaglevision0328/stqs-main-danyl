import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ShipProvider } from "./context/ShipContext";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ShipProvider>
      <App />
    </ShipProvider>
  </React.StrictMode>,
)
