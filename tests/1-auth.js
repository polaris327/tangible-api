const should = require('should');
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { URI, ResetDatabase } = require('./config')
Cookies = [];

describe('************* USER SIGNUP *************', () => {

  before((done) => {
    ResetDatabase(done);
  });

  it('should FAIL [422] to create a user without parameters', (done) => {
    request(app)
      .post('/auth/signup').set('X-Real-IP', URI)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        done(err);
      });
  });

  it('should FAIL [422] to create a user with incomplete parameters', (done) => {
    request(app)
      .post('/auth/signup').set('X-Real-IP', URI)
      .send({ email: 'johndoe@exampledomain.com', lastName: 'Doe', firstName: 'John' })
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        done(err);
      });
  });

  it('should CREATE [201] 3 valid users', (done) => {
    _.each(ValidUsers, (VU,i) => {
    request(app)
      .post('/auth/signup').set('X-Real-IP', URI)
      .send(ValidUsers[i])
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.token.should.be.an.instanceOf(String);
        res.body.user.should.be.an.instanceOf(Object);
        ValidUsers[i]._id = res.body.user._id;
        ValidUsers[i].cookie = res.body.token;
        if (i == ValidUsers.length-1)
        done(err);
      });
    })
  });

  it('should FAIL [422] to create a user with occupied email', (done) => {
    request(app)
      .post('/auth/signup').set('X-Real-IP', URI)
      .send(ValidUsers[0])
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.error.should.be.eql('That email address is already in use.');
        done();
      });
  });
});

describe('************* USER LOGIN *************', () => {
  /*before((done) => {
    request(app)
      .post('/auth/signup')
      .set('X-Real-IP', URI)
      .type('form')
      .send(ValidUsers[0])
      .expect(201)
      .end((err) => {
        if (err) done(err);
        done();
      });
  });*/

  /*after((done) => {
    const colls = 'users';
    mongoose.connection.collections[colls].drop(() => done());
  });*/

  it('should FAIL [400] to login without parameters', (done) => {
    request(app)
      .post('/auth/login').set('X-Real-IP', URI)
      .expect(400, done);
  });

  it('should FAIL [400] to login with bad parameters', (done) => {
    request(app)
      .post('/auth/login').set('X-Real-IP', URI)
      .send({ wrongparam: 'err' }).expect(400, done);
  });

  it('should FAIL [401] to login with invalid credentials', (done) => {
    request(app)
      .post('/auth/login').set('X-Real-IP', URI)
      .send({ email: 'err', password: '22' }).expect(401, done);
  });

  it('should LOGIN [200] with valid credential', (done) => {
    request(app)
      .post('/auth/login').set('X-Real-IP', URI)
      .send(ValidUsers[0])
      .expect(200).end((err, res) => {
        if (err) done(err);
        res.body.token.should.be.an.instanceOf(String);
        res.body.user.should.be.an.instanceOf(Object);
        done();
      });
  });
});
