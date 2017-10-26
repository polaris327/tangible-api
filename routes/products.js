const express = require('express');
const Controllers = require('../controllers');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');

module.exports = function (requireAuth, requireLogin) {
  const routes = express.Router();
  routes.get('/', requireAuth, Controllers.Products.getAll);
  routes.post('/', requireAuth, Controllers.Products.create);
  routes.put('/:productId', requireAuth, Preload, Permissions.updateProduct, Controllers.Products.update);
  routes.delete('/:productId', requireAuth, Preload, Permissions.updateProduct, Controllers.Products.remove);
  return routes;
}
