import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import History from './components/History';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { signInWithGoogle } from './firebase';
import { ShieldCheck } from 'lucide-react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthReady } = useFirebase();

  if (!isAuthReady || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-bg p-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-white/10">
          <ShieldCheck className="text-black w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Site Sentinel</h1>
        <p className="text-text-secondary mb-12 text-center max-w-md">
          Monitor your website changes with precision. Sign in to access your dashboard.
        </p>
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all shadow-xl shadow-white/5 text-white backdrop-blur-xl"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <Router>
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </AuthGuard>
        </Router>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
