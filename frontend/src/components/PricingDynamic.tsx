import { Button } from "@/components/ui/button";
import { Check, Star, Sparkles, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Constants
const MAX_VA_COUNT = 10;
const BULK_DISCOUNT_THRESHOLD = 3;
const BULK_DISCOUNT_RATE = 0.03;

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.don-va.com';

// TypeScript Interface - matches API response
interface PricingPlan {
  _id?: string;
  lang: string;
  planKey: 'starter' | 'professional' | 'enterprise';
  name: string;
  hours: string;
  price: number;
  setupFee: number;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export const PricingDynamic = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [vaCount, setVaCount] = useState(1);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current language (en or de) - properly handle language changes
  const getCurrentLang = () => {
    const lang = i18n.language || 'en';
    // Handle both 'de' and 'de-DE' formats
    return lang.startsWith('de') ? 'de' : 'en';
  };

  const [currentLang, setCurrentLang] = useState(getCurrentLang());

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newLang = lng.startsWith('de') ? 'de' : 'en';
      setCurrentLang(newLang);
    };

    // Set initial language
    setCurrentLang(getCurrentLang());

    // Listen to i18n language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        setError(null);
        const langParam = currentLang;
        const apiUrl = `${API_BASE}/api/pricing?lang=${langParam}`;
        
        console.log('Fetching pricing from:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('API Error:', response.status, errorText);
          throw new Error(`Failed to fetch pricing: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Pricing data received:', data);
        
        // Ensure plans array exists and sort by planKey order
        const order = ['starter', 'professional', 'enterprise'];
        const fetchedPlans = Array.isArray(data.plans) 
          ? data.plans.sort((a: PricingPlan, b: PricingPlan) => 
              order.indexOf(a.planKey) - order.indexOf(b.planKey)
            )
          : [];
        
        if (fetchedPlans.length === 0) {
          console.warn('No pricing plans found for language:', langParam);
          setError('No pricing plans available. Please add plans in the admin panel.');
        } else {
          console.log('Loaded plans:', fetchedPlans.length);
        }
        
        setPlans(fetchedPlans);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing';
        setError(`${errorMessage}. API Base: ${API_BASE}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [currentLang]);

  const calculateDiscount = (count: number) => {
    return count >= BULK_DISCOUNT_THRESHOLD ? BULK_DISCOUNT_RATE : 0;
  };

  const discount = calculateDiscount(vaCount);
  
  // Calculate average price per VA per hour (using first available plan or professional)
  const avgHoursPerWeek = 20;
  const professionalPlan = plans.find(p => p.planKey === 'professional') || plans[0];
  const avgPricePerVA = professionalPlan?.price || 0;

  // Loading state
  if (loading) {
    return (
      <section 
        id="pricing"
        className="relative py-8 sm:py-12 md:py-16 lg:py-20 bg-background text-foreground z-10 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section 
        id="pricing"
        className="relative py-8 sm:py-12 md:py-16 lg:py-20 bg-background text-foreground z-10 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Trigger refetch by updating currentLang
                setCurrentLang(getCurrentLang());
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // No plans available state
  if (!loading && plans.length === 0) {
    return (
      <section 
        id="pricing"
        className="relative py-8 sm:py-12 md:py-16 lg:py-20 bg-background text-foreground z-10 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {currentLang === 'de' 
                ? 'Keine Preispläne für Deutsch verfügbar. Bitte fügen Sie Preise im Admin-Panel hinzu.'
                : 'No pricing plans available. Please add pricing plans in the admin panel.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      id="pricing"
      className="relative py-8 sm:py-12 md:py-16 lg:py-20 bg-background text-foreground z-10 overflow-hidden"
      initial={{ opacity: 0, y: 200 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {/* Animated background gradients */}
      <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gold/10 rounded-full blur-[100px] md:blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gold/10 rounded-full blur-[100px] md:blur-[150px]" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        {/* Free Trial Banner */}
        <motion.div
          className="mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold via-yellow-400 to-amber-500 p-1 max-w-sm mx-auto md:max-w-none shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-200%", "200%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1
              }}
            />
            
            <div className="relative bg-background rounded-xl p-6 sm:p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <motion.div 
                    className="flex items-center justify-center md:justify-start gap-2 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                    </motion.div>
                    <span className="text-gold font-bold text-sm sm:text-base uppercase tracking-wide">{t("pricing.bannerBadge")}</span>
                  </motion.div>
                  
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    {t("pricing.bannerTitle")}
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4">
                    {t("pricing.bannerSubtitle")}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                      <span className="text-muted-foreground">{t("pricing.bannerPoints.noCommitment")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                      <span className="text-muted-foreground">{t("pricing.bannerPoints.cancelAnytime")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                      <span className="text-muted-foreground">{t("pricing.bannerPoints.fullAccess")}</span>
                    </div>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={() => navigate('/book-meeting')}
                    className="group relative text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 h-auto font-bold shadow-2xl hover:shadow-gold/50 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      {t("pricing.bannerTitle")}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-left"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.span 
            className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-gold text-foreground text-xs sm:text-sm font-bold rounded-full mb-3 sm:mb-4 shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            {t("pricing.sectionBadge")}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
            {t("pricing.sectionTitle")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t("pricing.sectionDescription")}
          </p>
        </motion.div>

        {/* VA Count Selector */}
        <motion.div 
          className="max-w-xl mx-auto mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-3 sm:mb-4">
            <label className="block text-base sm:text-lg lg:text-xl font-bold mb-2 text-foreground">
              {t("pricing.vaCountLabel")}
            </label>
            <span className="text-xs sm:text-sm text-muted-foreground px-2">
              {t("pricing.vaCountHelper")}
            </span>
          </div>
          
          <div className="relative group">
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl pointer-events-none" />
            
            {/* Glow effect on focus */}
            <div className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl bg-gold/20" />
            
            <select 
              value={vaCount}
              onChange={(e) => setVaCount(Number(e.target.value))}
              className="relative w-full p-3 sm:p-4 md:p-5 bg-card/90 backdrop-blur-sm border-2 border-border/50 hover:border-gold/70 focus:border-gold rounded-lg sm:rounded-xl text-center font-bold text-lg sm:text-xl lg:text-2xl focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all duration-300 text-foreground appearance-none cursor-pointer shadow-md hover:shadow-lg hover:shadow-gold/10 active:scale-[0.98]"
              style={{
                backgroundImage: 'none'
              }}
              aria-label="Select number of virtual assistants"
              aria-describedby="va-count-description"
            >
              {Array.from({ length: MAX_VA_COUNT }, (_, i) => i + 1).map(num => (
                <option 
                  key={num} 
                  value={num} 
                  className="text-foreground bg-card py-2 sm:py-3"
                >
                  {num} VA{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/70 group-hover:text-gold transition-all duration-300 group-focus-within:rotate-180">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Price per VA indicator */}
          {avgPricePerVA > 0 && (
            <motion.div 
              className="mt-4 sm:mt-5 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gold/10 text-foreground text-xs sm:text-sm font-semibold rounded-full border border-gold/30 shadow-sm">
                {t("pricing.startingFrom", { price: avgPricePerVA, hourly: Math.round(avgPricePerVA / (avgHoursPerWeek * 4)) })}
              </span>
            </motion.div>
          )}

          {discount > 0 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 sm:mt-5 p-2.5 sm:p-3 bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 backdrop-blur-sm border-2 border-gold/50 rounded-lg sm:rounded-xl text-center shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <p className="text-gold font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-base sm:text-lg" aria-hidden="true">🎉</span>
                <span className="whitespace-nowrap">{t("pricing.bulkDiscount", { percent: Math.round(discount * 100) })}</span>
                <span className="whitespace-nowrap">{t("pricing.bulkSavings", { amount: Math.round(plans.reduce((sum, plan) => sum + plan.price, 0) * vaCount * discount) })}</span>
              </p>
            </motion.div>
          )}
          {vaCount >= 2 && vaCount < BULK_DISCOUNT_THRESHOLD && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 sm:mt-5 p-2.5 sm:p-3 bg-muted/50 backdrop-blur-sm border border-border rounded-lg sm:rounded-xl text-center"
              role="status"
            >
              <p className="text-muted-foreground text-xs sm:text-sm flex items-center justify-center gap-1.5 flex-wrap">
                <span>💡</span>
                <span>
                  {t("pricing.bulkHint", {
                    count: BULK_DISCOUNT_THRESHOLD - vaCount,
                    suffix: BULK_DISCOUNT_THRESHOLD - vaCount > 1 ? 's' : '',
                    percent: Math.round(BULK_DISCOUNT_RATE * 100),
                  })}
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            return (
            <motion.div 
              key={plan._id || plan.planKey}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -12, scale: 1.02 }}
            >
              {/* Animated gradient border for highlighted plan */}
              {plan.highlighted && (
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-gold via-yellow-400 to-amber-500 rounded-2xl"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                />
              )}
              
              <div className={`relative rounded-2xl p-6 sm:p-8 md:p-10 transition-all duration-500 group h-full ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-gold/95 via-gold/98 to-amber-500 text-foreground shadow-[0_25px_70px_-15px_hsl(45_75%_52%/0.5)]' 
                  : 'bg-card border-2 border-border/60 hover:border-gold/80 hover:shadow-[0_25px_70px_-15px_hsl(45_75%_52%/0.4)]'
              }`}>
                {/* Top accent line with animation */}
                <motion.div 
                  className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                    plan.highlighted ? 'bg-foreground/20' : 'bg-gradient-to-r from-transparent via-gold to-transparent'
                  }`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              
                {plan.badge && (
                  <motion.div 
                    className="absolute -top-4 right-6 bg-gradient-to-r from-foreground to-foreground/95 text-gold px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 border border-gold/20"
                    initial={{ y: -10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </motion.div>
                    {plan.badge}
                  </motion.div>
                )}
              
                {/* Header */}
                <div className="mb-6 relative z-10">
                  <h3 className={`text-2xl sm:text-3xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${
                    plan.highlighted ? 'text-foreground' : 'text-foreground'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${
                      plan.highlighted ? 'text-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {plan.hours}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-current/10 relative z-10">
                  <div className="flex items-baseline gap-1">
                    <motion.span 
                      className={`text-5xl sm:text-6xl font-bold tracking-tight ${
                        plan.highlighted ? 'text-foreground' : 'text-gold'
                      }`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.8, delay: 0.4 }}
                    >
                      €{Math.round(plan.price * (1 - discount) * vaCount)}
                    </motion.span>
                    <span className={`text-base ml-1 ${
                      plan.highlighted ? 'text-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {t('pricing.perMonth', { defaultValue: '/mo' })}
                    </span>
                  </div>
                  {plan.setupFee > 0 ? (
                    <p className={`text-xs mt-2 ${
                      plan.highlighted ? 'text-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {t("pricing.planSetupFee", { fee: plan.setupFee })}
                    </p>
                  ) : (
                    <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${
                      plan.highlighted ? 'text-foreground' : 'text-gold'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                      {t("pricing.planNoSetupFee")}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 relative z-10">
                  {plan.features.map((feature, fIndex) => (
                    <motion.li 
                      key={fIndex} 
                      className="flex items-start gap-2.5"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + fIndex * 0.1 }}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-110 ${
                        plan.highlighted ? 'bg-foreground/20' : 'bg-gold/10 group-hover:bg-gold/20'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          plan.highlighted ? 'text-foreground' : 'text-gold'
                        }`} />
                      </div>
                      <span className={`text-sm leading-relaxed ${
                        plan.highlighted ? 'text-foreground/85' : 'text-muted-foreground'
                      }`}>
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                  onClick={() => navigate('/book-meeting')}
                  className={`w-full relative z-10 font-bold text-base py-6 sm:py-7 rounded-xl transition-all duration-300 group/btn overflow-hidden min-h-[44px] ${
                    plan.highlighted 
                      ? 'bg-foreground text-gold hover:bg-foreground/95 shadow-lg hover:shadow-xl hover:scale-105' 
                      : 'border-2 border-gold text-gold hover:bg-gold hover:text-foreground hover:scale-105'
                  }`}
                  aria-label={`Get started with ${plan.name} plan - ${plan.hours} at €${Math.round(plan.price * (1 - discount) * vaCount)} ${t('pricing.perMonth', { defaultValue: '/mo' })}`}
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" aria-hidden="true" />
                  <span className="relative">{t("pricing.button")}</span>
                </Button>
              </div>
            </motion.div>
          )})}
        </div>

        <motion.p 
          className="text-center text-muted-foreground mt-10 sm:mt-12 md:mt-16 lg:mt-20 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {t("pricing.disclaimer")}
        </motion.p>
      </div>
    </motion.section>
  );
};
