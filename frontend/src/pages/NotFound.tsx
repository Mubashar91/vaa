import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useSEO({
    title: "404 — Page Not Found | Donva",
    description: "The page you are looking for does not exist.",
    noindex: true,
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  // Get current language from path or default to 'en'
  const currentLang = location.pathname.match(/^\/(en|de)\b/)?.[1] || 'en';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <button 
          onClick={() => navigate(`/${currentLang}`)}
          className="text-gold underline hover:text-gold/80 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
