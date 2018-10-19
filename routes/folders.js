'use strict';

const express = require('express');


const knex = require('../knex');
const router = express.Router();

router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => { 
  const id = req.params.id; 

  knex 
    .select('id', 'name')
    .from('folders')
    .where('id', id)
    .then(results => { 
      res.json(results); 
    })
    .catch(err => next(err));  
}); 

router.put('/:id', (req, res, next) => { 
  const id = req.params.id; 

  const updateObj = {id : id, name : req.body.name}; 

  knex('folders')
    .returning(['id', 'name'])
    .where('folders.id', id)
    .update(updateObj)
    .then(result => { 
      res.json(result[0]); } )
    .catch(err => next(err));
}); 

router.post('/', (req, res, next) => { 
  const newObject ={name: req.body.name}; 

  knex('folders')
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

  knex('folders')
    .where('id', id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(err => next(err)); 
}); 

module.exports = router;