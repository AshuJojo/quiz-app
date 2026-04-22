const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// Named function so other functions in this module can call it directly
// without relying on `this` (which is unreliable in arrow-function exports)
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

exports.getUserById = getUserById;

exports.createUser = async (userData) => {
  const { email, password, name } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('User with this email already exists');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({ data: { email, name, password: hashedPassword } });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

exports.getUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });
};

exports.updateUser = async (id, updateData) => {
  await getUserById(id);

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await prisma.user.update({ where: { id }, data: updateData });
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

exports.deleteUser = async (id) => {
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
  return { message: 'User deleted successfully' };
};

exports.deleteUsers = async (data) => {
  const { ids, all } = data;

  let where = {};

  if (ids && ids.length > 0) {
    const existingCount = await prisma.user.count({ where: { id: { in: ids } } });
    if (existingCount !== ids.length) {
      const err = new Error('One or more user IDs are invalid');
      err.statusCode = 400;
      throw err;
    }
    where = { id: { in: ids } };
  } else if (all === true) {
    where = {};
  } else {
    const err = new Error('Must provide an array of IDs or set all: true');
    err.statusCode = 400;
    throw err;
  }

  const { count } = await prisma.user.deleteMany({ where });
  return { count, message: 'Users deleted successfully' };
};
