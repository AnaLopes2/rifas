import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toasts } from './components/ui/Toasts';
import { GlobalModals } from './components/modals/GlobalModals';
import { HomePage } from './pages/HomePage';
import { RafflePage } from './pages/RafflePage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/admin/AdminPage';
import { LegalPage } from './pages/LegalPage';
import { ResultPage } from './pages/ResultPage';
import { NotFoundPage } from './pages/NotFoundPage';

function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="rifa/:id" element={<RafflePage />} />
          <Route path="conta" element={<AccountPage />} />
          <Route path="legal/:slug" element={<LegalPage />} />
          <Route path="resultado/:id" element={<ResultPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="admin" element={<AdminPage />} />
      </Routes>
      <GlobalModals />
      <Toasts />
    </>
  );
}
