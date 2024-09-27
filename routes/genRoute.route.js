import express from 'express';
import generateSvg from '../controllers/generateSvg.js';
const router= express.Router();
router.post('/', generateSvg)
export default router;