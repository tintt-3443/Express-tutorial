import express from 'express';
import * as bookController from '../controller/book.controller';
const router = express.Router();

router.get('/', bookController.bookList);
router.get('/:id', bookController.bookDetail);

export default router;
