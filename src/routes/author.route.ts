import express from 'express';
import * as authorController from '../controller/author.controller';

const router = express.Router();

router.get('/', authorController.authorList);
router.get('/:id', authorController.authorDetail);
export default router;
