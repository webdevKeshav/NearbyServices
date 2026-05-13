import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import UserDashboard from './pages/Dashboard/UserDashboard';
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import ServiceDetailPage from './pages/Home/ServiceDetailPage';
import AddServicePage from './pages/Provider/AddServicePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function App() {
  const { init, isLoading } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 font-display">Loading ServeNear...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#1e1e2e', color: '#f0ede8', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#f0b429', secondary: '#0a0a0f' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* User protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="dashboard" element={<UserDashboard />} />
            </Route>

            {/* Provider protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
              <Route path="provider/dashboard" element={<ProviderDashboard />} />
              <Route path="provider/add-service" element={<AddServicePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
