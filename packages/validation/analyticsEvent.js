const { z } = require("zod");

const analyticsEventSchema = z.object({
  event_name: z.string().min(1, "Event name is required"),
  page: z.string().optional(),
  project_id: z.number().optional(),
  session_id: z.string().optional(),
  user_id: z.string().optional(),
  referrer: z.string().optional(),
  device_type: z.string().optional(),
  browser: z.string().optional(),
  operating_system: z.string().optional(),
  country: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

module.exports = { analyticsEventSchema };