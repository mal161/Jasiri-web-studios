const { z } = require('zod');

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  category_id: z.coerce.number().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable()
});

module.exports = { postSchema };
