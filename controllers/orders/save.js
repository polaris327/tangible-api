const { Orders, Customers, Payments } = require('../../models');
const { Helpers } = require('../../helpers');
const Errors = require('../../config/errors');

module.exports = async function (req, res, next) {
  if (!req.body.order) return res.status(422).send({ error: 'You include an order' });
  if (!(req.body.order.customerId || req.body.order.customer))
    return res.status(422).send({ error: 'You must have a customer for this order' });
  // Handle order
  let order = null;
  if (req.params.orderId) {
    order = req.order;
    order.update(req.body.order);
  }
  else {
    order = await Orders.create(req.body.order, req.user).catch((err) => Errors.handle(err));
  }
  order.getTotal();
  // Get customer
  let customer = null;
  if (req.body.order.customer) {
    customer = await Customers.create(req.body.order.customer, req.user).catch((err) => Errors.handle(err));
    order.customerId = customer._id;
  }
  else {
    customer = await Customers.findById(order.customerId).exec().catch((err) => Errors.handle(err));
    if (!customer ) return res.status(422).send({ error: 'We could not find a customer with this Id' });
  }
  order.userId = customer.userId;
  // Charge for order
  if (req.body.payment && req.body.payment.token) {
    const result = await order.charge('card', req.body.payment.token, req.user, req.user).catch((err) => Errors.handle(err));
    if (!result) return res.status(500).json({error: 'Unknown payment error'})
    order.addActivity({action: 'paid', location: req.body.location }, req.user)
  }
  // Send order
  if (req.body.sendOption && (req.body.sendOption == 'email' || req.body.sendOption == 'SMS')) {
    order.send(req.body.sendOption, req.user);
    order.addActivity({action: 'sent', location: req.body.location }, req.user);
  }
  // Save and return to client
  order = await order.save();
  if (order) {
    let data = {order};
    if (req.body.order.customer)
      data.customer = customer;
    return res.status(201).json(data);
  }
  else
    return res.status(500).json({error: 'Unknown order error'})
}
