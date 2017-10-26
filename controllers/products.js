const { Products } = require('../models');
const { Helpers } = require('../helpers');
const Errors = require('../config/errors');

exports.getAll = async function (req, res, next) {
  let query = null;
  const fields = req.query;
  if (Object.keys(fields).length)
    query = fields;
  else
    query = Helpers.buildMyQuery(req.user);
  const products = await Products.find(query).exec().catch((err) => Errors.handle(err));
  return res.status(200).json({products: products});
};

exports.create = async function (req, res, next) {
  if (!(req.body.name && req.body.name.length))
    return res.status(422).send({ error: 'You must enter a product name' });
  const product = await Products.create(req.body, req.user).catch((err) => Errors.handle(err))
  if (product)
    return res.status(201).json({ product });
  else
    return res.status(500).send();
}

exports.update = async function (req, res, next) {
  let product = req.product;
  Object.assign(product, req.body);
  product = await product.save().catch((err) => Errors.handle(err));
  if (product)
    return res.status(200).json({ product });
  else
    return res.status(500).send();
};

exports.remove = async function (req, res, next) {
  await Products.remove({_id: req.params.productId}).exec().catch((err) => Errors.handle(err));
  return res.status(200).send();
};
