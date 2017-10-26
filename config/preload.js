const { Customers, Products, Orders, Companies, Users } = require('../models');
const ObjectId = require('mongoose').Types.ObjectId;
const Errors = require('./errors');

module.exports = async function(req, res, next) {
  if (req.params.customerId) {
    if (ObjectId.isValid(req.params.customerId))
      req.customer = await Customers.findById(req.params.customerId).exec().catch((err) => Errors.handle(err));
    if (!req.customer) return res.sendStatus(404);
  }
  if (req.params.productId) {
    if (ObjectId.isValid(req.params.productId))
      req.product = await Products.findById(req.params.productId).exec().catch((err) => Errors.handle(err));
    if (!req.product) return res.sendStatus(404);
  }
  if (req.params.orderId) {
    if (ObjectId.isValid(req.params.orderId))
      req.order = await Orders.findById(req.params.orderId).exec().catch((err) => Errors.handle(err));
    if (!req.order) return res.sendStatus(404);
  }
  if (req.params.companyId) {
    if (ObjectId.isValid(req.params.companyId))
      req.company = await Companies.findById(req.params.companyId).exec().catch((err) => Errors.handle(err));
    if (!req.company) return res.sendStatus(404);
  }
  if (req.params.userId) {
    if (ObjectId.isValid(req.params.userId))
      req._user = await Users.findById(req.params.userId).exec().catch((err) => Errors.handle(err));
    if (!req._user) return res.sendStatus(404);
  }
  next();
}
