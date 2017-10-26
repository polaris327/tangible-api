const express = require('express');
const Controllers = require('../controllers');
const Preload = require('../config/preload');
const Permissions = require('../config/permissions');

module.exports = function (requireAuth, requireLogin) {
  const routes = express.Router();
  routes.get('/', requireAuth, Controllers.Customers.getAll);
  routes.post('/', requireAuth, Permissions.isSeller, Controllers.Customers.create);
  routes.put('/:customerId', requireAuth, Preload, Permissions.updateCustomer, Controllers.Customers.update);
  routes.delete('/:customerId', requireAuth, Preload, Permissions.updateCustomer, Controllers.Customers.remove);
  routes.get('/:customerId/orders', requireAuth, Preload, Permissions.updateCustomer, Controllers.Customers.getOrders);
  return routes;
}

/**
 * @swagger
 * /customers:
 *   post:
 *     description: Create a new customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: Customer's first name.
 *         required: true
 *         type: string
 *     responses:
 *      200:
 *        description: Create new customer
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  format: int64
 *                  example: 4
 *                name:
 *                  type: string
 *                  example: Jessica Smith
 *      '400':
 *        description: The specified user ID is invalid (not a number).
 */
