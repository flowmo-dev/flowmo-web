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
import { BreakTimerProvider } from './contexts/BreakTimerContext';
import { FocusStopwatchProvider } from './contexts/FocusStopwatchContext';
import BreakEndModal from './components/BreakEndModal';
import { SessionHistoryProvider } from './contexts/SessionHistoryContext';
import LogoutConfirmationModal from './components/LogoutConfirmationModal';

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
  const { isAuthenticated } = useAuth();

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

  const [showLogoutConfirmationModal, setShowLogoutConfirmationModal] = React.useState(false);

  return (
    <NextUIProvider>
      <BreakTimerProvider>
        <FocusStopwatchProvider>
          <SessionHistoryProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar>
                  <NavbarBrand className="hidden sm:block">
                    <Link to="/" className="font-bold text-inherit">Flowmodoro</Link>
                  </NavbarBrand>
                  <NavbarContent className="flex gap-4" justify="center">
                    {isAuthenticated && (
                      <>
                        <NavbarItem>
                          <Link to="/" className="flex items-center">
                            <Coffee className="mr-2" />
                            <span className="hidden sm:block">Timer</span>
                          </Link>
                        </NavbarItem>
                        <NavbarItem>
                          <Link to="/tasks" className="flex items-center">
                            <CheckSquare className="mr-2" />
                            <span className="hidden sm:block">Tasks</span>
                          </Link>
                        </NavbarItem>
                        <NavbarItem>
                          <Link to="/statistics" className="flex items-center">
                            <BarChart className="mr-2" />
                            <span className="hidden sm:block">Statistics</span>
                          </Link>
                        </NavbarItem>
                      </>
                    )}
                  </NavbarContent>
                  <NavbarContent justify="end">
                    {isAuthenticated ? (
                      <NavbarItem>
                        <Button color="danger" variant="flat" onClick={() => setShowLogoutConfirmationModal(true)} startContent={<LogOut />}>
                          <span className="hidden sm:block">Logout</span>
                        </Button>
                      </NavbarItem>
                    ) : (
                      <NavbarItem>
                        <Button as={Link} color="primary" to="/login" variant="flat" startContent={<LogIn />}>
                          <span className="hidden sm:block">Login</span>
                        </Button>
                      </NavbarItem>
                    )}
                  </NavbarContent>
                </Navbar>
                <main className="container mx-auto relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
                  <AnimatedRoutes />
                </main>
                <BreakEndModal />
                <LogoutConfirmationModal
                  visible={showLogoutConfirmationModal}
                  onClose={() => setShowLogoutConfirmationModal(false)}
                  onConfirm={logout}
                />
              </div>
            </Router>
          </SessionHistoryProvider>
        </FocusStopwatchProvider>
      </BreakTimerProvider>
    </NextUIProvider>
  );
}

const AppWithAuth = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;
