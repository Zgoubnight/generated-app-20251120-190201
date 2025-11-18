import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Home, BarChart2, LogOut } from 'lucide-react';
import { useSpugnaStore } from '@/hooks/useSpugnaStore';
import { LoginView } from '@/components/spugna/LoginView';
import { WheelView } from '@/components/spugna/WheelView';
import { ResultsView } from '@/components/spugna/ResultsView';
import { EquityChartView } from '@/components/spugna/EquityChartView';
import { AdminPanel } from '@/components/spugna/AdminPanel';
export function HomePage() {
  const currentView = useSpugnaStore(s => s.currentView);
  const currentUser = useSpugnaStore(s => s.currentUser);
  const logout = useSpugnaStore(s => s.logout);
  const showChart = useSpugnaStore(s => s.showChart);
  const backToWheel = useSpugnaStore(s => s.backToWheel);
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginView />;
      case 'wheel':
        return <WheelView />;
      case 'results':
        return <ResultsView />;
      case 'chart':
        return <EquityChartView />;
      default:
        return <LoginView />;
    }
  };
  return (
    <div className="min-h-screen w-full bg-spugna-off-white font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <main key={currentView} className="w-full max-w-7xl mx-auto flex-grow flex items-center justify-center">
          {renderView()}
        </main>
      </AnimatePresence>
      {currentUser && (
        <nav className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 rounded-full bg-white/50 backdrop-blur-md shadow-lg border border-spugna-gold/30">
          {currentView === 'chart' ? (
            <Button variant="ghost" size="icon" onClick={backToWheel} className="rounded-full">
              <Home className="h-5 w-5 text-spugna-dark-blue" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={showChart} className="rounded-full">
              <BarChart2 className="h-5 w-5 text-spugna-dark-blue" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
            <LogOut className="h-5 w-5 text-spugna-red" />
          </Button>
        </nav>
      )}
      {currentUser?.isAdmin && <AdminPanel />}
      <footer className="absolute bottom-2 right-4 text-xs text-spugna-dark-blue/50">
        Built with ❤️ at Cloudflare
      </footer>
      <Toaster richColors position="top-center" />
    </div>
  );
}