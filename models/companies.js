const Mongoose = require('mongoose');
const Schema = require('./schemas/companies');

// ***** Static Methods *****
Schema.statics.create = async function(params) {
  let company = new Companies(params);
  return await company.save();
}

const Companies = Mongoose.model('Companies', Schema);
module.exports = Companies;
