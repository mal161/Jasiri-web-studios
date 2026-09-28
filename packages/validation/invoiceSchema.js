const { z } = require("zod");

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  client_id: z.coerce.number().int().optional(),
  project_id: z.coerce.number().int().optional(),
  subtotal: z.number().default(0),
  tax: z.number().default(0),
  discount: z.number().default(0),
  total: z.number().default(0),
  currency: z.string().default("KES"),
  status: z.enum(["DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"]).default("DRAFT"),
  due_date: z.string().optional(),
  issued_date: z.string().default(new Date().toISOString().split("T")[0]),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().default(1),
    unit_price: z.number().default(0),
    total_price: z.number().default(0),
  })).optional(),
});

module.exports = { invoiceSchema };