const { Orders, Companies, Products, Users, Customers, Activities } = require('../../models');
const { Emails, Helpers } = require('../../helpers');
const config = require('../../config/main');
const Validator = require('validator');
const Errors = require('../../config/errors');

exports.save = require('./save');
exports.submit = require('./submit');

exports.get = async function (req, res, next) {
  let data = {}, order = null;
  if (req.query.populate) {
    var populatedOrder = await Orders.findById(req.params.orderId).populate('creatorId customerId companyId').exec();
    order = _.pick(req.order, ['_id', 'products', 'total', 'status', 'payment', 'shipping', 'promo', 'createdAt', 'userId', 'creatorId', 'customerId', 'companyId']);
    order.customer = populatedOrder.customerId;
    order.creator = populatedOrder.creatorId;
    order.company = populatedOrder.companyId;
  }
  else
    order = req.order;
  res.status(200).json({ order });
  // Add Activity
  console.log('Calling Order Get');
  Activities.create({
    orderId: order._id,
    customerId: order.customerId,
    //ip: req.ip && Validator.isIP(req.ip) && req.ip != '::1' ? req.ip : null,
    action: 'viewed'
  }, req.user).catch((err) => Errors.handle(err));
};

exports.getAll = async function (req, res, next) {
  let orders = null;
  if (req.query.populate) {
    var populatedOrders = await Orders.find(Helpers.buildMyQuery(req.user)).populate('creatorId customerId').exec();
    orders = _.map(populatedOrders, (order, i) => {
      let temp = _.pick(order, ['_id', 'products', 'total', 'status', 'payment', 'createdAt', 'userId', 'creatorId', 'customerId', 'companyId']);
      temp.customer = temp.customerId;
      temp.creator = temp.creatorId;
      temp.customerId = temp.customer && temp.customer._id;
      temp.creatorId = temp.creator && temp.creator._id;
      return temp;
    });
  }
  else
    orders = await Orders.find(Helpers.buildMyQuery(req.user)).exec();
  return res.status(200).json({ orders });
}

exports.remove = async function (req, res, next) {
  await Orders.remove({ _id: req.params.orderId });
  return res.status(200).send();
}

exports.sendReceipt = function (req, res, next) {
  let order = req.order;
  const user = req.body.email ? { email: req.body.email } : req.user;
  Emails.sendReceipt(order, user);
  return res.status(200).send();
}

exports.getActivity = async function(req, res, next) {
  const activities = await Activities.find({orderId: req.params.orderId}).exec();
  return res.status(200).json({ activities })
}

exports.addActivity = async function(req, res, next) {
  let order = req.order;
  Activities.create({
    ip: req.ip && Validator.isIP(req.ip) && req.ip != '::1' ? req.ip : undefined,
    orderId: req.params.orderId,
    customerId: order.customerId,
    action: req.body.action
  }, req.user)
  res.status(200).send();
}

exports.send = async function(req, res, next) {
  let order = req.order;
  let sendOption = req.body.sendOption;
  if (!sendOption) return res.status(422).send({ error: 'You must include a send option' });
  order.send(sendOption, req.user)
  order = await order.save();
  return res.status(200).json({ order });
}
