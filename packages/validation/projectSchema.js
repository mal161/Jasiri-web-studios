const { z } = require("zod");

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  category_id: z.coerce.number().int().optional(),
  status: z.enum(["IN_PROGRESS", "LIVE", "COMPLETED", "ARCHIVED"]).default("COMPLETED"),
  featured: z.boolean().default(false),
  technologies: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  live_url: z.string().url("Valid URL required").optional(),
  github_url: z.string().url("Valid URL required").optional(),
  client: z.string().min(1, "Client is required"),
  problem: z.string().optional(),
  solution: z.string().optional(),
  process: z.string().optional(),
  results: z.string().optional(),
  metrics: z.string().optional(),
});

module.exports = { projectSchema };