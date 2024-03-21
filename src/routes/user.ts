import express from 'express';
const userRouter = express.Router();

userRouter.get('/', (_, res) => {
  res.send('user router');
});

export default userRouter;
