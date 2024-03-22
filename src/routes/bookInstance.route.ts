import express from 'express';
import * as bookInstanceController from '../controller/bookInstance.controller';
const router = express.Router();

router.get('/', bookInstanceController.bookIStanceList);
export default router;
