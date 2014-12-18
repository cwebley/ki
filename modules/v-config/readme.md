# v-config

Opinionated config.

## Usage

At the start of your process wait for configs to be loaded:

		// Access anything in /usr/local/vube/config/main.yaml
		var mediaRwCredentials = config.get('db:media:rw');

		// Override configs
		config.set('db:media:rw:username', 'vube-test');

		// Load config files
		config.loadFiles([__dirname+'/mediasvc.yaml']);
