import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles, Clock, CheckCircle2, Users, TrendingUp, Award, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.don-va.com';

interface FinalCTAData {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  subheading: string;
  benefits: string[];
  stats: {
    activeClients: string;
    avgRoi: string;
    satisfaction: string;
    fastStart: string;
  };
  trust: {
    consultationTime: string;
    consultationLabel: string;
    responseTime: string;
    responseLabel: string;
    noCommitment: string;
    noCommitmentLabel: string;
    footer: string;
  };
  ctas: {
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  whatsAppNumber: string;
}

export const FinalCTA = () => {
  const { t, i18n } = useTranslation();
  const [finalCtaData, setFinalCtaData] = useState<FinalCTAData | null>(null);
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

  // Fetch Final CTA data from API
  useEffect(() => {
    const fetchFinalCTA = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/final-cta?lang=${currentLang}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch final CTA: ${response.status}`);
        }
        
        const data = await response.json();
        setFinalCtaData(data.finalCta);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching final CTA:', err);
        }
        // Fallback to null, will use translations
        setFinalCtaData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalCTA();
  }, [currentLang]);

  // Use fetched data or fallback to translations
  const badge = finalCtaData?.badge || t("finalCta.badge");
  const headlineLine1 = finalCtaData?.headlineLine1 || t("finalCta.headlineLine1");
  const headlineLine2 = finalCtaData?.headlineLine2 || t("finalCta.headlineLine2");
  const subheading = finalCtaData?.subheading || t("finalCta.subheading");
  const benefits = finalCtaData?.benefits && finalCtaData.benefits.length > 0
    ? finalCtaData.benefits
    : [
        t("finalCta.benefits.noSetupFees"),
        t("finalCta.benefits.trial"),
        t("finalCta.benefits.nativeManagers"),
        t("finalCta.benefits.support247"),
      ];
  const stats = finalCtaData?.stats || {
    activeClients: "200+",
    avgRoi: "3.5x",
    satisfaction: "98%",
    fastStart: "48h",
  };
  const trust = finalCtaData?.trust || {
    consultationTime: t("finalCta.trust.consultationTime"),
    consultationLabel: t("finalCta.trust.consultationLabel"),
    responseTime: t("finalCta.trust.responseTime"),
    responseLabel: t("finalCta.trust.responseLabel"),
    noCommitment: t("finalCta.trust.noCommitment"),
    noCommitmentLabel: t("finalCta.trust.noCommitmentLabel"),
    footer: t("finalCta.trust.footer"),
  };
  const primaryCta = finalCtaData?.ctas?.primaryLabel || t("finalCta.primaryCta");
  const primaryHref = finalCtaData?.ctas?.primaryHref || '/book-meeting';
  const secondaryCta = finalCtaData?.ctas?.secondaryLabel || t("finalCta.secondaryCta");
  const secondaryHref = finalCtaData?.ctas?.secondaryHref || 
    (finalCtaData?.whatsAppNumber ? `https://wa.me/${finalCtaData.whatsAppNumber}` : 'https://wa.me/YOUR_WHATSAPP_NUMBER');

  if (loading) {
    return (
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-gradient-to-br from-gold via-amber-500 to-yellow-600 z-60 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </section>
    );
  }
  return (
    <motion.section 
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-gradient-to-br from-gold via-amber-500 to-yellow-600 z-60"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute -top-20 -right-20 w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-16 -left-16 w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-60 lg:h-60 bg-amber-300/20 rounded-full mix-blend-overlay filter blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Enhanced geometric patterns */}
        <motion.div 
          className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-white/20 rounded-lg"
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-16 right-16 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/20 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Enhanced decorative header */}
          <motion.div 
            className="flex justify-center mb-6 sm:mb-8 md:mb-10"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
          >
            <div className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white/25 backdrop-blur-lg rounded-full text-sm sm:text-base font-bold text-white flex items-center gap-2 border border-white/40 shadow-xl hover:scale-105 transition-transform duration-300">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <span className="whitespace-nowrap">{badge}</span>
              <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </motion.div>

          {/* Main headline with improved hierarchy */}
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 sm:mb-8 md:mb-10 text-white leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="block drop-shadow-lg">{headlineLine1}</span>
            <span className="relative inline-block mt-2 sm:mt-3">
              <span className="relative z-10 bg-gradient-to-r from-white via-amber-50 to-white bg-clip-text text-transparent drop-shadow-2xl">
                {headlineLine2}
              </span>
              <motion.span 
                className="absolute bottom-2 sm:bottom-3 left-0 w-full h-4 sm:h-5 bg-white/30 -z-0 rounded-full blur-sm"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              />
            </span>
          </motion.h2>
          
          {/* Subtitle with benefits */}
          <motion.div
            className="mb-10 sm:mb-12 md:mb-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-8 leading-relaxed font-semibold drop-shadow-md">
              {subheading}
            </p>
            
            {/* Benefits list */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 mt-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 sm:px-5 py-2 sm:py-2.5 border border-white/30 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                  <span className="text-white text-sm sm:text-base font-semibold whitespace-nowrap">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Enhanced CTA buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button 
              size="lg"
              onClick={() => window.location.href = primaryHref}
              className="bg-white text-gold hover:bg-white/95 hover:scale-[1.08] active:scale-[1.02] group px-8 sm:px-12 py-6 sm:py-8 text-base sm:text-lg font-extrabold rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 border-2 border-white relative overflow-hidden cursor-pointer w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 animate-pulse" />
              <span className="relative flex items-center gap-3">
                <span>{primaryCta}</span>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.open(secondaryHref, '_blank')}
              className="bg-white/10 border-3 border-white text-white hover:bg-white hover:text-gold hover:scale-[1.08] active:scale-[1.02] px-6 sm:px-10 py-6 sm:py-8 text-base sm:text-lg font-bold rounded-2xl backdrop-blur-lg transition-all duration-300 group relative overflow-hidden cursor-pointer w-full sm:w-auto shadow-lg hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-3">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>{secondaryCta}</span>
              </span>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            {[
              { icon: Users, value: stats.activeClients, label: t("finalCta.stats.activeClients") },
              { icon: TrendingUp, value: stats.avgRoi, label: t("finalCta.stats.avgRoi") },
              { icon: Award, value: stats.satisfaction, label: t("finalCta.stats.satisfaction") },
              { icon: Clock, value: stats.fastStart, label: t("finalCta.stats.fastStart") },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-2xl p-4 sm:p-6 hover:bg-white/25 transition-all duration-300 group"
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced trust indicators */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 text-white/90 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-2 bg-green-400/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-base">{trust.consultationTime}</div>
                <div className="text-sm text-white/80">{trust.consultationLabel}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-white/90 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-2 bg-green-400/20 rounded-lg relative">
                <div className="w-5 h-5 rounded-full bg-green-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-base">{trust.responseTime}</div>
                <div className="text-sm text-white/80">{trust.responseLabel}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-white/90 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="p-2 bg-green-400/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-base">{trust.noCommitment}</div>
                <div className="text-sm text-white/80">{trust.noCommitmentLabel}</div>
              </div>
            </div>
          </motion.div>

          {/* Additional reassurance text */}
          <motion.p 
            className="mt-8 sm:mt-10 text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="flex items-center justify-center gap-2 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              {trust.footer}
            </span>
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
};
