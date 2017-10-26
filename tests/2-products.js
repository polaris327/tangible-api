const should = require('should');
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { URI } = require('./config')


describe('************* PRODUCTS *************', () => {

  it('should FAIL [422] to create a product without parameters', (done) => {
    request(app)
      .post('/products').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({ price: 20 })
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.error.should.be.eql('You must enter a product name');
        done();
      });
  });

  var tempProduct;
  it('should create [201] a product with valid parameters', (done) => {
    request(app)
      .post('/products').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send(ValidProducts[0])
      .expect(201)
      .end((err, res) => {
        tempProduct = res.body.product;
        done(err);
      });
  });

  it('should update [200] a product', (done) => {
    request(app)
      .put('/products/' + tempProduct._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .send({name: 'A better name'})
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  it('should not delete [404] a product if no product exists', (done) => {
    request(app)
      .delete('/products/' + '123').set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(404)
      .end((err, res) => {
        done(err);
      });
  });

  it('should delete [200] a product by id', (done) => {
    request(app)
      .delete('/products/' + tempProduct._id).set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(200)
      .end((err, res) => {
        done(err);
      });
  });

  it('should create [201] 3 products with valid parameters', (done) => {
    _.each(ValidProducts, (VP,i) => {
      request(app)
        .post('/products')
        .set('X-Real-IP', URI)
        .set('Authorization', ValidUsers[0].cookie)
        .send(ValidProducts[i])
        .expect(201)
        .end((err, res) => {
          ValidProducts[i] = res.body.product;
          if (i == ValidProducts.length-1)
            done(err);
        });
    })
  });

  it('should get my products', (done) => {
    request(app)
      .get('/products/')
      .set('X-Real-IP', URI)
      .set('Authorization', ValidUsers[0].cookie)
      .expect(200)
      .end((err, res) => {
        res.body.products.should.be.instanceof(Array).and.have.lengthOf(3);
        done(err);
      });
  });

});
