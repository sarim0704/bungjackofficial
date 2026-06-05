import Post from '../models/Post.js';
import Video from '../models/Video.js';
import Donation from '../models/Donation.js';
import ContactMessage from '../models/ContactMessage.js';
import Subscription from '../models/Subscription.js';
import PremiumContent from '../models/PremiumContent.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalPosts,
    totalVideos,
    totalDonations,
    paidDonations,
    unreadMessages,
    activeSubscriptions,
    premiumItems,
    recentPosts,
    recentVideos,
    recentMessages,
  ] = await Promise.all([
    Post.countDocuments(),
    Video.countDocuments(),
    Donation.countDocuments(),
    Donation.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    ContactMessage.countDocuments({ isRead: false }),
    Subscription.countDocuments({ status: 'active' }),
    PremiumContent.countDocuments(),
    Post.find().sort({ createdAt: -1 }).limit(5),
    Video.find().sort({ createdAt: -1 }).limit(5),
    ContactMessage.find().sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    stats: {
      totalPosts,
      totalVideos,
      totalDonations,
      paidDonations,
      unreadMessages,
      activeSubscriptions,
      premiumItems,
    },
    recent: {
      posts: recentPosts,
      videos: recentVideos,
      messages: recentMessages,
    },
  });
});
