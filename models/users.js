const Mongoose = require('mongoose');
const Schema = require('./schemas/users');
const Companies = require('./companies');
const Payments = require('./payments');
const { Auth } = require('../helpers');
const stripePrivateApiKey = require('../config/main').stripePrivateApiKey;
const Stripe = require('stripe')(stripePrivateApiKey);
const bcrypt = require('bcrypt-nodejs');
const Errors = require('../config/errors');

// ***** Instance Methods *****

Schema.methods.update = async function(params, missing) {
  if (params.email && (!missing || !this.email))
    this.email = params.email;
  if (params.phone && (!missing || !this.email))
    this.phone = params.phone;
  if (params.addresses)
    this.addresses = params.addresses;
  _.each(_.omit(params, ['email', 'password', 'phone', 'addresses']), (value, field) => {
    if (!missing || !this.profile[field])
      this.profile[field] = value;
  })
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

Schema.methods.getCompany = async function() {
  if (!(this.sellerOptions && this.sellerOptions.companyId)) return null;
  return await Companies.findById(this.sellerOptions.companyId).exec();
}

Schema.methods.getCards = function() {
  return new Promise((resolve, reject) => {
    if (!this.stripe.customerId) return resolve([]);
    Stripe.customers.listCards(this.stripe.customerId, (err, cards) => {
      if (err) reject(err)
      cards = _.map(cards && cards.data, (card, i) => {
          return {id: card.id, last4: card.last4, brand: card.brand}
      });
      resolve(cards)
    });
  });
}

Schema.methods.removeCard = function(cardId) {
  Stripe.customers.deleteCard(this.stripe.customerId, cardId, (err, cards) => {
  });
  this.cards = _.reject(this.cards, (card) => {console.log(card.id); return card.id == cardId});
}

Schema.methods.addCard = function(token) {
  console.log('Saving token as new source');
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV == 'test' && !process.env.TEST_STRIPE)
      resolve({id: '123'});
    else
      Stripe.customers.createSource(this.stripe.customerId, {source: token }, (err, stripeCard) => {
        if (err) reject(err)
        const card = _.pick(stripeCard, ['last4', 'brand', 'id'])
        this.cards.push(card);
        resolve(card);
      });
  })
}

Schema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return cb(err); }
    cb(null, isMatch);
  });
}

Schema.methods.changePassword = async function(password, reset) {
  this.password = Auth.generateHash(password);
  if (reset) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }
}

Schema.methods.forgotPassword = async function() {
  let resetToken = await Auth.generateToken();
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  this.save((err, user) => {
    if (err) console.log(err);
    const link = config.adminBaseUrl + '/reset-password/' + resetToken;
    Messages.Emails.sendResetPassword(this, link);
  });
}

Schema.methods.addCompany = async function(companyId) {
  if (this.sellerOptions)
    this.sellerOptions.companyId = companyId;
  else
    this.sellerOptions = { companyId: companyId, customerConfirm: true, sellerConfirm: true };
}

Schema.methods.removeCompany = async function(companyId) {
  if (this.sellerOptions)
    this.sellerOptions.companyId = undefined;
}

// Static methods
Schema.statics.create = async function(params) {
  let user = new Users(params);
  // If test, then set temp stripe id string
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_STRIPE) {
    user.stripe = { customerId: 'StripeID123' };
    user.password = await Auth.generateHash(user.password);
  }
  else {
    user.password = await Auth.generateHash(user.password);
    const stripeCustomer = await Payments.createCustomer().catch((err) => Errors.handle(err));
    if (stripeCustomer)
      user.stripe = { customerId: stripeCustomer.id };
  }
  return await user.save();
}

const Users = Mongoose.model('Users', Schema);
module.exports = Users;
