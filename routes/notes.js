"use strict";

const express = require("express");

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require("../knex");
// TEMP: Simple In-Memory Database
//const data = require('../db/notes');
//const simDB = require('../db/simDB');
//const notes = simDB.initialize(data);

// Get All (and search by query)

router.get("/", (req, res, next) => {
  const searchTerm = req.query.searchTerm;

  knex
    .select("id", "title", "content")
    .from("notes")
    .modify(function(queryBuilder) {
      if (searchTerm) {
        queryBuilder.where("title", "like", `%${searchTerm}%`);
      }
    })
    .orderBy("notes.id")
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});


// Get a single item
router.get("/:id", (req, res, next) => {
  const id = req.params.id;

  knex
    .from("notes")
    .where("id", id)
    .then(result => console.log(res.json(result[0])))
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put("/:id", (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ["title", "content"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  knex("notes")
    .returning(["id", "title", "content"])
    .where("id", id)
    .update(updateObj)
    .then(result => console.log(res.json(result[0])));
});

// Post (insert) an item
router.post("/", (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error("Missing `title` in request body");
    err.status = 400;
    return next(err);
  }

  knex("notes")
    .returning(["id", "title", "content"])
    .insert(newItem)
    .then(([result]) => {
      res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);
      console.log(result); 
    }).catch(err => { 
      next(err); 
    }); 
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('id', id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(err => { 
      next(err); 
    }); 
});

module.exports = router;
