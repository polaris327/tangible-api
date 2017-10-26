const { Orders, Customers, Users, Payments, Addresses } = require('../../models');
const { Emails } = require('../../helpers');
const Errors = require('../../config/errors');

module.exports = async function (req, res, next) {
  let { payment, shipping } = req.body;
  let customerUpdate = req.body.customer;
  if (!req.body.order) return res.status(422).send({ error: 'Order required' });
  if (!shipping) return res.status(422).send({ error: 'Shipping details required' });
  if (!customerUpdate) return res.status(422).send({ error: 'Customer details required' });
  let user = req.user;
  let order = null;
  if (req.body.order._id)
    order = await Orders.findById(req.body.order._id).exec();
  else
    order = await Orders.create(req.body.order).catch((err) => Errors.handle(err));
  if (!((payment && (payment.id || payment.token)) || order.payment))
    return res.status(422).send({ error: 'Payment details required' });

  // Update order, customer, and shipping
  if (shipping._id)
    shipping = await Addresses.findById(shipping._id).exec();
  else
    shipping = await Addresses.create(shipping).catch((err) => Errors.handle(err));
  order.update(req.body.order);
  order.address = shipping;
  order.getTotal();

  // Handle payment
  const creator = await Users.findById(order.creatorId);
  if (!order.payment && !order.demo) {
    let source = await Payments.getSource(payment, req.user).catch((err) => Errors.handle(err));
    if (!source) return res.status(500).send({ error: 'Payment declined: Please check your information or try a different payment method' });
    const paymentResult = await order.charge('card', source, creator, req.user).catch((err) => Errors.handle(err));
    if (!paymentResult) return res.status(500).send({ error: 'Payment declined: Please check your information or try a different payment method' });
    order.addActivity({action: 'paid', ip: req.ip }, req.user);
  }

  // Finish order and return
  order.status = 'complete';
  res.status(200).send({ order });

  let customer = await order.getCustomer()
  customer.update(customerUpdate);
  user.addAddress(shipping);
  customer.addAddress(shipping);

  customer.save();
  user.save();
  order.save();
  console.log('Order submission complete');

  // Send receipt and seller confirm
  if (!creator.sellerOptions.preventReceipt)
    Emails.sendReceipt(order, customer, creator);
  Emails.sendSellerConfirm(order, customer, creator)

  // Add activity record
  //order.addActivity({action: 'completed', ip: req.ip }, req.user);
  order.addActivity({action: 'completed' }, req.user);
}
