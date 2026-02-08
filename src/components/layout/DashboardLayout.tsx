import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileSidebarProvider, useMobileSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const DashboardContent = () => {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const { isOpen, close } = useMobileSidebar();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar isMobile onNavClick={close} />
          </SheetContent>
        </Sheet>
      )}

      <main className={`flex-1 ${isMobile ? 'p-4' : 'ml-72 p-8'} animate-fade-in`}>
        <Outlet />
      </main>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <MobileSidebarProvider>
      <DashboardContent />
    </MobileSidebarProvider>
  );
};

export default DashboardLayout;
