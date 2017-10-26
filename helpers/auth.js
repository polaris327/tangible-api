const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/main');

exports.generateToken = function() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString('hex'));
    });
  });
}

exports.generateJWTToken = function(userId) {
  return jwt.sign({_id: userId}, config.secret, {
    expiresIn: 31536000 // in seconds
  });
}

exports.generateHash = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(5, (err, salt) => {
      if (err) return reject(err);
      bcrypt.hash(password, salt, null, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
}
