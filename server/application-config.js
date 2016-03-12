applicationConfig = {
  "mail" : {
    "smtp" : {
      "auth" : {
        "pass" : process.env.MAIL_AUTH_PASSWORD ,
        "user" : process.env.MAIL_AUTH_USERNAME
      } ,
      "host" : "smtp.office365.com" ,
      "port" : "25" ,
      "secureConnection" : "false" ,
      "tls" : {
        "ciphers" : "SSLv3"
      }
    }
  }
};

module.exports = applicationConfig;