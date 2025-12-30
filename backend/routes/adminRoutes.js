import { Router } from 'express';
import { listPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController.js';
import { listSteps, createStep, updateStep, deleteStep } from '../controllers/howItWorksController.js';
import { listFAQs, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faqController.js';
import { listServices, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { listBlogs, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { listCaseStudies, createCaseStudy, updateCaseStudy, deleteCaseStudy } from '../controllers/caseStudyController.js';
import { getHeroAdmin, upsertHero } from '../controllers/heroController.js';
import { getWhyChooseUsAdmin, upsertWhyChooseUs } from '../controllers/whyChooseUsController.js';
import { getFooterAdmin, upsertFooter } from '../controllers/footerController.js';
import { adminAuth } from '../middleware/authMiddleware.js';
import { getFinalCTAAdmin, upsertFinalCTA } from '../controllers/finalCtaController.js';

const router = Router();

router.use(adminAuth);

// Pricing routes
router.options('/pricing', (_req, res) => res.sendStatus(204));
router.options('/pricing/:planKey', (_req, res) => res.sendStatus(204));
router.get('/pricing', listPlans);
router.post('/pricing', createPlan);
router.put('/pricing/:planKey', updatePlan);
router.delete('/pricing/:planKey', deletePlan);

// How It Works routes
router.options('/how-it-works', (_req, res) => res.sendStatus(204));
router.options('/how-it-works/:stepNumber', (_req, res) => res.sendStatus(204));
router.get('/how-it-works', listSteps);
router.post('/how-it-works', createStep);
router.put('/how-it-works/:stepNumber', updateStep);
router.delete('/how-it-works/:stepNumber', deleteStep);

// FAQ routes
router.options('/faq', (_req, res) => res.sendStatus(204));
router.options('/faq/:id', (_req, res) => res.sendStatus(204));
router.get('/faq', listFAQs);
router.post('/faq', createFAQ);
router.put('/faq/:id', updateFAQ);
router.delete('/faq/:id', deleteFAQ);

// Services routes
router.options('/services', (_req, res) => res.sendStatus(204));
router.options('/services/:id', (_req, res) => res.sendStatus(204));
router.get('/services', listServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Testimonials routes
router.options('/testimonials', (_req, res) => res.sendStatus(204));
router.options('/testimonials/:id', (_req, res) => res.sendStatus(204));
router.get('/testimonials', listTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Blog routes
router.options('/blogs', (_req, res) => res.sendStatus(204));
router.options('/blogs/:id', (_req, res) => res.sendStatus(204));
router.get('/blogs', listBlogs);
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Case Study routes
router.options('/case-studies', (_req, res) => res.sendStatus(204));
router.options('/case-studies/:id', (_req, res) => res.sendStatus(204));
router.get('/case-studies', listCaseStudies);
router.post('/case-studies', createCaseStudy);
router.put('/case-studies/:id', updateCaseStudy);
router.delete('/case-studies/:id', deleteCaseStudy);

// Hero routes
router.options('/hero', (_req, res) => res.sendStatus(204));
router.get('/hero', getHeroAdmin);
router.post('/hero', upsertHero);
router.put('/hero', upsertHero);

// Why Choose Us routes
router.options('/why-choose-us', (_req, res) => res.sendStatus(204));
router.get('/why-choose-us', getWhyChooseUsAdmin);
router.post('/why-choose-us', upsertWhyChooseUs);
router.put('/why-choose-us', upsertWhyChooseUs);

// Footer routes
router.options('/footer', (_req, res) => res.sendStatus(204));
router.get('/footer', getFooterAdmin);
router.post('/footer', upsertFooter);
router.put('/footer', upsertFooter);

// Final CTA routes
router.options('/final-cta', (_req, res) => res.sendStatus(204));
router.get('/final-cta', getFinalCTAAdmin);
router.post('/final-cta', upsertFinalCTA);
router.put('/final-cta', upsertFinalCTA);

export default router;
