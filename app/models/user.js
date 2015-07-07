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
      // bcrypt.hash(password, null, null, function(err, results){
      //   model.set('password', results)
      //   console.log('password is ' + model.get('password'))
      // })
        model.set('password', bcrypt.hashSync(password))
      })
    },
  // checkPassword: function(password, hashPass){
  //   bcrypt.compare(password, hashPass, function(error, result){
  //     if (error) {
  //       return error;
  //     } else {
  //       return result;
  //     }
  //   })
  // },
  // alertme: function() {
  //   console.log('alert')
  // }
});

module.exports = User;
