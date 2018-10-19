'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');
const hydrateNotes = require('../utils/hydrateNotes');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  //const { folderId } = req.query;
  
  knex
    .select(
      'notes.id',
      'title',
      'content',
      'folders.id as folderId',
      'folders.name as folderName',
      'tags.id as tagId', 
      'tags.name as tagName'
    )
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .modify(function(queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function(queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(function(queryBuilder) { 
      if (tagId) { 
        queryBuilder.where('tag_id', tagId); 
      }
    })
    .orderBy('notes.id')
    .then(results => {
      if (results) {
        const hydrated = hydrateNotes(results); 
        res.json(hydrated);
      } else { 
        next(); 
      }
    })
    .catch(err => next(err));
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select(
      'notes.id',
      'title',
      'content',
      'folders.id as folderId',
      'folders.name as folderName', 
      'tags.id as tagId', 
      'tags.name as tagName'
    )
    .from('notes')
    .where('notes.id', id)
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .then(result => {
      if (result && result.length !== 0) {
        console.log('result: ' + result);
        const hydrated = hydrateNotes(result); 
        res.json(hydrated[0]);
      } else { 
        next(); 
      }
    })
    .catch(err => {
      console.log('error' + err);
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const {title, content, folderId, tags} = req.body; 

  /***** Never trust users - validate input *****/
  const updateObj = {
    title: title, 
    content : content, 
    folder_id : folderId, 
  };

  if (!updateObj.title) { 
    const err = new Error('Missing `title` in request body'); 
    err.status = 400; 
    return next(err); 
  }

  knex
    .from('notes')
    .where('notes.id', id)
    .update(updateObj)
    .then(() => { 
      return knex 
        .from('notes_tags')
        .where('notes_tags.note_id', id)
        .del(); 
    })
    .then(() => { 
      const tagsInsert = tags.map(tagId => ({ note_id: id, tag_id: tagId }));
      return knex
        .insert(tagsInsert)
        .into('notes_tags'); 
    })
    .then(() => {
      //res.json(result[0]); 
      return knex
        .select('notes.id', 'title', 'content', 'folder_id as folderId',    'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'folders.id')
        .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
        .where('notes.id', id); 
    })
    .then(result => { 
      if (result && result.length !== 0) {
        const hydrated = hydrateNotes(result)[0]; 
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated); 
      } else { 
        next(); 
      } 
    })
    .catch(err => { 
      next(err); 
    }); 
});


router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body; // Add `folderId` to object destructure

  const newItem = {
    title: title,
    content: content,
    folder_id: folderId, 
    // Add `folderId`
  };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex.insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => { 
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex
        .insert(tagsInsert)
        .into('notes_tags');
    })
    .then(() => {
      // Select the new note and leftJoin on folders and tags
      return knex
        .select('notes.id', 'title', 'content',
          'folders.id as folderId', 'folders.name as folderName',
          'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
        .where('notes.id', noteId);
    })
    .then((result) => {
      if (result && result.length !== 0) {
        // Hydrate the results
        const hydrated = hydrateNotes(result)[0];
        // Respond with a location header, a 201 status and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
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
