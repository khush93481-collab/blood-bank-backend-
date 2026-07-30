const Notification = require('../models/notificationModel');
const Donor = require('../models/donorModel');
const Camp = require('../models/campModel');

// Get logged-in user's notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Mark a single notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// Internal helper (used by other controllers, not exposed as a route)
exports.createNotification = async ({ userId, type, message, relatedId }) => {
  try {
    await Notification.create({ user: userId, type, message, relatedId });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};
// Trigger pre-camp reminders for camps happening in the next N days
// SuperAdmin/OrgAdmin manually triggers this (simulates a scheduled cron job)
exports.sendCampReminders = async (req, res, next) => {
  try {
    const daysAhead = Number(req.body.daysAhead) || 2; // default: remind 2 days before

    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysAhead);

    const upcomingCamps = await Camp.find({
      date: { $gte: now, $lte: targetDate },
      status: { $in: ['Approved', 'Active'] },
    });

    if (!upcomingCamps.length) {
      return res.status(200).json({ success: true, message: 'No upcoming camps in the reminder window', remindersSent: 0 });
    }

    let remindersSent = 0;

    for (const camp of upcomingCamps) {
      const registeredDonorIds = (camp.registeredDonors || []).map((d) => d.donorId || d);

      if (!registeredDonorIds.length) continue;

      const donors = await Donor.find({ _id: { $in: registeredDonorIds } });

      for (const donor of donors) {
        await exports.createNotification({
          userId: donor._id,
          type: 'CampReminder',
          message: `Reminder: your registered camp "${camp.campName}" is happening on ${camp.date.toDateString()} at ${camp.venue}.`,
          relatedId: camp._id,
        });
        remindersSent++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Reminders sent for ${upcomingCamps.length} upcoming camp(s)`,
      remindersSent,
    });
  } catch (error) {
    next(error);
  }
};