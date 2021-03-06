// Require necessary modules
const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");
const Movies = Models.Movie;
const Users = Models.User;

// Mongoose connection to database for CRUD operations
//For online host
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Express and morgan
const express = require("express");
const morgan = require("morgan");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use CORS
//allow all
const cors = require("cors");
app.use(cors());

//use Auth.js
let auth = require("./auth")(app);

//express to return all static files in public folder
app.use(express.static("public"));

//morgan for logging
app.use(morgan("common"));

//use Passport
const passport = require("passport");
require("./passport");

const Genres = Models.Genre;
const Directors = Models.Director;

const uuid = require("uuid");

const { title } = require("process");

/**
 * Welcome page
 * @method get
 * @returns {string} - welcome message
 */
app.get("/", (req, res) => {
  res.send("Heyhey welcome to myFlix, check out the movie list! ");
});

// documentation page
app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

/**
 * Endpoint to GET entire movie database.
 * @method get
 * @param {string} endpoint - endpoint to fetch movies "url/movies"
 * @returns {object} - JSON object of all movies' data
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get all users
 * @method get
 * @param {string} endpoint - endpoint to fetch all users  "url/users"
 * @requires authentication JWT
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).sent("Error" + err);
      });
  }
);

/**
 * Get single movie by title
 * @method get
 * @param {string} endpoint - endpoint to fetch single movie "url/movies/:Title"
 * @requires authentication JWT
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Endpoint to GET single user object by username.
 * @method get
 * @param {req.headers} object - headers {"Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object of user details.
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        const userData = {
          _id: user._Id,
          Username: user.Username,
          Email: user.Email,
          Birthday: user.Birthday,
          FavoriteMovies: user.FavoriteMovies,
        };
        res.json(userData);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get single genre by name
 * @method get
 * @param {string} endpoint - endpoint to fetch single genre "url/genres/:genre"
 * @requires authentication JWT
 */
app.get(
  "/genres/:genre",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genre })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get director by name
 * @method get
 * @param {string} endpoint - endpoint to fetch director by name "url/director/:directorName
 * @requires authentication JWT
 */
app.get(
  "/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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

/**
 * Endpoint to POST (add) a single movie by id to user favorites.
 * @method post
 * @param {req.headers} object - headers {"Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object of updated user details.
 */
app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Endpoint to PUT (update) a single user object by username.
 * @method put
 * @param {req.headers} object - headers {"Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object of updated user details.
 */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],

  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Endpoint to POST (add) a single movie by id to user favorites.
 * @method post
 * @param {req.headers} object - headers {"Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object of updated user details.
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Endpoint to DELETE a single movie by id from user favorites.
 * @method delete
 * @param {req.headers} object - headers {"Authorization" : "Bearer <jwt>"}
 * @returns {object} - JSON object of updated user details.
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Endpoint to DELETE a user.
 * @method delete
 * @param {req.headers} object - headers {"Authorization" : "Bearer <jwt>"}
 * @returns {string} - confirmation message.
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Listener
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
