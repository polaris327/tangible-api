const express = require('express');
const Controllers = require('../controllers');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');

module.exports = function (requireAuth, requireLogin) {
  const routes = express.Router();
  routes.post('/', requireAuth, Permissions.isSeller, Controllers.Orders.save);
  routes.get('/', requireAuth, Controllers.Orders.getAll);
  routes.post('/submit', requireAuth, Controllers.Orders.submit);
  routes.get('/:orderId', requireAuth, Preload, Controllers.Orders.get);
  routes.put('/:orderId', requireAuth, Preload, Permissions.updateOrder, Controllers.Orders.save);
  routes.delete('/:orderId', requireAuth, Preload, Permissions.updateOrder, Controllers.Orders.remove);
  routes.post('/:orderId/send', requireAuth, Preload, Permissions.updateOrder, Controllers.Orders.send);
  routes.post('/:orderId/send/receipt', requireAuth, Preload, Permissions.updateOrder, Controllers.Orders.sendReceipt);
  routes.get('/:orderId/activity', requireAuth, Preload, Controllers.Orders.getActivity);
  routes.post('/:orderId/activity', requireAuth, Preload, Controllers.Orders.addActivity);
  return routes;
}
