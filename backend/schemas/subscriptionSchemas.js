import { z } from 'zod';

export const subscriptionCheckoutSchema = z.object({
  subscriberName: z.string().min(2).max(100).optional().or(z.literal('')),
  subscriberEmail: z.string().email(),
  plan: z.enum(['images', 'videos']),
});

export const premiumContentSchema = z.object({
  title: z.string().min(3).max(200),
  type: z.enum(['image', 'video', 'link']),
  plan: z.enum(['images', 'videos']),
  url: z.string().url(),
  thumbnail: z.string().url().optional().or(z.literal('')).default(''),
  description: z.string().max(800).optional().default(''),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  featured: z.boolean().optional().default(false),
});
