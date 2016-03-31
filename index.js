/*
  Author: Joe Choi <joechoi910@gmail.com>
*/
'use strict';
var _ = require('underscore'),
  request = require('request'),
  clientId,
  clientSecret,
  restEndpoint,
  lists,
  campaigns,
  accessToken,
  leadId;

/*
  init(options, callback);
  Initiates Marketo API interface.

  Example:
  var options = {
    'clientId': '',
    'clientSecret': '',
    'restEndpoint': '',
    'lists': {
      'listname_1': listid_1,
      'listname_2': listid_2,
      ...
    },
    'campaigns': {
      'campaignname_1': campaignid_1,
      'campaignname_2': campaignid_2,
      ...
    },
  };
  marketo.init(options, function(response){
    console.log(response);
  });

  Success:
  { 'success': true, 'message': 'Marketo API variable are loaded OK and authenticated.', 'token': 'aaaaaa-bbbbbb-cccccc' }

  Error:
  { 'success':false, 'error':'Error message.' }
*/
exports.init = function (options, callback) {
  if(options.debug) console.log(options);
  clientId = options.clientId;
  clientSecret = options.clientSecret;
  restEndpoint = options.restEndpoint;
  lists = options.lists;
  campaigns = options.campaigns;
  authenticate(processInit, options, callback);
};

/*
  syncLead(options, callback);
  Sync leads on Marketo lead database and associates the lead to Marketo list.

  Example:
  var options: {
    'process': 'add' || 'update' || 'remove',
    'list': 'listname from 'lists':{...} in init()',
    'input': {
      'email': 'user@email.com',
      'firstName': 'John',
      'lastName': 'Doe',
      'title': 'Techie',
      'phone': '1112223333',
      'company': 'John Doe Company',
      'custom_field_1': 'custom_value_1',
      'custom_field_2': 'custom_value_2',
      ...
    }
  }
  marketo.syncLead(options, function(response){
    console.log(response);
  });

  Success:
  { 'success':true, 'message':'Lead Id ___ is successfully added to Marketo.' }

  Error:
  { 'success':false, 'error':'Error message.' }
*/
exports.syncLead = function (options, callback) {
  if(options.debug) console.log(options);
  authenticate(processSyncLead, options, callback);
};

/*
  sendEmail(options, callback);
  Schedules Marketo to send an email campaign to selected user.

  Example:
  var options: {
    'email': 'user@email.com',
    'campaign': 'campaignname from 'campaigns':{...} in init()',
    'tokens': [
      {'name': '{{token1_name}}', 'value': 'some value'},
      {'name': '{{token2_name}}', 'value': 'some value'},
      ...
    ]}
  }
  marketo.sendEmail(options, function(response){
    console.log(response);
  });

  Success:
  { 'success':true, 'message':'"confirm" email is sent to user@email.com.' }

  Error:
  { 'success':false, 'error':'Error message.' }
*/
exports.sendEmail = function (options, callback) {
  if(options.debug) console.log(options);
  authenticate(processSendEmail, options, callback);
};

/*
  After Marketo API variables are loaded, verify authentication and return token if authenticated.
*/
var processInit = function (options, callback){
  callback({'success':true, 'message':'Marketo API variable are loaded OK and authenticated.', 'token':accessToken});
};

/*
  After authenticated with Marketo API, execute lead sync job using Marketo API.

  For add & update lead,
    1) add or update lead
    2) add lead to list
  For remove lead,
    1) get lead id
    2) remove lead
    3) remove lead from list
*/
var processSyncLead = function (options, callback){
  var listId = '';
  if(options.list && lists[options.list]) {
    listId = lists[options.list];
  }
  switch(options.process.toLowerCase()){
    case 'add':
    case 'update':
      // 1) add or update lead
      addOrUpdateLead(options, function(response){
        if(options.debug) console.log('addOrUpdateLead:' + response.success);
        if(response.success === true){

          // 2) associate lead to list
          var leadId = response.leadId;
          var message = (options.process.toLowerCase() === 'add') ? 'Lead Id ' + leadId + ' is successfully added to Marketo.' : 'Lead Id ' + leadId + ' is successfully updated in Marketo.';
          if(listId !== '') {
            addLeadToList(leadId, listId, function(response){
              if(options.debug) console.log('addLeadToList:' + response.success);
              response.leadId = leadId;
              if(response.success === true){
                callback(response);
              }
              else{
                callback(response);
              }
            });
          }
          else{
            callback(response);
          }
        }
        else{
          callback(response);
        }
      });
      break;

    case 'remove':
      // 1) get lead id
      getLeadId(options.email, function(response){
        if(options.debug) console.log('getLeadId:' + response.success);
        if(response.success === true){

          // 2) remove lead
          var leadId = response.leadId;
          removeLead(leadId, function(response){
            if(options.debug) console.log('removeLead:' + response.success);
            if(response.success === true){

              // 3) remove lead from list
              if(listId !== '') {
                removeLeadFromList(leadId, listId, function(response){
                  if(options.debug) console.log('removeLeadFromList:' + response.success);
                  if(response.success === true){
                    response.message='Lead Id ' + leadId + ' is successfully removed from Marketo.';
                    callback(response);
                  } else{
                    response.success=false;
                    callback(response);
                  }
                });
              } else{
                response.message='Lead Id ' + leadId + ' is successfully removed from Marketo.';
                callback(response);
              }
            } else{
              response.success=false;
              callback(response);
            }
          });
        } else{
          response.success=false;
          callback(response);
        }
      });
      break;
  }
};

/*
  After authenticated with Marketo API, execute schedule campaign API call.
  1) get lead id
  2) request campaign
*/
var processSendEmail = function (options, callback){
  var campaignId = campaigns[options.campaign];
  if (typeof campaignId === 'undefined'){
    callback({'success':false, 'error':'campaignId is not found.'});
    return;
  }
  // 1) get lead id
  getLeadId(options.email, function(response){
    if(options.debug) console.log('getLeadId:' + response.success);
    if(response.success === true){

      // 2) request campaign
      var leadId = response.leadId;
      requestCampaign(campaignId, leadId, options.tokens, function(response){
        if(options.debug) console.log('requestCampaign:' + response.success);
        if(response.success === true){
          callback({'success':true, 'message':'"' + options.campaign + '" email has been sent to ' + options.email + '.'});
        }
        else{
          callback({'success':false, 'error':response.error});
        }
      });
    }
    else{
      callback({'success':false, 'error':response.error});
    }
  });
};

/*
  Authenticate to Marketo and store access token.
  Access token will expire every 1 hour by default.
  http://developers.marketo.com/documentation/rest/authentication/
*/
var authenticate = function (authCallback, options, callback) {
  var url = restEndpoint + 'identity/oauth/token?grant_type=client_credentials' + "&client_id=" + clientId + "&client_secret=" + clientSecret;
  request({
      method: 'GET',
      url: url,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body) && body.access_token) {
        accessToken = body.access_token;
        authCallback(options, callback);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo authentication failed.';
        callback(response);
      }
  });
};

/*
  Returns request header for Marketo API.
*/
var header = function () {
  var header = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken,
  };
  return header;
}

/*
  Returns lead id by matching email.
  http://developers.marketo.com/documentation/rest/get-multiple-leads-by-filter-type/
*/
var getLeadId = function (email, callback) {
  var url = restEndpoint + 'rest/v1/leads.json?access_token=' + accessToken + '&filterType=email&filterValues=' + _.escape(email);
  request({
      method: 'GET',
      headers: header(),
      url: url,
      json: true,
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body.result) && body.success === true) {
        response.success = true;
        response.leadId = body.result[0].id;
        callback(response);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Get Lead Id by Email API failed.';
        callback(response);
      }
  });
}

/*
  Adds Marketo lead to Marketo list.
  http://developers.marketo.com/documentation/rest/add-leads-to-list/
*/
var addLeadToList = function (leadId, listId, callback) {
  var url = restEndpoint + 'rest/v1/lists/' + listId + '/leads.json?access_token=' + accessToken;
  var data = {
    'input': [{
      'id': leadId
    }]
  };
  request({
      method: 'POST',
      headers: header(),
      url: url,
      body: data,
      json: true,
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body) && body.success === true && body.result[0].id) {
        response.success = true
        callback(response);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Add Lead to List API failed.';
        callback(response);
      }
  });
};

/*
  Removes Marketo lead from Marketo list.
  http://developers.marketo.com/documentation/rest/remove-leads-from-list/
*/
var removeLeadFromList = function (leadId, listId, callback) {
  var url = restEndpoint + 'rest/v1/lists/' + listId + '/leads.json?access_token=' + accessToken + '&_method=DELETE';
  var data = {
    'input': [{
      'id': leadId
    }]
  };
  request({
      method: 'POST',
      headers: header(),
      url: url,
      body: data,
      json: true,
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body) && body.success === true && body.result[0].id) {
        response.success = true;
        callback(response);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Remove Lead from List API failed.'
        callback(response);
      }
  });
};

/*
  Adds or updates lead from Marketo.
  http://developers.marketo.com/documentation/rest/createupdate-leads/
*/
var addOrUpdateLead = function (options, callback){
  var url = restEndpoint + 'rest/v1/leads.json?access_token=' + accessToken;
  var data = {
    'action': 'createOrUpdate',
    'lookupField': 'email',
    'input': [options.input]
  };
  data.input[0].email = options.email;
  request({
      method: 'POST',
      headers: header(),
      url: url,
      body: data,
      json: true,
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body) && body.success === true && body.result[0].id) {
        response.success = true;
        response.leadId = body.result[0].id;
        callback(response);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Add & Edit Lead API failed.';
        callback(response);
      }
  });
};

/*
  Removes lead from Marketo.
  http://developers.marketo.com/documentation/rest/delete-lead/
*/
var removeLead = function (leadId, callback){
  var url = restEndpoint + 'rest/v1/leads.json?access_token=' + accessToken;
  var data = {
    'input': [{
      'id': leadId
    }]
  };
  request({
      method: 'DELETE',
      headers: header(),
      url: url,
      body: data,
      json: true,
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body.result) && body.success === true && body.result[0].id) {
        response.success = true;
        callback(response);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Remove Lead API failed.';
        callback(response);
      }
  });
};

/*
  Associates lead with marketo cookie
  http://developers.marketo.com/documentation/rest/associate-lead/
*/
exports.associateLeadWithCookie = function (leadId, cookieId, callback) {
  var token = '?access_token=' + accessToken;
  var cookie = '&cookie=' + cookieId.replace('&', '%46');
  var url = restEndpoint + 'rest/v1/leads/' + leadId + '/associate.json' + token + cookie;
  request({
    'method': 'POST',
    'headers': header(),
    'url': url,
    'data': {}
  }, function (error, response, body) {
    if (!error && response.statusCode === 200 && !_.isEmpty(body.result) && body.success === true && body.result[0].id) {
        response.success = true;
        callback(response);
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Associate Lead API failed.';
        callback(response);
      }
  });
}

/*
  Requests campaign in Marketo.
  http://developers.marketo.com/documentation/rest/request-campaign/
*/
var requestCampaign = function (campaignId, leadId, tokens, callback){
  var url = restEndpoint + 'rest/v1/campaigns/' + campaignId + '/trigger.json?access_token=' + accessToken;
  var data = {
    'input': {
      'leads': [{
        'id': leadId
      }],
    }
  };
  // add tokens if exists
  if (tokens && tokens.length > 0){
    data.input.tokens = tokens;
  }
  request({
      method: 'POST',
      headers: header(),
      url: url,
      body: data,
      json: true,
  }, function (error, response, body) {
      if (!error && response.statusCode === 200 && !_.isEmpty(body.result) && body.success === true && body.result[0].id) {
        response.success = true;
        response.campaignId = body.result[0].id;
        callback({'success':true, 'campaignId':response});
      }
      else{
        response = response || {};
        response.success = false;
        response.error = error;
        response.message = 'Marketo Request Campaign API failed.';
        callback(response);
      }
  });
};

