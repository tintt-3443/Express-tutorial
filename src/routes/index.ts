import express, { Request, Response } from 'express';
import userRouter from './user';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index', { title: 'Express' });
});

router.use('/user', userRouter);

export default router;
