# v-log

A logger

## Example

	var log = require('../v-log');

	//Log an error event
	log.error('v-config:empty-get', {key: key});

	//Log an error event with a stack trace
	log.trace(new Error('v-config:empty-get'), {key: key});
