marketo-rest-api
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

First, initialize marketo-rest-api with your Marketo confirgurations including campaigns and lists. 

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
```js

## Tests

Before running test for the first time, provide Marketo API values in ./test/test.json. 

```sh
$ npm test
```

## Release History

* 0.1.0 Initial release
