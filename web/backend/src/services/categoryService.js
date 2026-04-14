const prisma = require('../config/db');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

exports.getCategories = async (parentId) => {
  const where = {};

  // If parentId is provided (even as "null" string), we filter.
  // If it is undefined (missing from query), we fetch all.
  if (parentId !== undefined) {
    if (parentId === 'null' || parentId === 'undefined' || parentId === '') {
      where.parentId = null;
    } else {
      where.parentId = parentId;
    }
  }

  return await prisma.category.findMany({
    where,
    include: {
      _count: {
        select: {
          children: true,
          papers: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

exports.getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      children: {
        include: {
          _count: {
            select: { children: true, papers: true },
          },
        },
      },
      _count: {
        select: { papers: true },
      },
    },
  });
};

exports.createCategory = async (data) => {
  let slug = data.slug || slugify(data.name);

  // Check if slug exists, if so, append unique suffix
  const existingSlug = await prisma.category.findUnique({ where: { slug } });
  if (existingSlug) {
    const uniqueSuffix = Math.floor(100 + Math.random() * 900); // Simple 3-digit suffix
    slug = `${slug}-${uniqueSuffix}`;
  }

  // Validate parentId if provided
  if (data.parentId) {
    const parentExists = await prisma.category.findUnique({
      where: { id: data.parentId },
    });
    if (!parentExists) {
      throw new Error(`Parent category not found: ${data.parentId}`);
    }
  }

  return await prisma.category.create({
    data: {
      ...data,
      slug,
    },
  });
};

exports.updateCategory = async (id, data) => {
  // Check if category exists
  const targetCategory = await prisma.category.findUnique({ where: { id } });
  if (!targetCategory) {
    throw new Error('Category not found');
  }

  // Prevent simple self-reference loop

  if (data.parentId === id) {
    throw new Error('A category cannot be its own parent');
  }

  // Only handle slug if it's explicitly provided in the patch data
  if (data.slug) {
    const existingSlug = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        NOT: { id }, // Don't match itself
      },
    });
    if (existingSlug) {
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      data.slug = `${data.slug}-${uniqueSuffix}`;
    }
  }

  // Validate parentId if provided
  if (data.parentId) {
    const parentExists = await prisma.category.findUnique({
      where: { id: data.parentId },
    });
    if (!parentExists) {
      throw new Error(`Parent category not found: ${data.parentId}`);
    }
  }

  return await prisma.category.update({
    where: { id },
    data,
  });
};

exports.deleteCategory = async (id) => {
  // Check if it has children or papers
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { children: true, papers: true },
      },
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  if (category._count.children > 0) {
    throw new Error('Cannot delete category with sub-categories. Delete sub-categories first.');
  }

  if (category._count.papers > 0) {
    throw new Error('Cannot delete category with associated papers.');
  }

  return await prisma.category.delete({
    where: { id },
  });
};
