const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

module.exports = new Mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
  },
  emailVerified: { type: Boolean },
  emailVerificationToken: { type: String },
  phone: { type: String },
  phoneVerified: { type: Boolean },
  phoneVerificationToken: { type: String },
  password: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true,
    default: 'basic'
  },
  terms: {
    type: String
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String, default: 'https://s3.amazonaws.com/pourpal/avatars/avatar.png' },
  },
  cards: {
    type: [Schema.Types.Mixed],
    default: []
  },
  addresses: {type: Array, default: []},
  sellerOptions: {
    companyId: { type: String },
    customerConfirm: { type: Boolean },
    sellerConfirm: { type: Boolean },
    sellerConfirmEmail: { type: String },
  },
  stripe: {
    connectId: { type: String },
    customerId: { type: String },
    subscriptionId: { type: String },
    lastFour: { type: String },
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
},
  {
    timestamps: true
  });
