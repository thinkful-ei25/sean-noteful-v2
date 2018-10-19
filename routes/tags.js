'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

/* ========== POST/CREATE ITEM ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex
    .insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(results => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});

router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id; 

  knex
    .select('id', 'name')
    .from('tags')
    .where('id', id)
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => { 
  const id = req.params.id; 

  const updateObj = {id : id, name : req.body.name}; 

  knex('tags')
    .returning(['id', 'name'])
    .where('tags.id', id)
    .update(updateObj)
    .then(result => { 
      res.json(result[0]); } )
    .catch(err => next(err));
}); 

router.post('/', (req, res, next) => { 
  const newObject = {name: req.body.name}; 

  knex('tags')
    .returning(['id', 'name'])
    .insert(newObject)
    .then( result => { 
      res.json(result); 
    })
    .catch(err => { 
      next(err); 
    }); 
}); 

router.delete('/:id', (req, res, next) => { 
  const id = req.params.id; 

  knex('tags')
    .where('id', id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(err => next(err)); 
}); 

module.exports = router;
