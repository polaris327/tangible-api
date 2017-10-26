const config = require('../config/main');
const mongoose = require('mongoose');

process.env.NODE_ENV = config.test_env;
process.env.MONGO_URL = `mongodb://localhost/${config.test_db}`;

exports.URI = '127.0.0.1';

ValidUsers = [
  { email: 'johndoe@pourpal.co', password: 'secret', lastName: 'Doe', firstName: 'John', companyName: 'ACME1', phone: '7039694802' },
  { email: 'janedoe@pourpal.co', password: 'secret2', lastName: 'Doe', firstName: 'Jane', companyName: 'ACME2', phone: '2152790717' },
  { email: 'timbuck@pourpal.co', password: 'secret3', lastName: 'Buck', firstName: 'Tim', companyName: 'ACME3', phone: '7039694803' },
];

ValidProducts = [
  { name: 'Product1', price: 10, description: '1st Product' },
  { name: 'Product2', price: 20, description: '2nd Product' },
  { name: 'Product3', price: 30, description: '2nd Product' },
];

ValidCustomers = [
  { firstName: 'Johnny', lastName: 'Black', phone: '1234567890', email: 'johnnyblack@whiskey.com' },
  { firstName: 'Johnny', lastName: 'Red', phone: '2345678901', email: 'johndoe@pourpal.co' },
  { firstName: 'Johnny', lastName: 'Blue', phone: '3456789012', email: 'johnnyblue@whiskey.com' },
];

ValidCompanies = [
  { name: 'Iconic Wines', website: 'www.iconicwine.com' },
];

ValidOrders = [
  {products: [{quantity: 1}]},
  {products: [{quantity: 2}]},
  {products: [{quantity: 3}]},
  {products: [{quantity: 4}]},
  {products: [{quantity: 5}]},
  {products: [{quantity: 6}]},
]

ValidShippingDetails = [
  {name: 'Johnny Appleseed', street: '123 Licorice Lane', zip: '12345'},
  {name: 'Joe Who', street: '456 Druary Lane', zip: '56789'},
  {name: 'Mary What', street: '789 Candy Hill', zip: '98765'},
]

ValidPaymentDetails = [
  {token: 'token-456'},
  {cardId: 'card-123', save: true},
  {cardId: 'card-456'},
]

exports.ResetDatabase = (done) => {
  var count = 0;
  mongoose.connection.collections.users.drop(() => {if (count++ == 5) done()});
  mongoose.connection.collections.companies.drop(() => {if (count++ == 5) done()});
  mongoose.connection.collections.products.drop(() => {if (count++ == 5) done()});
  mongoose.connection.collections.customers.drop(() => {if (count++ == 5) done()});
  mongoose.connection.collections.orders.drop(() => {if (count++ == 5) done()});
  mongoose.connection.collections.activities.drop(() => {if (count++ == 5) done()});
}
