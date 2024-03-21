import express from 'express';
const router = express.Router();
import * as authorController from '../controller/author.controller';

router.get('/', authorController.createAuthor);
export default router;
