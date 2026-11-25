import express from 'express';
import { getWebsiteContent, getSectionContent } from '../controllers/websiteController.js';

const router = express.Router();

router.get('/content', getWebsiteContent);
router.get('/content/:sectionKey', getSectionContent);

export default router;
