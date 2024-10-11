import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { NextUIProvider, Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import { Coffee, CheckSquare, BarChart, LogIn, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import TimerPage from './pages/TimerPage';
import TaskManagerPage from './pages/TaskManagerPage';
import StatisticsPage from './pages/StatisticsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const pageVariants = {
  initial: { opacity: 0, x: "20px" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "-20px" }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.2
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ position: 'absolute', width: '100%', padding: '20px' }}
      >
        <Routes location={location}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={isAuthenticated ? <TimerPage /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={isAuthenticated ? <TaskManagerPage /> : <Navigate to="/login" />} />
          <Route path="/statistics" element={isAuthenticated ? <StatisticsPage /> : <Navigate to="/login" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <NextUIProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar>
            <NavbarBrand>
              <p className="font-bold text-inherit">Flowmodoro Timer</p>
            </NavbarBrand>
            <NavbarContent justify="end">
              {isAuthenticated ? (
                <>
                  <NavbarItem>
                    <Button as={Link} to="/" color="primary" variant="flat">
                      <Coffee size={24} />
                    </Button>
                  </NavbarItem>
                  <NavbarItem>
                    <Button as={Link} to="/tasks" color="primary" variant="flat">
                      <CheckSquare size={24} />
                    </Button>
                  </NavbarItem>
                  <NavbarItem>
                    <Button as={Link} to="/statistics" color="primary" variant="flat">
                      <BarChart size={24} />
                    </Button>
                  </NavbarItem>
                  <NavbarItem>
                    <Button onClick={logout} color="danger" variant="flat">
                      <LogOut size={24} />
                    </Button>
                  </NavbarItem>
                </>
              ) : (
                <NavbarItem>
                  <Button as={Link} to="/login" color="primary" variant="flat">
                    <LogIn size={24} />
                  </Button>
                </NavbarItem>
              )}
            </NavbarContent>
          </Navbar>
          <main className="container mx-auto relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </NextUIProvider>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;