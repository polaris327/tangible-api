const { Customers, Orders } = require('../models');
const { Helpers } = require('../helpers');

exports.create = async function (req, res, next) {
  let fields = req.body;
  if (!(fields.phone || fields.email))
    return res.status(422).send({ error: 'You must enter either a phone number or email' });
  const customer = await Customers.create(fields, req.user);
  return res.status(201).json({ customer });
};

exports.getAll = async function (req, res, next) {
  let query = null;
  if (Object.keys(req.query).length)
    query = req.query;
  else
    query = Helpers.buildMyQuery(req.user);
  const customers = await Customers.find(query).exec();
  return res.status(200).json({ customers });
};

exports.update = async function (req, res, next) {
  let customer = req.customer;
  customer.update(req.body);
  customer = await customer.save();
  return res.status(200).json({ customer });
};

exports.remove = async function (req, res, next) {
  Customers.remove({_id: req.params.customerId}, (err, raw) => {
    return res.status(200).send();
  });
};


exports.getOrders = async function(req, res, next) {
  if (!req.params.customerId) res.status(422).json({ err: 'Customer Id required' });
  const orders = await Orders.find({ customerId: req.params.customerId }).exec();
  return res.status(200).json({ orders });
};
