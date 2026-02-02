import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Sidebar />
      <main className="flex-1 ml-72 p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
