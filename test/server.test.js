'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Sanity check', function() {
  it('true should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.equal(4);
  });
});

describe('Static Server', function() {
  it('GET request "/" should return the index page', function() {
    return chai
      .request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('Noteful API', function() {
  const seedData = require('../db/seedData');

  beforeEach(function() {
    return seedData('./db/noteful.sql');
  });

  after(function() {
    return knex.destroy(); // destroy the connection
  });

  describe('GET /api/notes', function() {
    it('should return the default of 10 Notes ', function() {
      return chai
        .request(app)
        .get('/api/notes')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return correct search results for a valid searchTerm', function() {
      return chai
        .request(app)
        .get('/api/notes?searchTerm=moon')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
        });
    });
  });

  describe('404 handler', function() {
    it('should respond with 404 when given a bad path', function() {
      return chai
        .request(app)
        .get('/api/PATHDOESNOTEXISTS/REALLYDOESNTEXIST')
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('Get /api/notes', function() {
    it('should return an array of objects where each item contains id, title, and content', function() {
      return chai
        .request(app)
        .get('/api/notes')
        .then(function(res) {
          expect(res.body).to.be.a('array');
          res.body.forEach(function(item) {
            expect(item).to.be.a('object');
            expect(item).to.contain.keys('id', 'title', 'content');
          });
        });
    });

    it('should return an empty array for an incorrect searchTerm', function() {
      return chai
        .request(app)
        .get('/api/notes?searchTerm=pizza')
        .then(function(res) {
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(0);
        });
    });
  });

  describe('GET /api/notes/:id', function() {
    it('should return correct note when given an id', function() {
      const newItem = {
        id: 2,
        title: 'There is no greater love',
        content: 'Can there be no greater thing than cheese$1',
        folderId: 1,
        folderName: 'Archive',
        tagId: 3,
        tagName: 'BOXING'
      };
      return chai
        .request(app)
        .get('/api/notes/2')
        .then(function(res) {
          expect(res.body).to.contain.keys('id', 'title', 'content');
          expect(res.body.title).to.deep.equal(newItem.title);
          expect(res.body.content).to.deep.equal(newItem.content);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      return chai
        .request(app)
        .get('/api/notes/1000000000')
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/notes', function() {
    const newItem = {
      title: 'have a very spooky cherry tree',
      content: 'spark the thought',
      folder_id: 1,
      tags: []
    };

    it('should create and return a new item when provided valid data', function() {
      return chai
        .request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(res) {
          expect(res).to.have.status(201);
        });
    });

    it('should return an error when missing "title" field', function() {
      const newItem = {
        content: 'Can there be no greater thing than cheese$1',
        folderId: 1,
        folderName: 'Archive',
        tags: []
      };
      return chai
        .request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(res) {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('PUT /api/notes/:id', function() {
    it('should update the note', function() {
      const newItem = {
        title: 'have a very spooky cherry tree',
        content: 'spark the thought',
        folder_id: 1,
        tags: []
      };
      return chai
        .request(app)
        .put('/api/notes/10')
        .send(newItem)
        .then(function(res) { 
          expect(res).to.have.status(201); 
          expect(res.body.title).to.deep.equal(newItem.title); 

        }); 
    });

    //it('should respond with a 404 for an invalid id', function() {});

    //it('should return an error when missing "title" field', function() {});
  });

  // describe('DELETE  /api/notes/:id', function() {
  //   it('should delete an item by id', function() {});
  // });
});
