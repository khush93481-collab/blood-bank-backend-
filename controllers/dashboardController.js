const Camp = require('../models/campModel');
const Donor = require('../models/donorModel');
const EmergencyRequest = require('../models/emergencyRequestModel');
const VolunteerAssignment = require('../models/volunteerAssignmentModel');

// Main dashboard summary
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalCamps,
      upcomingCamps,
      activeCamps,
      completedCamps,
      totalDonors,
      activeDonors,
      emergencyRequestsCount,
    ] = await Promise.all([
      Camp.countDocuments(),
      Camp.countDocuments({ status: 'Approved', dateTime: { $gte: now } }),
      Camp.countDocuments({ status: 'Active' }),
      Camp.countDocuments({ status: 'Completed' }),
      Donor.countDocuments(),
      Donor.countDocuments({ eligibilityStatus: 'Eligible' }),
      EmergencyRequest.countDocuments({ status: 'Pending' }),
    ]);

    const donationAgg = await Camp.aggregate([
      { $unwind: '$registeredDonors' },
      { $match: { 'registeredDonors.status': 'donated' } },
      { $count: 'totalDonations' },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCamps,
        upcomingCamps,
        activeCamps,
        completedCamps,
        totalDonors,
        activeDonors,
        emergencyRequestsCount,
        totalDonations: donationAgg[0]?.totalDonations || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Camp Participation Statistics
exports.getCampParticipationStats = async (req, res, next) => {
  try {
    const data = await Camp.aggregate([
      {
        $project: {
          name: 1,
          dateTime: 1,
          expectedDonors: 1,
          registeredCount: { $size: { $ifNull: ['$registeredDonors', []] } },
          donatedCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$registeredDonors', []] },
                as: 'd',
                cond: { $eq: ['$$d.status', 'donated'] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          participationRate: {
            $cond: [
              { $eq: ['$expectedDonors', 0] },
              0,
              { $multiply: [{ $divide: ['$registeredCount', '$expectedDonors'] }, 100] },
            ],
          },
        },
      },
      { $sort: { dateTime: -1 } },
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Camp Summary Report
exports.getCampSummaryReport = async (req, res, next) => {
  try {
    const camps = await Camp.find()
      .populate('organizer', 'name email')
      .select('name dateTime venue status expectedDonors bloodGroupsRequired');
    res.status(200).json({ success: true, count: camps.length, data: camps });
  } catch (error) {
    next(error);
  }
};

// Donor Report
exports.getDonorReport = async (req, res, next) => {
  try {
    const donors = await Donor.find()
      .populate('user', 'name email phone')
      .select('bloodGroup eligibilityStatus age gender address donationHistory');
    res.status(200).json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    next(error);
  }
};

// Blood Group Distribution
exports.getBloodGroupDistribution = async (req, res, next) => {
  try {
    const distribution = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: distribution });
  } catch (error) {
    next(error);
  }
};

// Emergency Request Report
exports.getEmergencyRequestReport = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate('requestedBy', 'name email')
      .select('bloodGroup unitsRequired hospitalName urgency status createdAt');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// Volunteer Assignment Report
exports.getVolunteerAssignmentReport = async (req, res, next) => {
  try {
    const assignments = await VolunteerAssignment.find()
      .populate('volunteer', 'name email')
      .populate('camp', 'name dateTime status');
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

// Monthly Donation Report
exports.getMonthlyDonationReport = async (req, res, next) => {
  try {
    const monthlyReport = await Camp.aggregate([
      { $unwind: '$registeredDonors' },
      { $match: { 'registeredDonors.status': 'donated' } },
      {
        $group: {
          _id: {
            year: { $year: '$registeredDonors.registeredAt' },
            month: { $month: '$registeredDonors.registeredAt' },
          },
          totalDonations: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);
    res.status(200).json({ success: true, data: monthlyReport });
  } catch (error) {
    next(error);
  }
};