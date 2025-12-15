import Blog from '../models/Blog.js';

// Public: GET blogs by language
export async function getBlogs(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    
    // Fetch blogs for the requested language, but be tolerant of older
    // documents that may have been saved with different casing.
    const requestedLangs = Array.from(new Set([lang, lang.toUpperCase()]));
    let blogs = await Blog.find({ lang: { $in: requestedLangs } })
      .sort({ order: 1, blogId: 1 })
      .lean();
    
    // If the requested language has no data, fall back to English so the
    // public site still shows a complete blog list instead of an empty
    // section. The frontend can show a small notice when a fallback occurs.
    let sourceLang = lang;
    if (blogs.length === 0 && lang !== 'en') {
      const fallback = await Blog.find({ lang: { $in: ['en', 'EN'] } })
        .sort({ order: 1, blogId: 1 })
        .lean();
      if (fallback.length > 0) {
        blogs = fallback;
        sourceLang = 'en';
      }
    }
    
    // Debug: Check what languages exist in database if no blogs found
    if (blogs.length === 0) {
      const allBlogs = await Blog.find({}).select('lang blogId').lean();
      const langCounts = {};
      allBlogs.forEach(b => {
        langCounts[b.lang] = (langCounts[b.lang] || 0) + 1;
      });
      console.log(`[getBlogs] No blogs found for lang=${lang}. Available languages in DB:`, langCounts);
    } else {
      console.log(`[getBlogs] lang=${lang}, found ${blogs.length} blogs, sourceLang=${sourceLang}`);
    }
    
    return res.json({ lang, sourceLang, blogs });
  } catch (err) {
    console.error('getBlogs error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Public: GET single blog by ID
export async function getBlogById(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }
    
    // Fetch blog with case-insensitive language matching
    const requestedLangs = Array.from(new Set([lang, lang.toUpperCase()]));
    let blog = await Blog.findOne({ lang: { $in: requestedLangs }, blogId }).lean();
    
    // Fallback to English if requested language not found
    if (!blog && lang !== 'en') {
      blog = await Blog.findOne({ lang: { $in: ['en', 'EN'] }, blogId }).lean();
    }
    
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    return res.json({ lang, blog });
  } catch (err) {
    console.error('getBlogById error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: list blogs for a language
export async function listBlogs(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    
    // Fetch blogs for the requested language, but be tolerant of older
    // documents that may have been saved with different casing.
    const requestedLangs = Array.from(new Set([lang, lang.toUpperCase()]));
    const blogs = await Blog.find({ lang: { $in: requestedLangs } })
      .sort({ order: 1, blogId: 1 })
      .lean();
    
    console.log(`[listBlogs] lang=${lang}, found ${blogs.length} blogs`);
    return res.json({ lang, blogs });
  } catch (err) {
    console.error('listBlogs error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create blog
export async function createBlog(req, res) {
  try {
    const { lang = 'en', blog } = req.body || {};
    if (!blog || blog.blogId === undefined) {
      return res.status(400).json({ error: 'blog with blogId required' });
    }
    const created = await Blog.create({ ...blog, lang: lang.toLowerCase() });
    return res.status(201).json({ message: 'created', blog: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'duplicate blogId for lang' });
    }
    console.error('createBlog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: update blog
export async function updateBlog(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }
    const updated = await Blog.findOneAndUpdate(
      { lang: lang.toLowerCase(), blogId },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'updated', blog: updated });
  } catch (err) {
    console.error('updateBlog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete blog
export async function deleteBlog(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }
    const result = await Blog.deleteOne({ lang, blogId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('deleteBlog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

