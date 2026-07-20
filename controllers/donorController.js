const Donor = require('../models/donorModel');

exports.createDonorProfile = async (req, res, next) => {
  try {
    const existing = await Donor.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Donor profile already exists for this user' });
    }

    const donor = await Donor.create({ ...req.body, user: req.user.id });
    donor.calculateEligibility();
    await donor.save();

    res.status(201).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

exports.getMyDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id }).populate('user', 'name email phone');
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

exports.updateMyDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });

    Object.assign(donor, req.body);
    donor.calculateEligibility();
    await donor.save();

    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

exports.getAllDonors = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.eligibilityStatus) filter.eligibilityStatus = req.query.eligibilityStatus;
    if (req.query.address) filter.address = { $regex: req.query.address, $options: 'i' };

    const donors = await Donor.find(filter).populate('user', 'name email phone');
    res.status(200).json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    next(error);
  }
};

exports.getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id).populate('user', 'name email phone');
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.status(200).json({ success: true, data: donor });
  } catch (error) {
    next(error);
  }
};

exports.deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.status(200).json({ success: true, message: 'Donor profile deleted' });
  } catch (error) {
    next(error);
  }
};
