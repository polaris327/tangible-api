const should = require('should');
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { URI } = require('./config')


describe('************* Customers *************', () => {

  it('should FAIL [422] to create a customer without parameters', (done) => {
    request(app)
      .post('/customers')
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({})
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        done(err);
      });
  });

  var tempCustomer;
  it('should create [201] a customer with valid parameters', (done) => {
    request(app)
      .post('/customers')
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send(ValidCustomers[0])
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        tempCustomer = res.body.customer;
        done(err);
      });
  });

  it('should create [201] a customer with same email address as existing user', (done) => {
    request(app)
      .post('/customers')
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send(ValidCustomers[1])
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Clean up this customer document
        request(app)
          .delete('/customers/' + res.body.customer._id)
          .set('X-Real-IP', URI)
          .set('Authorization', ValidUsers[0].cookie)
          .expect(200)
          .end((err, res) => {
            done(err);
          })
      });
  });


  it('should update [200] a customer', (done) => {
    request(app)
      .put('/customers/' + tempCustomer._id)
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({firstName: 'Paul'})
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  /*it('should not delete [404] a customer if no customer exists', (done) => {
    request(app)
      .delete('/customers/' + '5900a1786604103cccc1eaa7')
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(404)
      .end((err, res) => {
        done(err);
      });
  });*/

  it('should delete [200] a customer by id', (done) => {
    request(app)
      .delete('/customers/' + tempCustomer._id)
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  it('should create [201] 3 customers with valid parameters', (done) => {
    _.each(ValidCustomers, (VP,i) => {
      request(app)
        .post('/customers')
        .set('X-Real-IP', URI)
        .set('Authorization', ValidUsers[0].cookie)
        .send(ValidCustomers[i])
        .expect(201)
        .end((err, res) => {
          ValidCustomers[i] = res.body.customer;
          if (i == ValidCustomers.length-1)
            done(err);
        });
    })
  });

  it('should get my customers', (done) => {
    request(app)
      .get('/customers')
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(200)
      .end((err, res) => {
        res.body.customers.should.be.instanceof(Array).and.have.lengthOf(3);
        done(err);
      });
  });

});
