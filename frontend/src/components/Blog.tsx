import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

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

interface BlogPost {
  blogId: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  charts?: any;
  order?: number;
  id?: number | string;
  sections?: { heading: string; details: string }[];
}


export const Blog = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
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

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/blogs?lang=${currentLang}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchedBlogs = Array.isArray(data.blogs) 
          ? data.blogs.sort((a: BlogPost, b: BlogPost) => (a.order || 0) - (b.order || 0) || a.blogId - b.blogId)
          : [];
        
        if (import.meta.env.DEV) {
          console.log(`[Blog] Fetched ${fetchedBlogs.length} blogs for lang=${currentLang}, sourceLang=${data.sourceLang || currentLang}`);
        }
        
        setPosts(fetchedBlogs);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching blogs:', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to load blogs');
        setPosts([]); // No fallback - only use database
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentLang]);

  // Loading state
  if (loading) {
    return (
      <motion.section
        id="blog"
        className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-background overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        </div>
      </motion.section>
    );
  }

  // Error or empty state
  if (error || posts.length === 0) {
    return (
      <motion.section
        id="blog"
        className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-background overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {error || (currentLang === 'de' 
                ? 'Keine Blog-Artikel verfügbar. Bitte fügen Sie Blog-Artikel im Admin-Panel hinzu.'
                : 'No blog posts available. Please add blog posts in the admin panel.')}
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      id="blog"
      className="relative py-8 sm:py-10 md:py-12 lg:py-14 bg-background overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="relative mb-8 sm:mb-12 lg:mb-16 text-left"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gold/10 text-gold text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">
            {t("blog.badge")}
          </span>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-foreground"
            dangerouslySetInnerHTML={{ __html: t("blog.heading") }}
          />
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            {t("blog.description")}
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {posts.map((post: BlogPost, index: number) => (
            <motion.article
              key={post.blogId || post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-card border border-border/50 rounded-xl sm:rounded-2xl overflow-hidden hover:border-gold/50 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer w-full"
              onClick={() => navigate(`/blog/${slugify(post.title)}-${post.blogId || post.id}`)}
              whileHover={{ y: -8 }}
            >
              {/* Image */}
              <div className="relative h-44 sm:h-52 md:h-48 lg:h-56 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-gold text-foreground text-xs font-bold rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground mb-2 sm:mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-gold transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t("blog.by")} {post.author}</span>
                  <div className="flex items-center gap-1 sm:gap-2 text-gold font-semibold text-xs sm:text-sm group-hover:gap-2 sm:group-hover:gap-3 transition-all">
                    <span className="hidden sm:inline">{t("blog.readMore")}</span>
                    <span className="sm:hidden">{t("blog.read")}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
