const mongoose = require('mongoose');

const campRegistrationSchema = new mongoose.Schema(
  {
    camp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'donated', 'no-show'],
      default: 'registered',
    },
  },
  { timestamps: true }
);

// Prevent duplicate registration of the same donor to the same camp
campRegistrationSchema.index({ camp: 1, donor: 1 }, { unique: true });

module.exports = mongoose.model('CampRegistration', campRegistrationSchema);