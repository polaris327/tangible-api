const Mongoose = require('mongoose');
const Schema = require('./schemas/activities');
const Errors = require('../config/errors');
const axios = require('axios');

// ***** Static Methods *****
Schema.statics.create = async function(params, creator) {
  let activity = new Activities(params);
  activity.userId = creator && creator._id;
  if (activity.ip) {
    const location = await axios.get('http://freegeoip.net/json/' + activity.ip).catch((err) => Errors.handle(err));
    if (location)
      activity.location = location;
  }
  if (creator && creator.sellerOptions && creator.sellerOptions.companyId)
    activity.companyId = creator.sellerOptions.companyId;
  return await activity.save().catch((err) => Errors.handle(err));
}

const Activities = Mongoose.model('Activities', Schema);
module.exports = Activities;
