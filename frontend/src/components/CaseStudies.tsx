import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { type CaseStudy } from "@/data/caseStudies";

// Helper to create URL-friendly slug from title
const slugify = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .trim();
};

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.don-va.com';

interface CaseStudyFromAPI {
  caseStudyId: number;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: Array<{ metric: string; value: string; description: string }>;
  testimonial: string;
  testimonialAuthor: string;
  testimonialRole: string;
  image: string;
  stats: { costSaved: string; timeframe: string; vaCount: string };
}

export const CaseStudies = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [studies, setStudies] = useState<CaseStudy[]>([]);
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

  // Fetch case studies from API
  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/case-studies?lang=${currentLang}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch case studies: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchedStudies = Array.isArray(data.caseStudies) 
          ? data.caseStudies.map((cs: CaseStudyFromAPI): CaseStudy => ({
              id: cs.caseStudyId,
              title: cs.title,
              company: cs.company,
              industry: cs.industry,
              challenge: cs.challenge,
              solution: cs.solution,
              results: cs.results,
              testimonial: cs.testimonial,
              testimonialAuthor: cs.testimonialAuthor,
              testimonialRole: cs.testimonialRole,
              image: cs.image,
              stats: cs.stats,
            })).sort((a: CaseStudy, b: CaseStudy) => a.id - b.id)
          : [];
        
        setStudies(fetchedStudies);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching case studies:', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to load case studies');
        // No fallback to hardcoded data; rely solely on API
        setStudies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, [currentLang]);

  // Loading state
  if (loading) {
    return (
      <motion.section
        id="case-studies"
        className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-b from-background via-muted/30 to-background"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      id="case-studies"
      className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-b from-background via-muted/30 to-background"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error or empty state */}
        {(error || studies.length === 0) && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {error || (currentLang === 'de' 
                ? 'Keine Fallstudien verfügbar. Bitte fügen Sie Fallstudien im Admin-Panel hinzu.'
                : 'No case studies available. Please add case studies in the admin panel.')}
            </p>
          </div>
        )}

        {/* Header */}
        <motion.div
          className="mb-8 sm:mb-12 lg:mb-16 text-left"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gold/10 text-gold text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">
            {t("caseStudies.badge")}
          </span>
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground"
            dangerouslySetInnerHTML={{ __html: t("caseStudies.heading") }}
          />
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            {t("caseStudies.description")}
          </p>
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {studies.map((study: CaseStudy, index: number) => (
            <motion.article
              key={study.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-card border border-border/50 rounded-xl sm:rounded-2xl overflow-hidden hover:border-gold/50 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer w-full"
              onClick={() => navigate(`/case-study/${slugify(study.title)}-${study.id}`)}
              whileHover={{ y: -8 }}
            >
              {/* Image */}
              <div className="relative h-44 sm:h-52 md:h-48 lg:h-56 overflow-hidden">
                <img
                  src={study.image}
                  alt={study.company}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-gold text-foreground text-xs font-bold rounded-full mb-1.5 sm:mb-2">
                    {study.industry}
                  </span>
                  <h3 className="text-white font-bold text-base sm:text-lg line-clamp-2">
                    {study.company}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 lg:p-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-border">
                  <div className="text-center">
                    <div className="text-gold font-bold text-sm sm:text-base lg:text-lg">{study.stats.costSaved}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{t("caseStudies.labels.saved")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gold font-bold text-sm sm:text-base lg:text-lg">{study.stats.vaCount}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{t("caseStudies.labels.teamSize")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gold font-bold text-sm sm:text-base lg:text-lg">{study.stats.timeframe}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{t("caseStudies.labels.timeline")}</div>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-gold transition-colors line-clamp-2">
                  {study.title}
                </h4>

                {/* Challenge snippet */}
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                  {study.challenge}
                </p>

                {/* Read more */}
                <div className="flex items-center gap-1 sm:gap-2 text-gold font-semibold text-xs sm:text-sm group-hover:gap-2 sm:group-hover:gap-3 transition-all">
                  <span className="hidden sm:inline">{t("caseStudies.labels.viewFull")}</span>
                  <span className="sm:hidden">{t("caseStudies.labels.viewStudy")}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-12 lg:mt-16 text-center"
        >
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6">
            {t("caseStudies.cta.ready")}
          </p>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gold text-foreground font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-gold/90 transition-all duration-300 hover:scale-105 shadow-lg">
            <span className="hidden sm:inline">{t("caseStudies.cta.bookConsultation")}</span>
            <span className="sm:hidden">{t("caseStudies.cta.getStarted")}</span>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};
