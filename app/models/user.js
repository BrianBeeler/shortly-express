var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var username = model.get('username')
      var password = model.get('password')

      bcrypt.hash(username, null, null, function(err, results){
        model.set('username', results)
      })
      bcrypt.hash(password, null, null, function(err, results){
        model.set('password', results)
      })
    })
  }
});

module.exports = User;
