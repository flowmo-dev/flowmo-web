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

const pageVariants = {
  initial: { opacity: 0, x: "-100%" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "100%" }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <TimerPage />
              </motion.div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <TaskManagerPage />
              </motion.div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/statistics"
          element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <StatisticsPage />
              </motion.div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <NextUIProvider>
      <BreakTimerProvider>
        <FocusStopwatchProvider>
          <SessionHistoryProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar>
                  <NavbarBrand>
                    <Link to="/" className="font-bold text-inherit">Flowmodoro</Link>
                  </NavbarBrand>
                  <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    {isAuthenticated && (
                      <>
                        <NavbarItem>
                          <Link to="/" className="flex items-center">
                            <Coffee className="mr-2" /> Timer
                          </Link>
                        </NavbarItem>
                        <NavbarItem>
                          <Link to="/tasks" className="flex items-center">
                            <CheckSquare className="mr-2" /> Tasks
                          </Link>
                        </NavbarItem>
                        <NavbarItem>
                          <Link to="/statistics" className="flex items-center">
                            <BarChart className="mr-2" /> Statistics
                          </Link>
                        </NavbarItem>
                      </>
                    )}
                  </NavbarContent>
                  <NavbarContent justify="end">
                    {isAuthenticated ? (
                      <NavbarItem>
                        <Button color="danger" variant="flat" onClick={logout} startContent={<LogOut />}>
                          Logout
                        </Button>
                      </NavbarItem>
                    ) : (
                      <NavbarItem>
                        <Button as={Link} color="primary" to="/login" variant="flat" startContent={<LogIn />}>
                          Login
                        </Button>
                      </NavbarItem>
                    )}
                  </NavbarContent>
                </Navbar>
                <main className="container mx-auto relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
                  <AnimatedRoutes />
                </main>
                <BreakEndModal />
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
