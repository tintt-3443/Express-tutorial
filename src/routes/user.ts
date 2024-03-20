import express from 'express';
const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.send('user router1');
});

export default userRouter;
