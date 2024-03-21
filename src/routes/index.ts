import authorRoute from './author.route';
import { Router } from 'express';
import booGenreRoute from './bookGenre.route';
import bookInstanceRoute from './bookInstance.route';
import bookRoute from './book.route';
import genreRoute from './genre.route';
import { Request, Response } from 'express';
const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index');
});
router.use('/author', authorRoute);
router.use('/book', bookRoute);
router.use('/bookGenre', booGenreRoute);
router.use('/bookInstance', bookInstanceRoute);
router.use('/genre', genreRoute);

export default router;
