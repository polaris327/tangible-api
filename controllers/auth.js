const { Companies, Users } = require('../models');
const { Auth, Emails, SMS } = require('../helpers');
const config = require('../config/main');
const PhoneFormatter = require('phone-formatter');
const axios = require('axios');

exports.login = function (req, res, next) {
  res.status(200).json({
    token: `JWT ${Auth.generateJWTToken(req.user._id)}`,
    user: req.user
  });
};

exports.loginWithToken = function (req, res, next) {
  res.status(200).json({
    token: `JWT ${Auth.generateJWTToken(req.user._id)}`,
    user: req.user
  });
};

exports.signup = async function (req, res, next) {
  // Check for Signup errors
  const { firstName, lastName, email, password, companyName, companyWebsite, plan } = req.body;
  const phone = req.body.phone ? PhoneFormatter.normalize(req.body.phone) : null;
  if (!(firstName && lastName && companyName && email && phone && password))
    return res.status(422).send({ error: 'Missing fields to signup user' });
  const profile = { firstName, lastName };
  let user = await Users.findOne({email}).exec();
  if (user && user.sellerOptions)
    return res.status(422).send({ error: 'That email address is already in use.' });
  const company = await Companies.create({name: companyName, website: companyWebsite});
  const sellerOptions = {
    customerConfirm: true,
    sellerConfirm: true,
    sellerConfirmEmail: email,
    companyId: company._id
  };
  if (user) {
    Object.assign(user, {profile, phone, sellerOptions, plan: plan || 'basic'});
    user = await user.changePassword(password);
  }
  else
    user = await Users.create({ email, phone, password, profile, sellerOptions, plan: plan || 'basic' });
  if (user)
    res.status(201).json({ token: `JWT ${Auth.generateJWTToken(user._id)}`, user: user });
  else
    res.status(500).json({ error: 'Something went wrong creating a new user' });
  // Send SMS and email verifications
  SMS.sendSMSVerification(user);
  Emails.sendEmailVerification(user);
};

exports.forgotPassword = async function (req, res, next) {
  let user = await Users.findOne({email: req.body.email}).exec();
  if (!user)
    return res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
  user.forgotPassword();
  return res.status(200).send();
};

exports.resetPassword = async function (req, res, next) {
  let user = await Users.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }).exec();
  if (user) {
    user = await user.changePassword(req.body.password, true);
    const token = `JWT ${Auth.generateJWTToken(user._id)}`;
    return res.status(200).json({ user, token });
  }
  else
    return res.status(422).json({ error: 'Your token has expired or is incorrect. Please attempt to reset your password again.' });
}

exports.verify = async function (req, res, next) {
  if (!req.body.token)
    return res.status(422).json({ error: 'You have supplied an invalid token' });
  if (!(req.body.source == 'email' || req.body.source == 'phone'))
    return res.status(422).json({ error: 'You must supply a source to verify' });
  let query = {};
  query[req.body.source + 'VerificationToken'] = req.body.token;
  let user = await Users.findOne(query).exec();
  if (!user) return res.status(422).json({ error: 'You have supplied an invalid token' });
  user[req.body.source + 'Verified'] = true;
  user[req.body.source + 'VerificationToken'] = undefined;
  user = await user.save()
  return res.status(200).send();
}

exports.connect = async function(req, res, next) {
  if (!(req.body.code && req.body.userId))
    return res.status(422).json({ error: 'You have supplied an invalid code or user id' });
  let user = await Users.findById(req.body.userId);
  if (!user)
    return res.status(422).json({ error: 'You have supplied an invalid code or user id' });
  const response = await axios.post('https://connect.stripe.com/oauth/token', {
      client_secret: config.stripePrivateApiKey,
      code: req.body.code,
      grant_type: 'authorization_code'
    }).catch(function (err) {
      console.log(err);
    });
  if (response.data.stripe_user_id) {
    user.stripe.connectId = response.data.stripe_user_id;
    user.save();
  }
  return res.status(200).json({user});
}

exports.getKeys = function (req, res, next) {
  return res.status(200).json({
    keys: {
      stripeApiKey: config.stripePublicApiKey
    }
  });
}

exports.getUser = function (req, res, next) {
  return res.status(200).json({ user: req.user });
}
