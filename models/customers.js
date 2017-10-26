const Mongoose = require('mongoose');
const Schema = require('./schemas/customers');
const PhoneFormatter = require('phone-formatter');
const validator = require('validator');
const Users = require('./users');
const { Helpers } = require('../helpers');
const Errors = require('../config/errors');

// ***** Instance Methods *****
Schema.methods.update = async function(fields) {
  fields = _.pick(fields, ['firstName', 'lastName', 'phone', 'email']);
  if (fields.email)
    this.email = fields.email;
  if (fields.phone)
    this.phone = fields.phone;
  _.each(_.omit(fields, ['email', 'phone']), (value, field) => {
      this.profile[field] = value;
  })
  Users.findById(this.userId, (err, user) => {
    if (err) Errors.handle(err);
    user.update(fields, true)
    user.save();
  });
}

Schema.methods.addAddress = async function(newAddress) {
  const index = _.findIndex(this.addresses, (address) => {newAddress._id == address._id});
  if (index < 0) {
    if (this.address)
      this.addresses.push(newAddress);
    else
      this.addresses = [newAddress];
  }
}

// ***** Static Methods *****
Schema.statics.create = async function(params, creator) {
  // Clean up the inputs
  if (params.phone) params.phone = PhoneFormatter.normalize(params.phone);
  if (params.email) params.email = params.email.toLowerCase();
  if (!validator.isEmail(params.email + '')) params.email = undefined;
  if (!params.profile) params.profile = {};
  if (!(params.profile.firstName && params.profile.firstName.length)) params.profile.firstName = undefined;
  if (!(params.profile.lastName && params.profile.lastName.length)) params.profile.lastName = undefined;
  let customer = params;
  console.log('customer1:', customer);
  // Create customer model
  customer = new Customers(customer);
  if (creator) {
    customer.creatorId = creator._id;
    if (creator.sellerOptions && creator.sellerOptions.companyId)
      customer.companyId = creator.sellerOptions.companyId;
  }

  // Check to see if someone has a user account with that phone or email
  const query = Helpers.buildOrQuery(params, ['phone', 'email']);
  var user;
  if (query) {
    user = await Users.findOne(query).exec().catch((err) => Errors.handle(err));
    if (user) {
      // Attach userId to customer record and return
      customer.userId = user._id;
      customer.phone = customer.phone || user.phone;
      customer.email = customer.email || user.email;
      customer.profile.firstName = customer.profile.firstName || user.profile.firstName;
      customer.profile.lastName = customer.profile.lastName || user.profile.lastName;
    }
    else {
      // Create new user
      user = await Users.create({
        email: params.email,
        password: 'password',
        phone: params.phone,
        profile: params.profile
      }).catch((err) => Errors.handle(err));
      if (user)
        customer.userId = user._id;
    }
  }
  return await customer.save().catch((err) => Errors.handle(err));
}

const Customers = Mongoose.model('Customers', Schema);
module.exports = Customers;
