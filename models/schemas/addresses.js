const Mongoose = require('mongoose')

module.exports = new Mongoose.Schema({
  userId: {
    type: String,
  },
  name: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
})
