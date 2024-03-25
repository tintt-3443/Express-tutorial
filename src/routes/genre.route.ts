import express from 'express';
import * as genreController from '../controller/genre.controller';
const router = express.Router();
router.get('/', genreController.genreList);
export default router;
