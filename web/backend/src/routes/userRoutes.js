// src/routes/userRoutes.js
const { Router } = require('express');
const userController = require('../controllers/userController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  deleteUsersSchema,
} = require('../schemas/userSchema');

const router = Router();

router.post('/', validateRequest(createUserSchema), userController.createUser);
router.get('/', userController.getUser);
router.get('/:id', validateRequest(userIdParamsSchema), userController.getUser);
router.patch('/:id', validateRequest(updateUserSchema), userController.updateUser);
router.delete('/', validateRequest(deleteUsersSchema), userController.deleteUsers);
router.delete('/:id', validateRequest(userIdParamsSchema), userController.deleteUser);

module.exports = router;
