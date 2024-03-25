import express from 'express';
import * as bookController from '../controller/book.controller';
const router = express.Router();

router.get('/', bookController.bookList);

export default router;
