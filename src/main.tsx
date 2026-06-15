import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TrialProvider } from '@/context/TrialContext'
import { ToastContextProvider } from '@/context/ToastContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastContextProvider>
        <AuthProvider>
          <TrialProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </TrialProvider>
        </AuthProvider>
      </ToastContextProvider>
    </BrowserRouter>
  </StrictMode>
)
