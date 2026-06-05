import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';

export const createContactMessage = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.create({ ...req.body, ipAddress: req.ip });

  const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (notifyEmail) {
    try {
      await sendEmail({
        to: notifyEmail,
        subject: `New BungJack Contact: ${contact.subject}`,
        text: `${contact.name} (${contact.email}) wrote:\n\n${contact.message}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${contact.message}</p>
        `,
      });
    } catch (error) {
      console.warn(`Contact notification skipped: ${error.message}`);
    }
  }

  res.status(201).json({ success: true, message: 'Message sent successfully.' });
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filters = {};
  if (req.query.isRead !== undefined) filters.isRead = req.query.isRead === 'true';

  const [items, total] = await Promise.all([
    ContactMessage.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(filters),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

export const markContactMessageRead = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!message) return res.status(404).json({ error: 'Message not found.' });
  res.json(message);
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found.' });
  res.json({ success: true });
});
