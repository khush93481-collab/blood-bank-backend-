const mongoose = require('mongoose');

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Camp name is required'],
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Camp date and time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    expectedDonors: {
      type: Number,
      default: 0,
    },
    bloodGroupsRequired: {
      type: [String],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: [],
    },
    description: {
      type: String,
    },
    contactDetails: {
      phone: { type: String },
      email: { type: String },
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Pending Approval',
        'Approved',
        'Rejected',
        'Active',
        'Completed',
        'Cancelled',
      ],
      default: 'Draft',
    },
    approvalRemarks: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Camp', campSchema);