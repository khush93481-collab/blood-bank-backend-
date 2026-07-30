const Camp = require('../models/campModel');
const Donor = require('../models/donorModel');
const { calculateDistance } = require('../utils/geoUtils');
const { createNotification } = require('./notificationController');

exports.createCamp = async (req, res, next) => {
  try {
    const camp = await Camp.create({ ...req.body, organizer: req.user.id });
    res.status(201).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.getAllCamps = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const camps = await Camp.find(filter).populate('organizer', 'name email');
    res.status(200).json({ success: true, count: camps.length, data: camps });
  } catch (error) {
    next(error);
  }
};

exports.getCampById = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id).populate('organizer', 'name email');
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.updateCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.deleteCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findByIdAndDelete(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.status(200).json({ success: true, message: 'Camp deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.submitForApproval = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'Draft')
      return res.status(400).json({ success: false, message: 'Only Draft camps can be submitted for approval' });
    camp.status = 'Pending Approval';
    await camp.save();
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.approveCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'Pending Approval')
      return res.status(400).json({ success: false, message: 'Only camps pending approval can be approved' });
    camp.status = 'Approved';
    camp.approvedBy = req.user.id;
    camp.approvalRemarks = req.body.remarks || '';
    await camp.save();

    // Notify eligible donors matching this camp's required blood groups, within 50km if location data exists
    const eligibleDonors = await Donor.find({
      bloodGroup: { $in: camp.bloodGroupsRequired },
      eligibilityStatus: 'Eligible',
    });

    const NOTIFICATION_RADIUS_KM = 50;

    for (const donor of eligibleDonors) {
      let withinRadius = true;

      if (camp.location?.lat && camp.location?.lng && donor.location?.lat && donor.location?.lng) {
        const distance = calculateDistance(
          camp.location.lat,
          camp.location.lng,
          donor.location.lat,
          donor.location.lng
        );
        withinRadius = distance !== null && distance <= NOTIFICATION_RADIUS_KM;
      }

      if (withinRadius) {
        await createNotification({
          userId: donor.user,
          type: 'Camp',
          message: `A new blood donation camp "${camp.name}" has been approved near you on ${new Date(camp.dateTime).toDateString()}. Your blood group is needed!`,
          relatedId: camp._id,
        });
      }
    }

    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.rejectCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'Pending Approval')
      return res.status(400).json({ success: false, message: 'Only camps pending approval can be rejected' });
    camp.status = 'Rejected';
    camp.approvedBy = req.user.id;
    camp.approvalRemarks = req.body.remarks || '';
    await camp.save();
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.activateCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'Approved')
      return res.status(400).json({ success: false, message: 'Only Approved camps can be activated' });
    camp.status = 'Active';
    await camp.save();
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.completeCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'Active')
      return res.status(400).json({ success: false, message: 'Only Active camps can be marked Completed' });
    camp.status = 'Completed';
    await camp.save();
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.cancelCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    camp.status = 'Cancelled';
    await camp.save();
    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

exports.sendCampReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingCamps = await Camp.find({
      status: { $in: ['Approved', 'Active'] },
      dateTime: { $gte: now, $lte: threeDaysLater },
    });

    let remindersSent = 0;
    const NOTIFICATION_RADIUS_KM = 50;

    for (const camp of upcomingCamps) {
      const eligibleDonors = await Donor.find({
        bloodGroup: { $in: camp.bloodGroupsRequired },
        eligibilityStatus: 'Eligible',
      });

      for (const donor of eligibleDonors) {
        let withinRadius = true;

        if (camp.location?.lat && camp.location?.lng && donor.location?.lat && donor.location?.lng) {
          const distance = calculateDistance(
            camp.location.lat,
            camp.location.lng,
            donor.location.lat,
            donor.location.lng
          );
          withinRadius = distance !== null && distance <= NOTIFICATION_RADIUS_KM;
        }

        if (withinRadius) {
          await createNotification({
            userId: donor.user,
            type: 'Camp',
            message: `Reminder: The blood donation camp "${camp.name}" is coming up on ${new Date(camp.dateTime).toDateString()} at ${camp.venue}. Don't forget to donate!`,
            relatedId: camp._id,
          });
          remindersSent++;
        }
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
// Donor registers themselves for a camp
exports.registerForCamp = async (req, res, next) => {
  try {
    const Donor = require('../models/donorModel');
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) return res.status(400).json({ success: false, message: 'You must have a donor profile to register' });

    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    const alreadyRegistered = camp.registeredDonors.some((r) => r.donor.toString() === donor._id.toString());
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered for this camp' });
    }

    camp.registeredDonors.push({ donor: donor._id });
    await camp.save();

    res.status(201).json({ success: true, message: 'Registered for camp successfully' });
  } catch (error) {
    next(error);
  }
};

// View registered donors for a camp (Admin/Organizer)
exports.getCampRegisteredDonors = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id).populate({
      path: 'registeredDonors.donor',
      populate: { path: 'user', select: 'name email phone' },
    });
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    res.status(200).json({ success: true, count: camp.registeredDonors.length, data: camp.registeredDonors });
  } catch (error) {
    next(error);
  }
};

// Update a registered donor's attendance/donation status (Admin/Organizer)
exports.updateDonorAttendance = async (req, res, next) => {
  try {
    const { status } = req.body; // 'attended', 'donated', 'no-show'
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    const entry = camp.registeredDonors.find((r) => r.donor.toString() === req.params.donorId);
    if (!entry) return res.status(404).json({ success: false, message: 'Donor registration not found for this camp' });

    entry.status = status;
    await camp.save();

    res.status(200).json({ success: true, message: 'Attendance updated', data: entry });
  } catch (error) {
    next(error);
  }
};