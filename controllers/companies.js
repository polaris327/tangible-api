const { Companies, Users, Products } = require('../models');

exports.get = async function (req, res, next) {
  let data = {company: req.company};
  if (req.query.users && req.company)
    data.users = await Users.find({ 'sellerOptions.companyId': req.params.companyId }).exec();
  if (req.query.products && req.company)
    data.products = await Products.find({ companyId: req.params.companyId }).exec();
  return res.status(200).json(data);
}

exports.create = async function (req, res, next) {
  if (!req.body.name)
    return res.status(422).send({error: 'You must enter a company name'});
  const company = await Companies.create(req.body);
  return res.status(201).json({ company });
}

exports.update = async function (req, res, next) {
  const result = await Companies.update({ _id: req.params.companyId }, req.body).exec();
  return res.status(200).send();
}

exports.remove = async function (req, res, next) {
  const result = await Companies.remove({_id: req.params.companyId}).exec();
  return res.status(200).send();
}

exports.addUser = async function (req, res, next) {
  if (!req.body.user)
    return res.status(422).send({ error: 'You must supply a user' });
  let user = await Users.findOne({ email: req.body.user }).exec();
  if (user) {
    user.addCompany(req.params.companyId);
    user = await user.save()
  }
  else {
    user = await Users.create({
      email: req.body.user,
      password: 'password',
      sellerOptions: { companyId: req.params.companyId, customerConfirm: true, sellerConfirm: true }
    });
  }
  return res.status(201).json({ user });
}

exports.removeUser = async function (req, res, next) {
  if (!req.body.userId)
    return res.status(422).send({ error: 'You must supply a user to remove' });
  let user = await Users.findById(req.body.userId).exec();
  if (user)
    user.removeCompany(req.params.companyId);
  user = await user.save();
  return res.status(201).json({ user });
}
