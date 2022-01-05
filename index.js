const express = require ('express');
const morgan = require ('morgan');
const uuid = require ('uuid');
const bodyParser = require ('body-parser');
const app = express ();

// morgan
app.use (morgan('common'));

// bodyParser
app.use (bodyParser.json());


let movies = [
    {
      title: 'Blade',
      director: 'Stephen Norrington'
    },
    {
      title: 'The Matrix',
      director: 'Lana'
    },
    {
      title: 'The Shawshank Redemption',
      director: 'Frank Darabont'
    },
    {
      title: 'Oldboy',
      director: 'Park Chan-wook'
    },
    {
      title: 'The Handmaiden',
      director: 'Park Chan-wook'
    },
    {
      title: 'The Grandmaster',
      director: 'Wong Kar-Wai'
    },
    {
      title: 'Goodfellas',
      director: 'Martin Scorsese'
    },
    {
      title:'The Godfather',
      director: 'Francis Ford Coppola'
    },
    {
      title: 'Seven Samurai',
      director: '	Akira Kurosawa'
    },
    {
      title: 'Undercover Brother',
      director: 'Malcolm D. Lee'
    }
  ];    

  //App GET
  app.get('/', (req, res) => {
    res.send('Hey welcome to myFlx! Check out the Movie list! ');
  });
  
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });
  
  app.get('/movies', (req, res) => {
    res.json(movies);
  });

  app.get('/description', (req,res) => {
    res.send ('....coming soon!');
  });

  //Get data about a specific movie by title
  app.get('/movies/:title', (req, res) => {
    const { title } = req. params;
    const movie = movies.find (movie => movie.title === title);
      if (movie) {
          res.status (200). json(movie);
      } else {
        res.status (400).send ('no such movie')
      }
  });

  //Get data about directors
  app.get('/directors/:name', (req, res) => {
  res.send("Info about the director by name");
  });


    //App POST
    //registration
    app.post('/users', (req, res) => {
      res.send('Registration completed');
    });

    //registration bad request test
    app.post('/test', (req, res) => {
     let newUser = req.body;
     if (!newUser.name) {
     const message = 'Please add name';
     res.status(400).send(message);
      } else {
     newUser.id = uuid.v4();
     users.push(newUser);
     res.status(201).send(newUser); 
     }
     });


    //add movie
    app.post('/users/:username/movies/:movieID', (req, res) => {
      res.send('Movie was added to the favorite list');
    });


    //App PUT
    //update user info
    app.put('/users/:username', (req, res) => {
    res.send('Information updated');
    });


    //App DELETE
    // delete user
    app.delete('/users/:username', (req, res) => {
      res.send('Your account was sadly deleted!');
    });

    //delete movie
    app.delete('/users/:username/movies/:movieID', (req, res) => {
      res.send('Movie was deleted');
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