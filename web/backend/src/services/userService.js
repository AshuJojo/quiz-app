// src/services/userService.js
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (userData) => {
  const { email, password, name } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

exports.getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

exports.getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.updateUser = async (id, updateData) => {
  // Check if user exists
  await this.getUserById(id);

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

exports.deleteUser = async (id) => {
  // Check if user exists
  await this.getUserById(id);

  await prisma.user.delete({
    where: { id },
  });

  return { message: 'User deleted successfully' };
};

exports.deleteUsers = async (data) => {
  const { ids, all } = data;

  let where = {};
  if (ids && ids.length > 0) {
    try {
      // Verify all IDs exists to provide the specific "Invalid user ids" error
      const existingCount = await prisma.user.count({
        where: { id: { in: ids } },
      });

      if (existingCount !== ids.length) {
        const error = new Error('Invalid user ids');
        error.statusCode = 400;
        throw error;
      }
      where = { id: { in: ids } };
    } catch (error) {
      if (error.statusCode === 400) throw error;

      // Catch malformed ID errors from Prisma
      const customError = new Error('Invalid user ids');
      customError.statusCode = 400;
      throw customError;
    }
  } else if (all === true) {
    where = {};
  } else {
    throw new Error('No deletion criteria provided');
  }

  const { count } = await prisma.user.deleteMany({ where });
  return { count, message: `Users deleted successfully` };
};
