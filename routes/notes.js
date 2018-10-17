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
  const { searchTerm } = req.query;
  const { folderId } = req.query;
  knex
    .select(
      "notes.id",
      "title",
      "content",
      "folders.id as folderId",
      "folders.name as folderName"
    )
    .from("notes")
    .leftJoin("folders", "notes.folder_id", "folders.id")
    .modify(function(queryBuilder) {
      if (searchTerm) {
        queryBuilder.where("title", "like", `%${searchTerm}%`);
      }
    })
    .modify(function(queryBuilder) {
      if (folderId) {
        queryBuilder.where("folder_id", folderId);
      }
    })
    .orderBy("notes.id")
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get a single item
router.get("/:id", (req, res, next) => {
  const id = req.params.id;

  knex
    .select(
      "notes.id",
      "title",
      "content",
      "folders.id as folderId",
      "folders.name as folderName"
    )
    .from("notes")
    .where("notes.id", id)
    .leftJoin("folders", "notes.folder_id", "folders.id")
    .then(result => {
      console.log("result: " + result);
      res.json(result[0]);
    })
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
    .then(result => {
      //res.json(result[0]); 
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id); 
    })
    .then(([result]) => { 
      res.json(result); 
    })
    .catch(err => { 
      next(err); 
    }); 
});


router.post("/", (req, res, next) => {
  const { title, content, folderId } = req.body; // Add `folderId` to object destructure

  const newItem = {
    title: title,
    content: content,
    folder_id: folderId // Add `folderId`
  };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error("Missing `title` in request body");
    err.status = 400;
    return next(err);
  }

  let noteId;

  // Insert new note, instead of returning all the fields, just return the new `id`
  knex
    .insert(newItem)
    .into("notes")
    .returning("id")
    .then(([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex
        .select(
          "notes.id",
          "title",
          "content",
          "folder_id as folderId",
          "folders.name as folderName"
        )
        .from("notes")
        .leftJoin("folders", "notes.folder_id", "folders.id")
        .where("notes.id", noteId);
    })
    .then(([result]) => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});

// Delete an item
router.delete("/:id", (req, res, next) => {
  const id = req.params.id;

  knex("notes")
    .where("id", id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(err => {
      next(err);
    });
});

module.exports = router;
