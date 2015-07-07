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

      // bcrypt.hash(username, null, null, function(err, results){
      //   model.set('username', results)
      //   console.log('username is ' + model.get('username'))
      // })
      // bcrypt.hashSync(password, null, null, function(err, results){
      //   model.set('password', results)
      //   console.log('password is ' + model.get('password'))
      // })
        model.set('password', bcrypt.hashSync(password))
      })
    }
});

module.exports = User;
