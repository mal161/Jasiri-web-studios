const { z } = require("zod");

const quoteSchema = z.object({
  quote_number: z.string().min(1, "Quote number is required"),
  lead_id: z.coerce.number().int().optional(),
  client_id: z.coerce.number().int().optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).default("DRAFT"),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    category: z.string().optional(),
    quantity: z.number().default(1),
    unit_price: z.number().default(0),
    total_price: z.number().default(0),
  })).optional(),
});

module.exports = { quoteSchema };