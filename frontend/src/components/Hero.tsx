import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Calendar, Sparkles, TrendingUp, Users, Star, Award, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

interface HeroData {
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  ctaPrimary: string;
  urgency: string;
  stats: {
    clients: string;
    costSaved: string;
    rating: string;
  };
}

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLElement | null>(null);
  // Use global scroll progress to avoid target hydration issues in DEV/strict mode
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current language
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

  // Fetch hero data from API
  useEffect(() => {
    const fetchHero = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/hero?lang=${currentLang}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hero: ${response.status}`);
        }
        
        const data = await response.json();
        setHeroData(data.hero);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching hero:', err);
        }
        // Fallback to translation keys
        setHeroData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, [currentLang]);

  // Use fetched data or fallback to default values
  const title = heroData?.title || "Scale Your Business with Dedicated Virtual Assistants";
  const subtitle = heroData?.subtitle || "Hire pre-vetted, German-speaking virtual assistants for 80% less than local hires. Scale your team in days, not months.";
  const tagline = heroData?.tagline || "Trusted by 200+ Growing Businesses";
  const heroImage = heroData?.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=900&fit=crop&q=80";
  const ctaPrimary = heroData?.ctaPrimary || "Get Started Today";
  const urgency = heroData?.urgency || t('hero.urgency') || "Limited Offer";
  const stats = heroData?.stats || {
    clients: "200+",
    costSaved: "70%",
    rating: "4.9/5",
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </section>
    );
  }

  return (
    <motion.section 
      ref={ref as unknown as React.Ref<HTMLElement>}
      className="relative min-h-screen flex items-center bg-background text-foreground overflow-hidden pt-16 sm:pt-20 md:pt-0"
      style={{ opacity }}
    >
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/5"
          animate={{
            background: [
              "linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background)), hsl(45 80% 55% / 0.05))",
              "linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background)), hsl(45 80% 55% / 0.08))",
              "linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background)), hsl(45 80% 55% / 0.05))"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating orbs in background */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-4 py-12 sm:py-16 md:py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-14 md:gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 mb-4 sm:mb-5 md:mb-6 px-4 sm:px-5 py-2 sm:py-2.5 bg-gold/10 backdrop-blur-sm border border-gold/30 rounded-full text-gold text-xs sm:text-sm font-semibold shadow-lg shadow-gold/10 hover:bg-gold/20 transition-all duration-300"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.div>
              {tagline}
            </motion.div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold mb-5 sm:mb-6 md:mb-7 leading-[1.15] sm:leading-[1.12] md:leading-[1.1] tracking-tight">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {title}
              </motion.span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-7 md:mb-8 leading-relaxed max-w-xl">
              {subtitle}
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-3"
            >
              <Button 
                variant="gold" 
                size="lg"
                onClick={() => {
                  const currentLang = window.location.pathname.match(/^\/(en|de)\b/)?.[1] || 'en';
                  window.location.href = `/${currentLang}/book-meeting`;
                }}
                className="group relative w-full sm:w-auto text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-12 py-4 sm:py-6 md:py-7 h-auto font-semibold shadow-[0_16px_40px_-18px_hsl(45_80%_55%/0.7)] hover:shadow-[0_24px_60px_-18px_hsl(45_80%_55%/0.9)] transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl"
                aria-label={t("hero.ctaAria")}
              >
                {/* Subtle shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{
                    x: ["-150%", "150%"]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1.5
                  }}
                  aria-hidden="true"
                />
                
                {/* Enhanced hover glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-400 to-gold rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" aria-hidden="true" />
                  <span className="font-semibold group-hover:tracking-wide transition-all duration-300">{ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" aria-hidden="true" />
                </span>
              </Button>
              
              {/* Urgency indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm"
              >
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold" aria-hidden="true" />
                  <motion.div
                    className="absolute inset-0 bg-gold/30 rounded-full blur-md"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
                <span className="font-semibold text-foreground">{urgency}</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="relative lg:ml-auto mt-8 sm:mt-10 lg:mt-0"
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20"
            >
              <motion.div
                animate={{
                  y: [-5, 5, -5],
                  rotate: [-2, 2, -2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-gradient-to-br from-gold via-yellow-400 to-amber-500 text-background px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg border-2 border-background flex items-center gap-1.5 sm:gap-2"
              >
                <Award className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">Top Rated</span>
              </motion.div>
            </motion.div>
            
            <div className="relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] sm:shadow-[0_25px_80px_-18px_rgba(0,0,0,0.75)] md:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] border-2 border-gold/40 hover:border-gold/80 group transition-all duration-700">
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.3)",
                    "0 0 40px rgba(234, 179, 8, 0.5)",
                    "0 0 20px rgba(234, 179, 8, 0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                aria-hidden="true"
              />
              
              {/* Image with video-like effects */}
              <motion.img 
                src={heroImage} 
                alt={title} 
                className="w-full h-auto object-cover"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Animated scan line effect (like video) */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/10 to-transparent h-20"
                animate={{
                  y: ["-100%", "200%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Animated gradient overlays */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-gold/10 mix-blend-overlay"
                animate={{
                  opacity: [0.6, 0.8, 0.6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Moving light rays */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  backgroundPosition: ["0% 0%", "100% 100%"]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              />
              
              {/* Floating particles for video effect */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gold/60 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
              
              {/* Pulsing glow overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-gold/10 via-transparent to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating stats overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 md:bottom-6 md:left-6 md:right-6 backdrop-blur-2xl bg-card/98 border-2 border-gold/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group-hover:border-gold/60 group-hover:shadow-[0_25px_80px_-15px_hsl(45_80%_55%/0.4)] transition-all duration-500"
              >
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group/stat cursor-default"
                  >
                    <motion.div
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-gold/70 group-hover/stat:text-gold transition-colors" aria-hidden="true" />
                      <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent">{stats.clients}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">{currentLang === 'de' ? 'Kunden' : 'Clients'}</div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group/stat cursor-default border-x border-border/50"
                  >
                    <motion.div
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    >
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-gold/70 group-hover/stat:text-gold transition-colors" aria-hidden="true" />
                      <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">{stats.costSaved}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">{currentLang === 'de' ? 'Kosteneinsparung' : 'Cost Saved'}</div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group/stat cursor-default"
                  >
                    <motion.div
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    >
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-gold/70 group-hover/stat:text-gold transition-colors fill-gold/20" aria-hidden="true" />
                      <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-gold bg-clip-text text-transparent">{stats.rating}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">{currentLang === 'de' ? 'Bewertung' : 'Rating'}</div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            {/* Animated decorative elements */}
            <motion.div 
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gold/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              aria-hidden="true"
            />
            <motion.div 
              className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gold/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              aria-hidden="true"
            />
            <motion.div 
              className="absolute top-1/2 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400/10 rounded-full blur-2xl"
              animate={{
                x: [-10, 10, -10],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, repeat: Infinity, repeatType: "reverse" }}
        className="hidden md:flex absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 text-gold"
      >
      
      </motion.div>
    </motion.section>
  );
};
