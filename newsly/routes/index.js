var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// GET Request
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

// POST route for creating posts
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post) {
    if(err){ return next(err); }

    res.json(post);
  });
});

// route for automatically preloading post objects ****uses Expressjs' param() function****
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);
  // Use's mongoose's query interface which provides a more flexible way of interacting with the database.
  query.exec(function (err, post) {
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

// Route for returning a single post
router.get('/posts/:post', function(req, res) {
  res.json(req.post);
});

// route for adding upvotes
router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

module.exports = router;
