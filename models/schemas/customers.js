const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

module.exports = new Mongoose.Schema({
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String, default: 'https://s3.amazonaws.com/pourpal/avatars/avatar.png' },
  },
	userId: {
		type: String,
	},
	addresses: {type: Array, default: []},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	notes: {
		type: String,
	},
	companyId: {
    type: String,
  },
	creatorId: {
		type: String,
		denyUpdate: true,
	},
}, { timestamps: true })
