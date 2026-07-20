const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String },
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Fulfilled', 'Closed'],
      default: 'Pending',
    },
    connectedDonors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
        connectedAt: { type: Date, default: Date.now },
      },
    ],
    adminRemarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);