const express = require('express');
const morgan = require ('morgan');
const bodyParser = require ('body-parser');
const app = express ();

// morgan
app.use (morgan('common'));

// bodyParser
app.use (bodyParser.json());

// static
app.use(express.static('public'));


let dopeMovies = [
    {
      title: 'Blade',
      director: 'Stephen Norrington'
    },
    {
      title: 'The Matrix',
      director: 'Lana Wachowski'
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

  app.get('/', (req, res) => {
    res.send('Hey welcome to myFlx! Check out the Movie list! ');
  });
  
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });
  
  app.get('/movies', (req, res) => {
    res.json(dopeMovies);
  });

  app.get('/description', (req,res) => {
    res.send ('....coming soon!');
  });


  // Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

// Listener
app. listen (8080, () => {console.log ('Listening on port 8080');
});