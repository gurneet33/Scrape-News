const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const exphbs = require("express-handlebars");
const cheerio = require("cheerio");
const axios = require("axios");

var PORT = process.env.port || 4000;
var db = require("./models");
var app = express();

// morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/MongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
// mongoose.connect(MONGODB_URI);

var result = [];

// Routes

// A GET route for scraping the NYT website
app.get('/', function (req, res) {
    var query = db.Article.find({}).limit(20);
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('scrapedArticles', { docs: docs });
    });
});

app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.nytimes.com/section/science").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href")
            // result.link = $(this)
            //     .children("a")
            //     .attr("href");
            console.log(result.title)
            // Create a new Article using the `result` object built from scraping

            // results.push(result);

            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });

        });

        // Send a message to the client
        res.send("Scrape Complete");
        // res.render("scrapedArticles", {
        //     result: result
        // });
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find()
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.render("articles", {
                data: dbArticle
            });
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Notes.create(req.body)
        .then(function (dbNotes) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { notes: dbNotes._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

//route for saving articles
app.get("/saved", function (req, res) {
    // Grab particular document in the Articles collection
    db.Article.find({ saved: true })
        // ..and populate all of the notes associated with it
        // .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            // db.SavedArticles.create(dbArticle)
            res.render("savedArticles", {
                articles: dbArticle
            })
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.put("/saved/:id", function (req, res) {
    db.Article.findByIdAndUpdate(
        req.params.id, {
            $set: req.body
        }, {
            new: true
        })
        .then(function (dbArticle) {
            // res.render("savedArticles", {
            //     articles: dbArticle
            // })
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});

// app.get("/saveArticle/:id", function (req, res) {
//     // Grab particular document in the Articles collection
//     db.Article.findOne({ _id: req.params.id })
//         // ..and populate all of the notes associated with it
//         // .populate("note")
//         .then(function (dbArticle) {
//             // If we were able to successfully find an Article with the given id, send it back to the client
//             // db.SavedArticles.create(dbArticle)
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         });
// });

// app.post("/saveArticle/:id", function (req, res) {
//     // Create a new note and pass the req.body to the entry
//     db.SavedArticles.create(req.body)
//         .then(function (dbSavedArticles) {
//             // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//             // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//             // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//             res.json(dbSavedArticles);
//         })

//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         });
// });

// app.get("/showArticles", function (req, res) {
//     db.SavedArticles.find({})
//         .then(function (dbArticle) {
//             // If we were able to successfully find an Article with the given id, send it back to the client
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         })
// });



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

