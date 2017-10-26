const should = require('should');
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { URI } = require('./config')


describe('************* CREATE ORDERS *************', () => {

  before((done) => {
    Object.assign(ValidOrders[0].products[0], _.pick(ValidProducts[0], ['_id', 'price', 'name', 'imageUrl']));
    Object.assign(ValidOrders[1].products[0], _.pick(ValidProducts[1], ['_id', 'price', 'name', 'imageUrl']));
    Object.assign(ValidOrders[2].products[0], _.pick(ValidProducts[2], ['_id', 'price', 'name', 'imageUrl']));
    done();
  });

  it('should FAIL [422] to create an order without parameters', (done) => {
    request(app)
      .post('/orders').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({})
      .expect(422)
      .end((err, res) => {
        if (err) done(err);
        done(err);
      });
  });

  var tempOrder;
  it('should create [201] an order with valid parameters', (done) => {
    let order = ValidOrders[0];
    order.customerId = ValidCustomers[0]._id;
    request(app)
      .post('/orders').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: order,
      })
      .expect(201)
      .end((err, res) => {
        if (err) {console.log(err); return done(err)}
        tempOrder = res.body.order;
        done(err);
      });
  });

  it('should update [200] an order with valid parameters', (done) => {
    tempOrder.products[0].quantity = 2;
    request(app)
      .put('/orders/' + tempOrder._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: tempOrder,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {console.log(err); return done(err)}
        res.body.order.products[0].quantity.should.be.equal(2);
        done(err);
      });
  });

  it('should delete [200] an order by id', (done) => {
    request(app)
      .delete('/orders/' + tempOrder._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  it('should create [201] 2 orders with valid parameters', (done) => {
    var count = 0;
    _.each(ValidOrders, (VP,i) => {
      if (i < 2) {
      let order = ValidOrders[i];
      order.customerId = ValidCustomers[i]._id;
      request(app)
        .post('/orders').set('X-Real-IP', URI)
        .set('Authorization', ValidUsers[0].cookie)
        .send({
          order: order,
          shipping: ValidShippingDetails[i],
          payment: ValidPaymentDetails[i]
        })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          ValidOrders[i] = res.body.order;
          if (count++ == 1)
            done(err);
        });
      }
    })
  });

  it('should get my orders and populate them', (done) => {
    request(app)
      .get('/orders').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .query({ populate: true })
      .expect(200)
      .end((err, res) => {
        res.body.orders.should.be.instanceof(Array).and.have.lengthOf(2);
        done(err);
      });
  });

  it('should get a single order', (done) => {
    request(app)
      .get('/orders/' + ValidOrders[0]._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(200)
      .end((err, res) => {
        res.body.order._id.should.be.eql(ValidOrders[0]._id);
        done(err);
      });
  });

  it('should get a single order and populate it', (done) => {
    request(app)
      .get('/orders/' + ValidOrders[0]._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .query({populate: true})
      .expect(200)
      .end((err, res) => {
        res.body.order.creatorId.should.not.be.type('string');
        res.body.order.customerId.should.not.be.type('string');
        done(err);
      });
  });

  it('should create an order and send SMS (existing customer)', (done) => {
    let order = ValidOrders[2];
    order.customerId = ValidCustomers[0]._id;
    request(app)
      .post('/orders').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: order,
        sendOption: 'SMS'
      })
      .expect(201)
      .end((err, res) => {
        if (err) {console.log(err); return done(err)}
        ValidOrders[2] = res.body.order;
        res.body.order.status.should.be.equal('sent');
        done(err);
      });
  });

  it('should create an order and send Email (new customer)', (done) => {
    let order = ValidOrders[3];
    order.customerId = ValidCustomers[0]._id;
    request(app)
      .post('/orders').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: order,
        customer: _.pick(ValidCustomers[2], ['firstName', 'lastName', 'phone', 'email']),
        sendOption: 'email'
      })
      .expect(201)
      .end((err, res) => {
        if (err) {console.log(err); return done(err)}
        ValidOrders[3] = res.body.order;
        res.body.order.status.should.be.equal('sent');
        done(err);
      });
  });

  it('should create an order and charge a credit card', (done) => {
    let order = ValidOrders[4];
    order.customerId = ValidCustomers[0]._id;
    request(app)
      .post('/orders').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: order,
        payment: ValidPaymentDetails[0]
      })
      .expect(201)
      .end((err, res) => {
        if (err) {console.log(err); return done(err)}
        should.exist(res.body.order.payment);
        ValidOrders[4] = res.body.order;
        done(err);
      });
  });

  it('should fail [404] to update an order that does not exist', (done) => {
    let order = ValidOrders[4];
    order.products[0].quantity = 100;
    request(app)
      .put('/orders/' + '123').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: ValidOrders,
      })
      .expect(404, done);
  });

  it('should update [200] an order and send SMS', (done) => {
    let order = ValidOrders[4];
    order.products[0].quantity = 100;
    request(app)
      .put('/orders/' + order._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({
        order: order,
        sendOption: 'SMS'
      })
      .expect(200)
      .end((err, res) => {
        if (err) {console.log(err); return done(err)}
        res.body.order.products[0].quantity.should.be.equal(100);
        done(err);
      });
  });

});
