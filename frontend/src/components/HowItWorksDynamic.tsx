import { motion } from "framer-motion";
import { Calendar, UserCheck, Rocket, LineChart, CheckCircle, ArrowRight, Star, Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.don-va.com';

// Icon mapping
const iconMap: Record<string, any> = {
  Calendar,
  UserCheck,
  Rocket,
  LineChart,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
};

interface HowItWorksStep {
  _id?: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  stepLabel?: string;
}

export const HowItWorksDynamic = () => {
  const { t, i18n } = useTranslation();
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current language (en or de)
  const getCurrentLang = () => {
    const lang = i18n.language || 'en';
    return lang.startsWith('de') ? 'de' : 'en';
  };

  const [currentLang, setCurrentLang] = useState(getCurrentLang());

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newLang = lng.startsWith('de') ? 'de' : 'en';
      setCurrentLang(newLang);
    };

    setCurrentLang(getCurrentLang());
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Fetch steps from API
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/how-it-works?lang=${currentLang}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch steps: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchedSteps = Array.isArray(data.steps) 
          ? data.steps.sort((a: HowItWorksStep, b: HowItWorksStep) => a.stepNumber - b.stepNumber)
          : [];
        
        setSteps(fetchedSteps);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching how it works:', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to load steps');
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [currentLang]);

  // Loading state
  if (loading) {
    return (
      <section 
        id="how-it-works"
        className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-b from-background via-muted/30 to-background z-20 min-h-[600px]"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        </div>
      </section>
    );
  }

  // Error state or no steps
  if (error || steps.length === 0) {
    return (
      <section 
        id="how-it-works"
        className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-b from-background via-muted/30 to-background z-20 min-h-[600px]"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {error || (currentLang === 'de' 
                ? 'Keine Schritte verfügbar. Bitte fügen Sie Schritte im Admin-Panel hinzu.'
                : 'No steps available. Please add steps in the admin panel.')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      id="how-it-works"
      className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-b from-background via-muted/30 to-background z-20 min-h-[600px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="mb-10 sm:mb-16 md:mb-20 text-left"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-2 bg-foreground text-gold text-sm font-semibold rounded-full mb-4">
            {t("howItWorks.badge")}
          </span>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
            dangerouslySetInnerHTML={{ __html: t("howItWorks.heading") }}
          />
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            {t("howItWorks.description")}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon] || Calendar;
            const stepLabel = step.stepLabel || (currentLang === 'de' ? `Schritt ${step.stepNumber}` : `Step ${step.stepNumber}`);
            
            return (
              <motion.div 
                key={step._id || step.stepNumber}
                className="relative mb-12 sm:mb-16 last:mb-0"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, rotateY: 0 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
              >
                <div className={`flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <motion.div 
                    className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold flex items-center justify-center shadow-[0_20px_60px_-15px_hsl(45_80%_55%/0.6)] relative group"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-black relative z-10" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-foreground text-gold rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-gold">
                      {step.stepNumber}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className={`flex-1 bg-card border-2 border-gold/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 hover:border-gold hover:shadow-[0_20px_60px_-15px_hsl(45_80%_55%/0.4)] transition-all duration-500 group ${index % 2 === 1 ? 'md:text-right' : ''}`}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <p className="text-gold font-bold text-sm uppercase tracking-wider mb-3 inline-block px-3 py-1 bg-gold/10 rounded-full">
                      {stepLabel}
                    </p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground group-hover:text-gold transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                      {step.description}
                    </p>
                    
                    {/* Decorative corner */}
                    <div className={`absolute ${index % 2 === 1 ? 'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl sm:rounded-tl-2xl' : 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl sm:rounded-br-2xl'} w-12 h-12 sm:w-16 sm:h-16 border-gold/0 group-hover:border-gold/50 transition-all duration-500`} />
                  </motion.div>
                </div>
                
                {index < steps.length - 1 && (
                  <motion.div 
                    className="absolute left-16 top-32 w-0.5 h-16 bg-gradient-to-b from-gold via-gold/50 to-transparent hidden md:block"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

