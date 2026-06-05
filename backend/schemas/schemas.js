import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  token: z.string().max(10).optional().or(z.literal("")),
});

export const postSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  category: z.string().min(2).max(50).default("News"),
  excerpt: z.string().max(300).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  imagePublicId: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional().default("published"),
});

export const videoSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  category: z.string().min(2).max(50).default("Video"),
  platform: z.string().min(2).max(50).default("Other"),
  url: z.string().url("Valid URL is required"),
  thumbnail: z.string().optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional().default("published"),
});

export const settingsSchema = z.object({
  brandName: z.string().min(2).max(100).optional(),
  tagline: z.string().max(200).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  whatsappLink: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  youtube: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  aboutHeroImage: z.string().optional().or(z.literal("")),
  aboutPortraitImage: z.string().optional().or(z.literal("")),
  aboutFeaturedImage: z.string().optional().or(z.literal("")),
  donationCurrencies: z.array(z.enum(["USD", "CAD", "THB"])).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const donationSchema = z.object({
  donorName: z.string().min(2).max(100).optional().or(z.literal("")),
  donorEmail: z.string().email().optional().or(z.literal("")),
  currency: z.enum(["USD", "CAD", "THB"]),
  amount: z.number().min(1).max(100000),
});

export const subscriptionSchema = z.object({
  plan: z.enum(["images", "videos"]),
  subscriberName: z.string().min(2).max(100).optional().or(z.literal("")),
  subscriberEmail: z.string().email().optional().or(z.literal("")),
});

export const premiumContentSchema = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(["image", "video", "link"]),
  accessPlan: z.enum(["images", "videos"]),
  url: z.string().url("Valid URL is required"),
  thumbnail: z.string().optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).optional().default("published"),
});