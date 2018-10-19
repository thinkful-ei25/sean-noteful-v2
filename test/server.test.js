'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Sanity check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});


describe('Static Server', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('Noteful API', function () {
  const seedData = require('../db/seedData');

  beforeEach(function () {
    return seedData('./db/noteful.sql');
  });

  after(function () {
    return knex.destroy(); // destroy the connection
  });

  describe('GET /api/notes', function () {

    it('should return the default of 10 Notes ', function () {
      return chai.request(app)
        .get('/api/notes')
        .then(function (res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return correct search results for a valid searchTerm', function () {
      return chai.request(app)
        .get('/api/notes?searchTerm=moon')
        .then(function (res) {
          console.log('response body: ' + res.body[0].title);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
        });
    });

  });

  describe('404 handler', function() { 
    it('should respond with 404 when given a bad path', function(){ 

    }); 

  }); 

  describe('GEt /api/notes', function(){ 
    it('should return an array of objects wher eeach item contains id, title, and content', function(){ 

    });
    
    it('should respond with a 404 fan an invalid id', function(){ 

    }); 

  }); 

  describe('POST /api/notes', function () {

    it('should create and return a new item when provided valid data', function () {

    });

    it('should return an error when missing "title" field', function () {

    });

  });

  describe('PUT /api/notes/:id', function () {

    it('should update the note', function () {

    });

    it('should respond with a 404 for an invalid id', function () {

    });

    it('should return an error when missing "title" field', function () {

    });



});