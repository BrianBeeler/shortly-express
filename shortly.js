var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.use(session({
  secret: 'Whatapieceofworkismanhownobleinreasonhowinfiniteinfacultiyinformandmovementhowexpressandadmirable',
  resave: false,
  saveUnitialized: true
}))

app.get('/', util.checkSession,
function(req, res) {
  res.render('index');
});

app.get('/login',
function(req, res) {
  res.render('login');
});

app.get('/logout',
function(req, res) {
  req.session.destroy(function(err) {
    if (err) throw err
  })
  res.redirect("/login");
})

app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.get('/create', util.checkSession,
function(req, res) {
  res.render('index');
});

app.get('/links', util.checkSession,
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});


app.post('/links', util.checkSession,
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.post('/login',
function(req,res){
  var userLogin = new User({
    username: req.body.username
    })
  userLogin.fetch().then(function(found) {
    if (found) {
      console.log(req.body.password)
      console.log(found.get('password'))
      bcrypt.compare(req.body.password, found.get('password'), function(err, result) {
        if (err) throw err
        if(result) {
          util.createSession(req, res, found)
        } else {
          console.log('password is incorrect')
          res.redirect('/login')
        }

          // if (result) {
          //   var key = util.APIKeyGen()
          //   new Session({
          //     userid : found.get('id'),
          //     apitoken : key
          //   }).save().then(
          //     res.send(201, {apiKey : key})
          //   )

      })
    } else {
      console.log('user not found')
      res.redirect('/login')
    }
  })
})

app.post('/signup',
function(req,res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
    })
  console.log(user)
  user.save().then(function(newUser) {
    Users.add(newUser);
    return res.redirect('/login');
  })
})
/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
