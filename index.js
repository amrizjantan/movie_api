const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const express = require ('express');
const morgan = require ('morgan');
const uuid = require ('uuid');
const bodyParser = require ('body-parser');
const { title } = require('process');
const app = express ();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const res = require('express/lib/response');

const Genres = Models.Genre;
const Directors = Models.Director;


mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


// morgan
app.use (morgan('common'));

 
//App GET
app.get('/', (req, res) => {
  res.send('Yo welcome to myFlix, check out the movie list! ');
});

// documentation
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});
  

//return json to get all movies
  app.get('/movies', (req, res) => {
    Movies.find()
     .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//return json to get all users
  app.get('/users', (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//Get JSON movie by Movietitle
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Get JSON user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get JSON genre specific NOT OK YET
//app.get('/genres/:Genre', (req, res) => {
  //Movies.findOne({ "Genre.Name": req.params.Name })
    //.then((movie) => {
      //res.json(movie.Genre);
    //})
    //.catch((err) => {
      //console.error(err);
      //res.status(500).send('Error: ' + err);
    //});
//});

// GET data about a genre (description) by name/title 
app.get("/genres/:genre",(req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genre })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

  // GET data about a director (bio, birth year, death year) by name
app.get(
  "/director/:directorName",(req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


// App POST new User
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// App PUT update User NOT OK YET
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//App PUT update a Movie
app.put('/movie/:Title', (req, res) => {
  Users.findOneAndUpdate({ Title: req.params.Title }, { $set:
    {
      Title: req.body.Title,
      Description: req.body.Description,
      Genre: req.body.Genre,
      Director: req.body.Director
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedMovie) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedMovie);
    }
  });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


  

  // static
app.use(express.static('public'));

  // Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// Listener
app. listen (8080, () => {console.log ('Listening on port 8080');
});