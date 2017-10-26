const Mongoose = require('mongoose');
const Schema = require('./schemas/payments');
const stripePrivateApiKey = require('../config/main').stripePrivateApiKey;
const Stripe = require('stripe')(stripePrivateApiKey);
const Errors = require('../config/errors');

// ***** Static Methods *****

Schema.statics.createCustomer = function() {
  return new Promise((resolve, reject) => {
    Stripe.customers.create({}, (err, customer) => {
      if (err) return reject(err);
      resolve(customer);
    });
  });
}

Schema.statics.chargeCard = function(charge, options) {
  console.log('Charging card: ', charge);
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV == 'test' && !process.env.TEST_STRIPE)
      resolve({id: 'payment123'});
    else
      Stripe.charges.create(charge, options, (err, payment) => {
        if (err) { console.log(err), reject(err)}
        NewPayment = new Payments(payment);
        NewPayment.save();
        resolve(payment);
    });
  })
}

Schema.statics.getSource = async function(payment, user) {
  // If passing card id
  if (payment.id)
    return payment.id;
  // If passing token
  else if (payment.token) {
    // ADDED TEMP
    return payment.token;
    if (payment.save) {
      const card = await user.addCard(payment.token).catch((err) => Errors.handle(err));
      if (card && card.id)
        return card.id;
      else
        return null
    }
    else
      return payment.token;
  }
  else
    return null;
}

const Payments = Mongoose.model('Payments', Schema);
module.exports = Payments;
