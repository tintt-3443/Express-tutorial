import express from 'express';
import * as authorController from '../controller/author.controller';

const router = express.Router();

router.get('/', authorController.authorList);
export default router;
