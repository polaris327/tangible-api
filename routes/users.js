const express = require('express');
const Controllers = require('../controllers');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');

module.exports = function (requireAuth, requireLogin) {
  const routes = express.Router();
  routes.get('/:userId', requireAuth, Preload, Controllers.Users.get);
  routes.put('/:userId', requireAuth, Preload, Permissions.updateUser, Controllers.Users.update);
  //routes.get('/:userId/cards', requireAuth, Permissions.updateUser, Controllers.Users.getCards);
  routes.delete('/:userId/cards/:cardId', requireAuth, Preload, Permissions.updateUser, Controllers.Users.removeCard);
  return routes;
}
