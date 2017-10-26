const Mongoose = require('mongoose');
const Schema = require('./schemas/orders');
const Products = require('./products');
const Activities = require('./activities');
const Companies = require('./companies');
const Customers = require('./customers');
const Payments = require('./payments');
const { SMS, Emails, Auth } = require('../helpers');
const config = require('../config/main');
const Bitly = require('bitly');
BitlyClient = new Bitly(config.bitlyKey);
const Validator = require('validator');
const Errors = require('../config/errors');

Schema.methods.update = async function(fields) {
  Object.assign(this, _.pick(fields, ['products', 'customerId', 'promo', 'shipping']));
}

Schema.methods.send = async function(option, creator) {
  this.status = 'sent';
  const customer = await this.getCustomer();
  if (option == 'SMS') {
    if (customer.phone && Validator.isNumeric(customer.phone) && customer.phone.length == 10)
      SMS.sendLink(this, customer, creator);
  }
  else {
    if (customer.email && Validator.isEmail(customer.email))
      Emails.sendLink(this, customer, creator);
  }
}

Schema.methods.createLink = async function(userId) {
  if (process.env.NODE_ENV == 'test')
    return config.mobileBaseUrl + '/orders/' + '123' + '?token=123';
  // Shorten Link
  const token = Auth.generateJWTToken(userId);
  const link = config.mobileBaseUrl + '/orders/' + this._id  + (token.length ? '?token=' + token : '');
  return BitlyClient.shorten(link, config.shortLinkUrl);
}

Schema.methods.addActivity = async function(params, creator) {
  Activities.create(Object.assign(params, {orderId: this._id, customerId: this.customerId}), creator)
}

Schema.methods.charge = async function(type, source, seller, user) {
  const company = await seller.getCompany();
  if (type == 'card') {
    if (!seller.stripe.connectId) return null;
    console.log('Charging credit card');
    let charge = {
      amount: this.total * 100,
      currency: "usd",
      source: source,

    };
    let options = {
      stripe_account: seller.stripe.connectId
    }
    if (_.includes(source, 'card'))
      charge.customer = user.stripe.customerId;
    const payment = await Payments.chargeCard(charge, options).catch((err) => Errors.handle(err))
    if (payment)
      this.payment = {stripeChargeId: payment.id, type: 'card'};
    return payment;
  }
}

Schema.methods.getTotal = async function() {
  let total = 0;
  _.each(this.products, (product, i) => {
    total += product.quantity * product.price;
  });
  // Remove promo
  if (this.promo) {
    if (this.promo.type == 'amount')
      total -= Number(this.promo.value);
      if (this.promo.type == 'percent')
        total = total * (1 - (Number(this.promo.value)/100));
  }
  // Add shipping
  if (this.shipping)
    total += this.shipping;
  this.total = total;
}

Schema.methods.getCustomer = async function() {
  if (!this.customerId) return null;
  return await Customers.findById(this.customerId).exec();
}

// Statics

Schema.statics.create = async function(params, creator) {
  let order = new Orders(params);
  if (creator) {
    order.creatorId = creator._id;
    if (creator.sellerOptions && creator.sellerOptions.companyId)
      order.companyId = creator.sellerOptions.companyId;
  }
  return await order.save();
}

const Orders = Mongoose.model('Orders', Schema);
module.exports = Orders;
