import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/common/SplashScreen";
import ScrollToTop from "@/components/common/ScrollToTop";
import BackToTop from "@/components/common/BackToTop";
import PageTransition from "@/components/common/PageTransition";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import Books from "@/pages/Books";
import Notes from "@/pages/Notes";
import RareBooks from "@/pages/RareBooks";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LibraryCard from "@/pages/LibraryCard";
import Donate from "@/pages/Donate";
import Events from "@/pages/Events";
import NotificationsPage from "@/pages/Notifications";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import AdminDashboard from "@/pages/AdminDashboard";
import BooksDetails from "@/pages/admin/BooksDetails";
import History from "@/pages/History";
import PrincipalMessage from "@/pages/PrincipalMessage";
import Faculty from "@/pages/Faculty";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/books"
          element={
            <PageTransition>
              <Books />
            </PageTransition>
          }
        />
        <Route
          path="/notes"
          element={
            <PageTransition>
              <Notes />
            </PageTransition>
          }
        />
        <Route
          path="/rare-books"
          element={
            <PageTransition>
              <RareBooks />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/library-card"
          element={
            <PageTransition>
              <LibraryCard />
            </PageTransition>
          }
        />
        <Route
          path="/donate"
          element={
            <PageTransition>
              <Donate />
            </PageTransition>
          }
        />
        <Route
          path="/events"
          element={
            <PageTransition>
              <Events />
            </PageTransition>
          }
        />
        <Route
          path="/history"
          element={
            <PageTransition>
              <History />
            </PageTransition>
          }
        />
        <Route
          path="/principal-message"
          element={
            <PageTransition>
              <PrincipalMessage />
            </PageTransition>
          }
        />
        <Route
          path="/faculty"
          element={
            <PageTransition>
              <Faculty />
            </PageTransition>
          }
        />
        <Route
          path="/notifications"
          element={
            <PageTransition>
              <NotificationsPage />
            </PageTransition>
          }
        />
        <Route
          path="/blog"
          element={
            <PageTransition>
              <Blog />
            </PageTransition>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PageTransition>
              <BlogPost />
            </PageTransition>
          }
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route
          path="/admin/books-details"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition>
                <BooksDetails />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const LayoutRouter = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <BackToTop />}
    </div>
  );
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return <LayoutRouter />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="gcfm-theme"
    >
      <BrowserRouter>
        <BrandingProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </AuthProvider>
        </BrandingProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
