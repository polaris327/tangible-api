const config = require('../config/main');
const Twilio = require('twilio')(config.twilioSID, config.twilioAuthToken);
const Auth = require('./auth');
const Bitly = require('bitly');
const Errors = require('../config/errors');
BitlyClient = new Bitly(config.bitlyKey);

exports.sendLink = async function(order, customer, creator) {
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_EMAILS) return null;
  if (!(order && customer && creator)) return null;
  const company = await creator.getCompany().catch((err) => Errors.handle(err));
  let link = await order.createLink(customer.userId).catch((err) => Errors.handle(err));
  link = link ? link.data.url : '';
  Twilio.sendMessage({
    to:'+1' + customer.phone,
    from: '+1' + config.twilioPhoneNumber,
    body: creator.profile.firstName + ' ' + creator.profile.lastName + ' prepared a new order for you with ' + company.name + ', open link to confirm and ship ' + link
  })
}

exports.sendSMSVerification = async function (user) {
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_EMAILS) return null;
  if (!user.phone) return;
  let token = await Auth.generateToken().catch((err) => Errors.handle(err));
  user.phoneVerificationToken = token;
  user.save();
  const link = await BitlyClient.shorten(config.adminBaseUrl + '/verify-phone/' + token).catch((err) => Errors.handle(err));
  if (link)
    Twilio.sendMessage({
      to:'+1' + user.phone,
      from: '+1' + config.twilioPhoneNumber,
      body: 'Welcome to Tangible, please verify your phone number by opening this following link: ' + link.data.url
    });
};
