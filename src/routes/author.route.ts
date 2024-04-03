import express from 'express';
import * as authorController from '../controller/author.controller';

const router = express.Router();
router.get('/update/:id', authorController.authorUpdateGet);
router.post('/update/:id', authorController.authorUpdatePost);
router.get('/create', authorController.authorCreateGet);
router.post('/add', authorController.postAuthorCreateForm);
router.get('/delete/:id', authorController.authorDeleteGet);
router.post('/remove/:id', authorController.authorDeletePost);
router.get('/:id', authorController.authorDetail);
router.get('/', authorController.authorList);
export default router;
