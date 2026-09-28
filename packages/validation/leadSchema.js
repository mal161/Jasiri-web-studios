const { z } = require("zod");

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(["WEBSITE", "REFERRAL", "SOCIAL", "EVENT", "OTHER"]).optional(),
  service_interest: z.string().optional(),
  budget: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "CONVERTED", "LOST"]).default("NEW"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional(),
});

module.exports = { leadSchema };