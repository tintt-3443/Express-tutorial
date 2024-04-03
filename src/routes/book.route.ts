import express from 'express';
import * as bookController from '../controller/book.controller';
const router = express.Router();
router.post('/remove/:id', bookController.bookDeletePost);
router.get('/delete/:id', bookController.bookDeleteGet);
router.get('/create', bookController.bookCreateGet);
router.post('/add', bookController.postBookCreateForm);
router.get('/update/:id', bookController.bookUpdateGet);
router.post('/update/:id', bookController.bookUpdatePost);
router.get('/', bookController.bookList);
router.get('/:id', bookController.bookDetail);

export default router;
