const EmergencyRequest = require('../models/emergencyRequestModel');
const Donor = require('../models/donorModel');

// Submit an emergency blood request (any logged-in user - patient/hospital)
exports.createEmergencyRequest = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.create({
      ...req.body,
      requestedBy: req.user.id,
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// Get all emergency requests (Admin) - optional status filter
exports.getAllEmergencyRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;

    const requests = await EmergencyRequest.find(filter)
      .populate('requestedBy', 'name email phone')
      .populate('connectedDonors.donor');

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get single emergency request by ID
exports.getEmergencyRequestById = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('connectedDonors.donor');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// Find eligible nearby donors matching the request's blood group (Admin)
exports.findMatchingDonors = async (req, res, next) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const matchingDonors = await Donor.find({
      bloodGroup: request.bloodGroup,
      eligibilityStatus: 'Eligible',
    }).populate('user', 'name email phone');

    res.status(200).json({ success: true, count: matchingDonors.length, data: matchingDonors });
  } catch (error) {
    next(error);
  }
};

// Connect a donor to an emergency request (Admin)
exports.connectDonor = async (req, res, next) => {
  try {
    const { donorId } = req.body;

    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    const request = await EmergencyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const alreadyConnected = request.connectedDonors.some(
      (c) => c.donor.toString() === donorId
    );
    if (alreadyConnected) {
      return res.status(400).json({ success: false, message: 'Donor already connected to this request' });
    }

    request.connectedDonors.push({ donor: donorId });
    if (request.status === 'Pending') request.status = 'In Progress';
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// Update request status (Admin) - e.g. mark as Fulfilled or Closed
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    const request = await EmergencyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (status) request.status = status;
    if (adminRemarks !== undefined) request.adminRemarks = adminRemarks;
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};