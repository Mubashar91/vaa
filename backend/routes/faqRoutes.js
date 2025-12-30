import express from 'express';
import { getFAQs } from '../controllers/faqController.js';

const router = express.Router();

// Public FAQ endpoint
router.get('/', getFAQs);

export default router;
