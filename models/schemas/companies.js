const Mongoose = require('mongoose')

module.exports = new Mongoose.Schema({
  name: {
		type: String,
		required: false,
	},
  description: {
		type: String,
		required: false,
	},
  website: {
    type: String,
    required: false
  }
}, { timestamps: true })
