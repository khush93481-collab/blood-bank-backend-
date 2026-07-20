const mongoose = require('mongoose');

const volunteerAssignmentSchema = new mongoose.Schema(
  {
    camp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    responsibility: {
      type: String,
      required: [true, 'Responsibility is required'],
      trim: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Prevent the same volunteer being assigned twice to the same camp
volunteerAssignmentSchema.index({ camp: 1, volunteer: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerAssignment', volunteerAssignmentSchema);