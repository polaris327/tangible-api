const should = require('should');
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { URI } = require('./config')


describe('************* SUBMIT ORDERS *************', () => {

  it('should fail to submit an order without order parameter', (done) => {
    request(app)
      .post('/orders/submit').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        shipping: ValidShippingDetails[0], payment: ValidPaymentDetails[0]})
      .expect(422)
      .end((err, res) => {
        done(err);
      });
  });

  it('should submit an order with new credit card', (done) => {
    request(app)
      .post('/orders/submit').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: ValidOrders[2],
        shipping: ValidShippingDetails[0],
        payment: ValidPaymentDetails[0],
        customer: ValidCustomers[0]
      })
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  it('should submit an order with existing credit card', (done) => {
    request(app)
      .post('/orders/submit').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: ValidOrders[3],
        shipping: ValidShippingDetails[0],
        payment: ValidPaymentDetails[1],
        customer: ValidCustomers[0]
      })
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  it('should submit an order with that has already been prepaid', (done) => {
    request(app)
      .post('/orders/submit').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: ValidOrders[4],
        shipping: ValidShippingDetails[0],
        customer: ValidCustomers[0]
      })
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

});
