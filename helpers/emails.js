const config = require('../config/main');
const SparkPost = require('sparkpost');
const SparkPostClient = new SparkPost(config.sparkPostApiKey);
const Auth = require('./auth');
const Validator = require('validator');
const Errors = require('../config/errors');

exports.sendReceipt = async function(order, customer, creator) {
  if (process.env.NODE_ENV == 'test')
    return;
  if (!order || !customer || !customer.email || !Validator.isEmail(customer.email))
    return;
  let company = await creator.getCompany().catch((err) => Errors.handle(err));
  // Create substitution_data
  var data = {
    order_total: order.total.toFixed(2),
    order_products: [],
    email: customer.email,
    seller_name: creator.profile.firstName + ' ' + creator.profile.lastName,
    seller_email: creator.email,
    seller_company_name: company.name,
    seller_company_website: company.website,
  };
  if (order.promo)
    data.order_promo = order.promo.value;
  if (order.shipping)
    data.order_shipping = order.shipping;
  data.order_products = _.map(order.products, (product, i) => {
    return {
      price: product.price.toFixed(2),
      quantity: product.quantity,
      name: product.name,
      image: product.imageUrl
    };
  });
  // Create message options
  var messageOptions = {
    recipients: [
      { address: {email: customer.email} }
    ],
    content: {
      template_id: 'tangible-receipt'
    },
    substitution_data: data
  };
  SparkPostClient.transmissions.send(messageOptions);
}

exports.sendSellerConfirm = async function(order, customer, creator) {
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_EMAILS) return;
  if (!(order && customer)) return;
  let productList = '';
  _.each(order.products, (product, i) => {
    productList += product.quantity + ' x ' + product.name + '<br>';
  });
  if (productList.length)
    productList = productList.substring(0, productList.length - 4);
  const data = {
    customer_name: (customer.firstName || customer.profile.firstName || '') + ' ' + (customer.lastName || customer.profile.lastName || ''),
    customer_phone: customer.phone,
    customer_email: customer.email,
    order_id: order._id,
    order_url: config.adminBaseUrl + '/orders/' + order._id,
    order_paid: order.payment ? 'Yes' : 'No',
    order_products: productList,
    order_promo: order.promo ? 'Yes - ' + order.promo.type + ' ' + order.promo.value : '',
    order_shipping: order.shipping ? order.shipping : '',
    shipping_name: order.address && order.address.name,
    shipping_address: order.address && order.address.street,
    shipping_city: order.address && order.address.city,
    shipping_state: order.address && order.address.state,
    shipping_zip: order.address && order.address.zip,
  };
  const messageOptions = {
    recipients: [{ address: {email: creator.email} }],
    content: { template_id: 'tangible-seller-confirmation' },
    substitution_data: data
  };
  SparkPostClient.transmissions.send(messageOptions);
}

exports.sendLink = async function(order, customer, creator) {
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_EMAILS) return null;
  if (!(order && customer && creator)) return null;
  const company = await creator.getCompany().catch((err) => Errors.handle(err));
  let link = await order.createLink(customer.userId).catch((err) => Errors.handle(err));
  link = link ? link.data.url : '';
  const messageOptions = {
    recipients: [ { address: {email: customer.email} } ],
    content: { template_id: 'tangible-order' },
    substitution_data: {
      email: customer.email,
      order_url: link,
      seller_name: creator.profile.firstName + ' ' + creator.profile.lastName,
      seller_image: creator.profile.imageUrl,
      seller_email: creator.email,
      seller_company_name: company.name,
      seller_company_website: company.website,
    }
  };
  SparkPostClient.transmissions.send(messageOptions);
}

exports.sendResetPassword = function(user, link) {
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_EMAILS) return;
  const email = user.email;
  if (!(email && link)) return;
  const messageOptions = {
    recipients: [ { address: {email} } ],
    content: { template_id: 'tangible-reset-password' },
    substitution_data: { link }
  };
  SparkPostClient.transmissions.send(messageOptions);
}

exports.sendEmailVerification = async function (user) {
  if (process.env.NODE_ENV == 'test' && !process.env.TEST_EMAILS) return null;
  if (!user.email) return;
  let token = await Auth.generateToken().catch((err) => Errors.handle(err));
  user.emailVerificationToken = token;
  user.save();
  const link = config.adminBaseUrl + '/verify-email/' + token;
  if (link)
    SparkPostClient.transmissions.send({
      recipients: [ { address: user.email } ],
      content: { template_id: 'tangible-verify-email' },
      substitution_data: { link }
    });
};

exports.sendHello = function(email, params) {
  const messageOptions = {
    recipients: [
      { address: { email: email } }
    ],
    content: {
      template_id: 'tangible-hello'
    },
    substitution_data: {
      user_name: params.name,
      user_email: params.email,
      user_message: params.message,
    }
  };
  return new Promise((resolve, reject) => {
    SparkPostClient.transmissions.send(messageOptions, (err, res) => {
      if (err) reject(err)
      return resolve(true)
    });
  });
}
