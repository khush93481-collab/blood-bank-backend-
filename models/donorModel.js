const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 18,
      max: 65,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    weight: {
      type: Number,
    },
    bloodPressure: {
      type: String,
    },
    hemoglobinLevel: {
      type: Number,
    },
    lastDonationDate: {
      type: Date,
    },
    existingMedicalConditions: {
      type: String,
      default: 'None',
    },
    eligibilityStatus: {
      type: String,
      enum: ['Eligible', 'Not Eligible', 'Pending Review'],
      default: 'Pending Review',
    },
    donationHistory: [
      {
        camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
        date: { type: Date },
        units: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

donorSchema.methods.calculateEligibility = function () {
  const today = new Date();
  let eligible = true;

  if (this.hemoglobinLevel && this.hemoglobinLevel < 12.5) eligible = false;
  if (this.weight && this.weight < 50) eligible = false;

  if (this.lastDonationDate) {
    const daysSinceLastDonation = (today - this.lastDonationDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLastDonation < 90) eligible = false;
  }

  this.eligibilityStatus = eligible ? 'Eligible' : 'Not Eligible';
  return this.eligibilityStatus;
};

module.exports = mongoose.model('Donor', donorSchema);