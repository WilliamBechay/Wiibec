import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import '@/i18n';
import '@/index.css';
import '@fontsource/inter';
import 'react-quill/dist/quill.snow.css';
import 'reactflow/dist/style.css';
import { Loader2 } from 'lucide-react';

const FullPageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-background">
    <Loader2 className="h-16 w-16 animate-spin text-primary" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<FullPageLoader />}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <SettingsProvider>
              <App />
              <Toaster />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);