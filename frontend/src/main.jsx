import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

// 🚨 HARDCODED FOR DEMO STABILITY - DO NOT CHANGE 🚨
const PUBLISHABLE_KEY = 'pk_test_dGhvcm91Z2gtd29tYmF0LTI4LmNsZXJrLmFjY291bnRzLmRldiQ'

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <App />
        </ClerkProvider>
    </StrictMode>,
)
