import express from 'express';
import { UsersController } from '../../controllers/UsersController.js';

const router = express.Router();

router.get('/', UsersController.list);
router.post('/', UsersController.create);
router.put('/:id', UsersController.update);

export default router;
