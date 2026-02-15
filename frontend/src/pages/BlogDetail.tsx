import { motion, useScroll, useSpring } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Twitter, Linkedin, Link as LinkIcon, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

type DataPoint = Record<string, string | number>;

type BaseChartConfig = {
  title?: string;
  subtitle?: string;
};

type AxisFormatters = {
  xKey?: string;
  yFormatter?: (value: number) => string;
  xFormatter?: (value: string | number) => string;
};

type BlogChartConfig =
  | (BaseChartConfig & { type: "pie"; data: DataPoint[]; valueKey: string; labelKey: string; innerRadius?: number; outerRadius?: number })
  | (BaseChartConfig & { type: "radar"; data: DataPoint[]; angleKey: string; series: ChartSeries[] })
  | (BaseChartConfig & { type: "bar" | "line" | "area"; data: DataPoint[]; xKey: string; series: ChartSeries[] } & AxisFormatters);

interface Section { heading: string; details: string }

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  charts?: BlogChartConfig[];
  sections?: Section[];
}

// Chart data for different blog posts
const COLORS = ['#d4af37', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f59e0b'];

// Blog 1: Cost Savings - Bar Chart
const blog1CostData = [
  { category: 'Office Space', traditional: 9600, withVA: 0 },
  { category: 'Benefits', traditional: 10000, withVA: 0 },
  { category: 'Equipment', traditional: 3000, withVA: 0 },
  { category: 'Salary', traditional: 40000, withVA: 14549 },
  { category: 'Training', traditional: 2000, withVA: 0 },
];

// Blog 2: Task Delegation - Pie Chart
const blog2TaskData = [
  { name: 'Email Management', value: 25, hours: 10 },
  { name: 'Calendar Management', value: 15, hours: 6 },
  { name: 'Social Media', value: 20, hours: 8 },
  { name: 'Data Entry', value: 20, hours: 8 },
  { name: 'Customer Support', value: 20, hours: 8 },
];

// Blog 3: Scaling Business - Area Chart
const blog3ScalingData = [
  { month: 'Month 1', revenue: 50000, costs: 35000, profit: 15000 },
  { month: 'Month 2', revenue: 65000, costs: 38000, profit: 27000 },
  { month: 'Month 3', revenue: 85000, costs: 40000, profit: 45000 },
  { month: 'Month 4', revenue: 110000, costs: 42000, profit: 68000 },
  { month: 'Month 5', revenue: 140000, costs: 45000, profit: 95000 },
  { month: 'Month 6', revenue: 175000, costs: 48000, profit: 127000 },
];

// Additional datasets could be defined here for future blog posts (line, radar, comparison, etc.).

// Derived datasets & helpers
const formatCurrency = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const formatPercent = (n: number) => `${n.toFixed(0)}%`;

const blog1TotalsPie = (() => {
  const traditional = blog1CostData.reduce((s, d) => s + (typeof d.traditional === 'number' ? d.traditional : 0), 0);
  const withVA = blog1CostData.reduce((s, d) => s + (typeof d.withVA === 'number' ? d.withVA : 0), 0);
  return [
    { name: 'Traditional', value: traditional },
    { name: 'With VA', value: withVA },
  ];
})();

const blog3WithMargin = blog3ScalingData.map(d => ({ ...d, margin: Math.round((d.profit / d.revenue) * 100) }));

// Note: Chart data constants are kept for chart rendering, but blog content is fetched from database only

// Removed hardcoded blogPostsEn and blogPostsDe arrays - blogs are fetched from database only

const BlogDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation();

  // Extract numeric ID from slug-title-id format
  const blogId = id ? parseInt(id.split('-').pop() || id, 10) : undefined;

  const [currentLang, setCurrentLang] = useState(i18n.language);
  useEffect(() => {
    const handler = (lng: string) => setCurrentLang(lng);
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [blogId, i18n]);

  // Reading progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, restDelta: 0.001 });

  const lang = currentLang?.startsWith('de') ? 'de' : 'en';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [dePost, setDePost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog post from API
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const [enRes, deRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5001'}/api/blogs/${blogId}?lang=en`),
          fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5001'}/api/blogs/${blogId}?lang=de`)
        ]);
        
        if (enRes.ok) {
          const enData = await enRes.json();
          const blogPost: BlogPost = {
            id: enData.blog.blogId,
            title: enData.blog.title,
            excerpt: enData.blog.excerpt,
            content: enData.blog.content,
            author: enData.blog.author,
            date: enData.blog.date,
            readTime: enData.blog.readTime,
            category: enData.blog.category,
            image: enData.blog.image,
            charts: enData.blog.charts,
            sections: enData.blog.sections,
          };
          setPost(blogPost);
        }
        
        if (deRes.ok) {
          const deData = await deRes.json();
          const blogPost: BlogPost = {
            id: deData.blog.blogId,
            title: deData.blog.title,
            excerpt: deData.blog.excerpt,
            content: deData.blog.content,
            author: deData.blog.author,
            date: deData.blog.date,
            readTime: deData.blog.readTime,
            category: deData.blog.category,
            image: deData.blog.image,
            charts: deData.blog.charts,
            sections: deData.blog.sections,
          };
          setDePost(blogPost);
        }

        // Fetch all posts for navigation
        const allRes = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5001'}/api/blogs?lang=${lang}`);
        if (allRes.ok) {
          const allData = await allRes.json();
          const allBlogs = Array.isArray(allData.blogs) ? allData.blogs.map((b: any): BlogPost => ({
            id: b.blogId,
            title: b.title,
            excerpt: b.excerpt,
            content: b.content,
            author: b.author,
            date: b.date,
            readTime: b.readTime,
            category: b.category,
            image: b.image,
            charts: b.charts,
            sections: b.sections,
          })) : [];
          setAllPosts(allBlogs);
        }
      } catch (err) {
        // No fallback - only use database
        console.error('Error fetching blog:', err);
        setPost(null);
        setDePost(null);
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) fetchBlog();
  }, [blogId, lang]);

  const currentPost = lang === 'de' && dePost ? dePost : post;
  const currentIndex = allPosts.findIndex(p => p.id === blogId);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t("blog.detail.notFound")}</h1>
          <button
            onClick={() => navigate(`/`)}
            className="text-gold hover:underline"
          >
            {t("blog.detail.returnHome")}
          </button>
        </div>
      </div>
    );
  }

  const renderSingleChart = (c: BlogChartConfig) => {
    if (c.type === 'bar') {
      return (
        <BarChart data={c.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={c.xKey} stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} tickFormatter={v => (c.yFormatter ? c.yFormatter(Number(v)) : String(v))} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid #d4af37', borderRadius: '10px', color: '#fff', padding: '10px 12px' }}
            labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
            itemStyle={{ color: '#fff', fontSize: 14 }}
          />
          <Legend wrapperStyle={{ color: '#E5E7EB', fontSize: 13 }} />
          {c.series.map(s => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[6, 6, 0, 0]} />
          ))}
        </BarChart>
      );
    }
    if (c.type === 'line') {
      return (
        <LineChart data={c.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={c.xKey} stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} tickFormatter={v => (c.yFormatter ? c.yFormatter(Number(v)) : String(v))} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid #d4af37', borderRadius: '10px', color: '#fff', padding: '10px 12px' }}
            labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
            itemStyle={{ color: '#fff', fontSize: 14 }}
          />
          <Legend wrapperStyle={{ color: '#E5E7EB', fontSize: 13 }} />
          {c.series.map(s => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={3} dot={false} />
          ))}
        </LineChart>
      );
    }
    if (c.type === 'area') {
      return (
        <AreaChart data={c.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={c.xKey} stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} tickFormatter={v => (c.yFormatter ? c.yFormatter(Number(v)) : String(v))} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid #d4af37', borderRadius: '10px', color: '#fff', padding: '10px 12px' }}
            labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
            itemStyle={{ color: '#fff', fontSize: 14 }}
          />
          <Legend wrapperStyle={{ color: '#E5E7EB', fontSize: 13 }} />
          {c.series.map(s => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.25} strokeWidth={2} />
          ))}
        </AreaChart>
      );
    }
    if (c.type === 'pie') {
      return (
        <PieChart>
          <Pie
            data={c.data}
            dataKey={c.valueKey}
            nameKey={c.labelKey}
            innerRadius={c.innerRadius ?? 60}
            outerRadius={c.outerRadius ?? 110}
          >
            {c.data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid #d4af37', borderRadius: '10px', color: '#fff', padding: '10px 12px' }}
            labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
            itemStyle={{ color: '#fff', fontSize: 14 }}
          />
          <Legend wrapperStyle={{ color: '#E5E7EB', fontSize: 13 }} />
        </PieChart>
      );
    }
    if (c.type === 'radar') {
      return (
        <RadarChart data={c.data}>
          <PolarGrid stroke="#444" />
          <PolarAngleAxis dataKey={c.angleKey} stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          {c.series.map((s: ChartSeries) => (
            <Radar key={s.key} name={s.label} dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.5} />
          ))}
          <Legend wrapperStyle={{ color: '#E5E7EB', fontSize: 13 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid #d4af37', borderRadius: '10px', color: '#fff', padding: '10px 12px' }}
            labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
            itemStyle={{ color: '#fff', fontSize: 14 }}
          />
        </RadarChart>
      );
    }
    return null;
  };

 

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 h-1 bg-gold origin-[0%_50%] z-40"
        style={{ scaleX: progress }}
      />
      <Navbar />
      
      <motion.section
        className="relative pt-4 sm:pt-6 pb-20 sm:pb-24 md:pb-28 lg:pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16">
          {/* Back button */}
          <motion.button
            onClick={() => navigate(`/`)}
            className="mt-11 mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-card/50 backdrop-blur-sm border-2 border-border/50 hover:border-gold/50 rounded-lg sm:rounded-xl text-foreground hover:text-gold transition-all duration-300 font-semibold group shadow-md hover:shadow-lg hover:shadow-gold/10 text-sm sm:text-base"
            whileHover={{ x: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span>{t("blog.detail.backToHome")}</span>
          </motion.button>

          <article className="max-w-5xl mx-auto">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group border-2 border-gold/20 hover:border-gold/40 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <img
                src={currentPost.image}
                alt={currentPost.title}
                className="w-full h-56 sm:h-72 md:h-96 lg:h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </motion.div>

            {/* Author box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-10 sm:mb-12 p-5 sm:p-6 border border-border/60 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur"
            >
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border border-gold/40 flex items-center justify-center text-foreground font-bold">
                  {currentPost.author.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h4 className="text-lg sm:text-xl font-bold text-foreground">{currentPost.author}</h4>
                    <span className="text-xs sm:text-sm text-muted-foreground">• {currentPost.date} • {currentPost.readTime}</span>
                  </div>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground">{t("blog.detail.authorDescription")}</p>
                </div>
              </div>
            </motion.div>

            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 sm:mb-8 lg:mb-10"
            >
              <motion.span 
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-500 text-xs sm:text-sm font-semibold rounded-full mb-4 sm:mb-6 border border-amber-500/30 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                {currentPost.category}
              </motion.span>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-5 sm:mb-7 text-foreground leading-tight tracking-tight">
                {currentPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-5 lg:gap-8 text-xs sm:text-sm md:text-base text-muted-foreground pb-6 sm:pb-8 border-b-2 border-amber-500/20">
                <motion.div 
                  className="flex items-center gap-2 sm:gap-3 bg-card/50 px-4 py-2 rounded-xl border border-border/50 hover:border-amber-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  </div>
                  <span className="font-semibold text-foreground">{currentPost.author}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 sm:gap-3 bg-card/50 px-4 py-2 rounded-xl border border-border/50 hover:border-amber-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  </div>
                  <span className="font-medium">{currentPost.date}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 sm:gap-3 bg-card/50 px-4 py-2 rounded-xl border border-border/50 hover:border-amber-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  </div>
                  <span className="font-medium">{currentPost.readTime}</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Share actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = encodeURIComponent(currentPost.title);
                  const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`;
                  window.open(shareUrl, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 hover:border-gold/60 text-foreground hover:text-gold transition"
              >
                <Twitter className="w-4 h-4" /> {t("blog.detail.shareX")}
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  const title = encodeURIComponent(currentPost.title);
                  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${title}`;
                  window.open(shareUrl, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 hover:border-gold/60 text-foreground hover:text-gold transition"
              >
                <Linkedin className="w-4 h-4" /> {t("blog.detail.shareLinkedIn")}
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                  } catch {
                    void 0;
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 hover:border-gold/60 text-foreground hover:text-gold transition"
                aria-label={t("blog.detail.copyLink")}
              >
                <LinkIcon className="w-4 h-4" /> {t("blog.detail.copyLink")}
              </button>
            </div>

            {/* Content */}
            {/* Plain chart blocks: chart then a paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-12 sm:mb-16"
            >
              {(() => {
                const charts = (dePost?.charts ?? currentPost.charts) ?? [];
                return charts.length > 0 ? (
                <div className="space-y-10">
                  {charts.map((c, idx) => (
                    <div key={idx}>
                      <div className="w-full" style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {renderSingleChart(c)}
                        </ResponsiveContainer>
                      </div>
                      {(c.subtitle || c.title) && (
                        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                          {c.subtitle ?? c.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                ) : null;
              })()}
            </motion.div>

            {/* Blog Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-base sm:prose-lg max-w-none mb-10 sm:mb-14
                prose-headings:font-bold
                prose-h2:text-amber-500 prose-h2:text-2xl sm:prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mb-6 prose-h2:mt-14 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-gradient-to-r prose-h2:from-amber-500 prose-h2:to-yellow-600
                prose-h3:text-yellow-500 prose-h3:text-xl sm:prose-h3:text-2xl lg:prose-h3:text-3xl prose-h3:mb-4 prose-h3:mt-10
                prose-h4:text-yellow-400 prose-h4:text-lg sm:prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-8
                prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-base sm:prose-p:text-lg lg:prose-p:text-[1.05rem]
                prose-strong:text-amber-500 prose-strong:font-semibold prose-strong:text-base sm:prose-strong:text-lg
                prose-ul:my-6 prose-ul:space-y-3
                prose-ol:my-6 prose-ol:space-y-3
                prose-li:text-foreground/85 prose-li:text-base sm:prose-li:text-lg lg:prose-li:text-[1.05rem] prose-li:leading-relaxed prose-li:pl-2
                [&_ul]:list-none [&_ul]:pl-0
                [&_ul>li]:relative [&_ul>li]:pl-8 [&_ul>li]:before:content_['▸'] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:text-amber-500 [&_ul>li]:before:font-bold [&_ul>li]:before:text-xl
                [&_ol]:list-none [&_ol]:pl-0 [&_ol]:counter-reset-[item]
                [&_ol>li]:relative [&_ol>li]:pl-8 [&_ol>li]:counter-increment-[item] [&_ol>li]:before:content-[counter(item)] [&_ol>li]:before:absolute [&_ol>li]:before:left-0 [&_ol>li]:before:text-amber-500 [&_ol>li]:before:font-bold [&_ol>li]:before:text-lg [&_ol>li]:before:bg-amber-500/10 [&_ol>li]:before:w-6 [&_ol>li]:before:h-6 [&_ol>li]:before:rounded-full [&_ol>li]:before:flex [&_ol>li]:before:items-center [&_ol>li]:before:justify-center
                [&_li>strong]:text-amber-500
                [&_br]:my-2"
            >
              {(() => {
                const postToRender = (lang === 'de' && dePost) ? dePost : currentPost;
                const sections = postToRender.sections || [];
                if (sections.length > 0) {
                  return (
                    <div>
                      {sections.map((s, idx) => (
                        <div key={idx}>
                          {s.heading ? <h2>{s.heading}</h2> : null}
                          {s.details
                            ? s.details
                                .split(/\n\n+/)
                                .map((para, pIdx) => (
                                  <p key={pIdx} className="whitespace-pre-line">
                                    {para}
                                  </p>
                                ))
                            : null}
                        </div>
                      ))}
                    </div>
                  );
                }

                const content = postToRender.content || '';
                const looksLikeHTML = /<\s*([a-zA-Z]+)(\s|>|\/)/.test(content) || /<\s*br\s*\/?\s*>/i.test(content);
                if (looksLikeHTML) {
                  return <div dangerouslySetInnerHTML={{ __html: content }} />;
                }

                return (
                  <div>
                    {content
                      .split(/\n\n+/)
                      .map((para, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {para}
                        </p>
                      ))}
                  </div>
                );
              })()}
            </motion.div>

            {/* Prev / Next navigation */}
            {(prevPost || nextPost) && (
              <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                {prevPost && (
                  <button
                    onClick={() => navigate(`/blog/${prevPost.id}`)}
                    className="flex-1 text-left px-4 py-3 rounded-lg border border-border/60 hover:border-gold/60 transition"
                  >
                    ← {prevPost.title}
                  </button>
                )}
                {nextPost && (
                  <button
                    onClick={() => navigate(`/blog/${nextPost.id}`)}
                    className="flex-1 text-right px-4 py-3 rounded-lg border border-border/60 hover:border-gold/60 transition"
                  >
                    {nextPost.title} →
                  </button>
                )}
              </div>
            )}

            {/* CTA at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 sm:mt-16 p-6 sm:p-8 md:p-10 lg:p-12 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border-2 border-gold/30 rounded-xl sm:rounded-2xl text-center relative overflow-hidden group hover:border-gold/50 transition-all duration-300"
            >
              {/* Background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground">
                  {t("blog.detail.readyToTransform")}
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
                  {t("blog.detail.ctaDescription")}
                </p>
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gold text-foreground font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-gold/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  <span className="hidden sm:inline">{t("blog.detail.bookConsultation")}</span>
                  <span className="sm:hidden">{t("blog.detail.getStarted")}</span>
                </button>
              </div>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-border"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-foreground">{t("blog.detail.moreArticles")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {allPosts
                  .filter((p: BlogPost) => p.id !== currentPost.id)
                  .slice(0, 2)
                  .map((relatedPost: BlogPost) => (
                  <motion.div
                    key={relatedPost.id}
                    onClick={() => navigate(`/blog/${relatedPost.id}`)}
                    className="group cursor-pointer bg-card border border-border/50 rounded-lg sm:rounded-xl overflow-hidden hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 transition-all duration-300"
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-36 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-gold text-foreground text-xs font-bold rounded-full">{relatedPost.category}</span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h4 className="text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-gold transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{relatedPost.excerpt}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </article>
        </div>
      </motion.section>
    </div>
  );
};

export default BlogDetail;
