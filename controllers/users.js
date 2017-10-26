const { Users, Orders, Customers, Companies, Products } = require('../models');
const { Helpers } = require('../helpers');
const Errors = require('../config/errors');

exports.get = function(req, res, next) {
  let user = req._user;
  return res.status(200).json({ user })
}

exports.update = async function (req, res, next) {
  let user = req._user;
  user.update(req.body);
  user = await user.save().catch((err) => Errors.handle(err));
  return res.status(200).json({ user })
}

exports.getCards = async function (req, res, next) {
  return res.status(200).json({ cards: req.user.cards });
}

exports.removeCard = async function (req, res, next) {
  if (!req.params.cardId) return res.status(422).json({ error: 'Must supply a card id to delete' });
  let user = req._user;
  user.removeCard(req.params.cardId);
  user = await user.save().catch((err) => Errors.handle(err));
  return res.status(200).send({ cards: user.cards });
}

exports.getMyData = async function(req, res, next) {
  const query = Helpers.buildMyQuery(req.user);
  const data = {
    orders: await Orders.find(query).exec().catch((err) => Errors.handle(err)),
    customers: await Customers.find(query).exec().catch((err) => Errors.handle(err)),
    products: await Products.find(query).exec().catch((err) => Errors.handle(err)),
    company: req.user.sellerOptions.companyId ? await Companies.findById(req.user.sellerOptions.companyId) : null
  }
  return res.status(200).json(data);
}
