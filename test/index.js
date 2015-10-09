/*
  Author: Joe Choi <joechoi910@gmail.com>
*/

'use strict';
var expect = require('chai').expect(),
  should = require('chai').should(),
  assert = require('assert'),
  marketo = require('../index'),
  test = require('./test.json');

if (test.clientId===''){
  console.log('To run the proper test, please insert all of your Marketo API variables inside "./test/test.json" file.');
  console.log(test);
}

// start test
describe('marketo-rest-api', function() {

  // test init
  describe('marketo.init(options, callback)', function() {
    it('initializing Marketo API with "./test/test.json" data', function(done) {
      assert.doesNotThrow(function() {
        marketo.init(test, function(response){
          response.token.should.be.an('string');
          done();
        }, 
        function(err) {
          if (err) throw err; 
          done(); 
        });
      });
    });
  });

  // test synLead
  describe('marketo.syncLead(options, callback)', function() {
    
    // test delete lead
    var options = {
      'process': 'remove',
      'list': 'listname_1',
      'email': 'johndoe3@johndoecompany.com'
    };
    it('deleting a lead, ' + JSON.stringify(options), function(done) {
      assert.doesNotThrow(function() {
        marketo.syncLead(options, function(response){
          response.success.should.equal(true);
          done();
        }, 
        function(err) {
          if (err) throw err; 
          done(); 
        });
      });
    });

    // test add lead
    var options = {
      'process': 'add',
      'list': 'listname_1',
      'email': 'johndoe3@johndoecompany.com', 
      'input': {
        'firstName': 'John',
        'lastName': 'Doe',
        'title': 'Techie',
        'phone': '1112223333',
        'company': 'John Doe Company'
      }
    };
    it('adding a lead, ' + JSON.stringify(options), function(done) {
      assert.doesNotThrow(function() {
        marketo.syncLead(options, function(response){
          response.success.should.equal(true);
          done();
        }, 
        function(err) {
          if (err) throw err; 
          done(); 
        });
      });
    });

    // test update lead
    var options = {
      'process': 'update',
      'list': 'listname_1',
      'email': 'johndoe3@johndoecompany.com', 
      'input': {
        'firstName': 'John (updated)',
        'lastName': 'Doe (updated)',
        'title': 'Techie (updated)',
        'phone': '4445556666',
        'company': 'John Doe Company (updated)'
      }
    };
    it('updating a lead, ' + JSON.stringify(options), function(done) {
      assert.doesNotThrow(function() {
        marketo.syncLead(options, function(response){
          response.success.should.equal(true);
          done();
        }, 
        function(err) {
          if (err) throw err; 
          done(); 
        });
      });
    });

  });

  // test sendEmail
  describe('marketo.sendEmail(options, callback)', function() {
    var options = {
      'email': 'johndoe3@johndoecompany.com', 
      'campaign': 'campaignname_1'
    };
    it('sending an email, ' + JSON.stringify(options), function(done) {
      assert.doesNotThrow(function() {
        marketo.sendEmail(options, function(response){
          response.success.should.equal(true);
          done();
        }, 
        function(err) {
          if (err) throw err; 
          done(); 
        });
      });
    });
  });

});

