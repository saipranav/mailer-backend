application_config = {
	mail: {
		smtp: {
		    host: 'smtp.office365.com',
		    port: '25',
		    secureConnection: 'false',
		    auth: {
		        user: 'xxxx',
		        pass: 'xxxx'
		    },
		    tls: {
		    	ciphers:'SSLv3'
		    }
		}
	}
};

module.exports = application_config;