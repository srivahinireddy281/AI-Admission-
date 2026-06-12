import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentApplicationForm from './pages/StudentApplicationForm';
import DocumentVault from './pages/DocumentVault';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseManagement from './pages/CourseManagement';
import AuditLogReview from './pages/AuditLogReview';
import { User } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admission_jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load user data on boot if token exists
  useEffect(() => {
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          setUser(decoded);

          // Configure default landing page based on active role permissions
          if (decoded.role === 'admin') {
            setActiveTab('admin-dashboard');
          } else if (decoded.role === 'officer') {
            setActiveTab('officer-dashboard');
          } else {
            setActiveTab('dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to parse active user payload token', err);
        handleLocalLogout();
      }
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    localStorage.setItem('admission_jwt_token', newToken);
    setToken(newToken);
    setUser(loggedUser);

    if (loggedUser.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else if (loggedUser.role === 'officer') {
      setActiveTab('officer-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLocalLogout = () => {
    localStorage.removeItem('admission_jwt_token');
    setToken(null);
    setUser(null);
    setShowRegister(false);
    setActiveTab('dashboard');
  };

  // Render correct nested component matching active state index
  const renderPageContent = () => {
    if (!user) return null;

    switch (activeTab) {
      // Student panel pages
      case 'dashboard':
        return <StudentDashboard />;
      case 'courses':
        return <StudentApplicationForm />;
      case 'documents':
        return <DocumentVault />;

      // Evaluator panel page
      case 'officer-dashboard':
        return <OfficerDashboard />;

      // Administrator panel pages
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-courses':
        return <CourseManagement />;
      case 'admin-audit':
        return <AuditLogReview />;

      default:
        return (
          <div className="p-8 text-center font-sans text-xs text-slate-500">
            Resource Page unlinked or restricted.
          </div>
        );
    }
  };

  // Authentication Layout check
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AnimatePresence mode="wait">
          {showRegister ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Register
                onRegisterSuccess={() => setShowRegister(false)}
                onToggleLogin={() => setShowRegister(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Login
                onLoginSuccess={handleLoginSuccess}
                onToggleRegister={() => setShowRegister(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={handleLocalLogout} />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-x-hidden bg-slate-50 md:h-[calc(100vh-4rem)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPageContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
