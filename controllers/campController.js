const Camp = require('../models/campModel');

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