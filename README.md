#marketo-rest-api
=========

marketo-rest-api is a NodeJs interface for Marketo REST API @ http://developers.marketo.com/documentation/rest/. Syncs leads and sends email campaigns via Marketo platform.

## Installation

```sh
$ npm install marketo-rest-api
```

## Marketo API Requirement

Marketo API's client id, client secret and rest endpoint are required.
Follow the instruction @ http://developers.marketo.com/blog/quick-start-guide-for-marketo-rest-api/ to sign up for Marketo Rest API.

## Usage

### init(options, callback);
Initialize marketo-rest-api with your Marketo confirgurations including campaigns and lists. 

```js
var marketo = require('marketo-rest-api');
var options = {
	'clientId': 'xxxxx',
	'clientSecret': 'yyyyy',
	'restEndpoint': 'https://...',
	'lists': {
		'listname_1': 1001,
		'listname_2': 1002,
		...
	},
	'campaigns': {
		'campaignname_1': 2001,
		'campaignname_2': 2002,
		...
	},
};
marketo.init(options, function(response){
    console.log(response);
});
```

### syncLead(options, callback);
Sync leads on Marketo lead database and associates the lead to Marketo list. 

```js
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
```

### sendEmail(options, callback);
Schedules Marketo to send an email campaign to selected user.

```js
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
```

### scheduleCampaign(options, callback);
Schedules campaign in Marketo.

```js
var options: {
	'campaign': 'campaignname from 'campaigns':{...} in init()', 
	'runAt': '2020-02-22T23:59:00.000Z',
	'tokens': [
		{'name': '{{token1_name}}', 'value': 'some value'},
		{'name': '{{token2_name}}', 'value': 'some value'},
		...
	]}
}
marketo.scheduleCampaign(options, function(response){
	console.log(response);
});
```

## Tests

Before running test for the first time, provide Marketo API values in ./test/test.json. 

```sh
$ npm test
```

## Release History

* 0.2.0 Schedule Campaign added
* 0.1.0 Initial release
