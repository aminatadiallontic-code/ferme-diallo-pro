import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-black tracking-tighter text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Page non trouvée</p>
        <p className="text-sm text-muted-foreground">
          Redirection automatique dans 3 secondes...
        </p>
      </div>
    </div>
  );
};

export default NotFound;