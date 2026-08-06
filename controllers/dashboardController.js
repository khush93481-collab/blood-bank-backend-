const Camp = require('../models/campModel');
const Donor = require('../models/donorModel');
const EmergencyRequest = require('../models/emergencyRequestModel');
const VolunteerAssignment = require('../models/volunteerAssignmentModel');
const Donation = require('../models/donationModel');

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

    const donationAgg = await Donation.aggregate([
      { $group: { _id: null, totalUnits: { $sum: '$units' } } },
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
        totalDonations: donationAgg[0]?.totalUnits || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Camp Participation Statistics
exports.getCampParticipationStats = async (req, res, next) => {
  try {
    const CampRegistration = require('../models/campRegistrationModel');

    const camps = await Camp.find().select('name dateTime expectedDonors');

    const data = await Promise.all(
      camps.map(async (camp) => {
        const registeredCount = await CampRegistration.countDocuments({ camp: camp._id });
        const donatedCount = await CampRegistration.countDocuments({ camp: camp._id, status: 'donated' });
        const participationRate =
          camp.expectedDonors === 0 ? 0 : (registeredCount / camp.expectedDonors) * 100;

        return {
          name: camp.name,
          dateTime: camp.dateTime,
          expectedDonors: camp.expectedDonors,
          registeredCount,
          donatedCount,
          participationRate,
        };
      })
    );

    data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

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
    const monthlyReport = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' },
          },
          totalUnits: { $sum: '$units' },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);
    res.status(200).json({ success: true, data: monthlyReport });
  } catch (error) {
    next(error);
  }
};