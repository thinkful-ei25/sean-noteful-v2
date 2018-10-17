'use strict';

const knex = require('../knex');

let searchTerm = "gaga";

const id = 116; 

// knex
//   .select("notes.id", "title", "content")
//   .from("notes")
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where("title", "like", `%${searchTerm}%`);
//     }
//   })
//   .orderBy("notes.id")
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//(done) Get All Notes accepts a searchTerm and finds notes with titles
//which contain the term. It returns an array of objects.

//Get Note By Id accepts an ID. It returns the note as an object not an array

// knex
//   .from('notes')
//   .where('id', id)
//   .then(result => console.log(result[0])); 

//Update Note By Id accepts an ID and an object with the desired updates. 
//It returns the updated note as an object
// knex('notes')
//   .returning(['id', 'title', 'content'])
//   .where('id', id)
//   .update({title : 'porcupine goddess', content : 'very very pointy content'})
//   .then(result => console.log(result[0])); 

//Create a Note accepts an object with the note properties and inserts it in 
//the DB. It returns the new note (including the new id) as an object.
knex('notes')
  .returning(['id', 'title', 'content'])
  .insert({title : 'hi', content : 'why  goodbye?'})
  .then(([result]) => { console.log(result); } ); 

//Delete Note By Id accepts an ID and deletes the note from the DB.Delete Note By Id accepts an ID and deletes the note from the DB.
// knex('notes')
//   .where('id', id)
//   .delete()
//   .then(); 
