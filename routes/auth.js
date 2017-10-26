const express = require('express');
const Controllers = require('../controllers');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');

module.exports = function (requireAuth, requireLogin) {
  const routes = express.Router();
  routes.post('/signup', Controllers.Auth.signup);
  routes.post('/login', requireLogin, Controllers.Auth.login);
  routes.post('/login-token', requireAuth, Controllers.Auth.loginWithToken);
  routes.get('/user', requireAuth, Controllers.Auth.getUser);
  routes.get('/keys', requireAuth, Controllers.Auth.getKeys);
  routes.post('/forgot-password', Controllers.Auth.forgotPassword);
  routes.post('/reset-password', Controllers.Auth.resetPassword);
  routes.post('/verify', Controllers.Auth.verify);
  routes.post('/connect', Controllers.Auth.connect);
  return routes;
}
