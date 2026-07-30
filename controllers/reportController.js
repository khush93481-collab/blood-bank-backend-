const Camp = require('../models/campModel');
const Donor = require('../models/donorModel');
const EmergencyRequest = require('../models/emergencyRequestModel');
const VolunteerAssignment = require('../models/volunteerAssignmentModel');

exports.getCampSummaryReport = async (req, res) => {
  try {
    const data = await Camp.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDonorReport = async (req, res) => {
  try {
    const data = await Donor.aggregate([
      { $group: { _id: '$eligibilityStatus', count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBloodGroupDistribution = async (req, res) => {
  try {
    const data = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmergencyRequestReport = async (req, res) => {
  try {
    const data = await EmergencyRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVolunteerAssignmentReport = async (req, res) => {
  try {
    const data = await VolunteerAssignment.aggregate([
      { $group: { _id: '$camp', count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyDonationReport = async (req, res) => {
  try {
    const data = await Camp.aggregate([
      { $unwind: '$registeredDonors' },
      { $match: { 'registeredDonors.status': 'donated' } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalDonations: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};