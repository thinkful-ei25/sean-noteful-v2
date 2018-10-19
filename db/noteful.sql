-- psql -U dev -d noteful-app -f /Users/anonymous/Developer/Thinkful/ei25/noteful-app-v2/db/noteful.sql
DROP TABLE IF EXISTS notes_tags; 
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes; 
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE notes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text,
  created timestamp DEFAULT now(),
  folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

CREATE TABLE tags ( 
  id serial PRIMARY KEY, 
  name text UNIQUE NOT NULL
); 

CREATE TABLE notes_tags ( 
  note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE, 
  tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
); 

-- ALTER SEQUENCE folders_id_seq RESTART WITH 103;
INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

INSERT INTO tags (name) VALUES 
  ('Meta'), 
  ('TV'),
  ('BOXING'), 
  ('FOOD'), 
  ('Happy Crappy'); 
 
-- ALTER TABLE notes 
-- ADD COLUMN folder_id int REFERENCES folders(id) ON DELETE SET NULL;
INSERT INTO notes (title, content, folder_id) VALUES
  (
    '5 life lessons learned from cats',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
    1
  ), 
  (
    'There is no greater love', 
    'Can there be no greater thing than cheese?',
    1
  ), 
  ( 
    '20 Days till the big cheese gets closer than the moon', 
    'Cheese can be so so good it makes me cry',
    1
  ), 
  ( 
    'Please wake me up', 
    'When there is more cheese to be had', 
    1
  ), 
  ( 
    'Inside the outside grilled cheeseburger about 20cats', 
    'When there is more cheese to be had', 
    1
  ), 
  (
    'Cant take the longing that I feel for you', 
    'sadness can be bearable when...',
    2
  ),
  (
    'Grass on the prarie, have some more dairy', 
    'Picnics were fun in the summer... summer is no longer',
    2
  ),
  (
    'It is cold in here!', 
    'Why is it so so so cold in here!!!', 
    3
  ), 
  (
    'BRRRRRRR', 
    'Take me out in the warmness please for vacation', 
    1
  ), 
  (
    'HAHAHAHAHHAAHA', 
    'I am a maniacal madman....wowowoeoeoeoe', 
    2
  );  

INSERT INTO notes_tags (note_id, tag_id) VALUES 
  ( 
    1, 2
  ),
  (
    1, 3
  ),
  ( 
    1, 2
  ),
  (
    2, 3
  ),
  (
    2, 3
  ),
  (
    3, 2
  ), 
  (
    4, 2
  ), 
  (
    4, 3
  )
  ; 
