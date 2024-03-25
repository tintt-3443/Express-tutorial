import authorRoute from './author.route';
import { Router } from 'express';
import booGenreRoute from './bookGenre.route';
import bookInstanceRoute from './bookInstance.route';
import bookRoute from './book.route';
import genreRoute from './genre.route';
import { index } from '../controller/book.controller';
// import { Request, Response } from 'express';
const router: Router = Router();

router.get('/', index);

router.use('/authors', authorRoute);
router.use('/books', bookRoute);
router.use('/bookGenre', booGenreRoute);
router.use('/book-instances', bookInstanceRoute);
router.use('/genres', genreRoute);

export default router;
