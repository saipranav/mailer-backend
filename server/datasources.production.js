module.exports = {
  "db" : {
    "connector" : "memory" ,
    "name" : "db"
  } ,
  "mongodb" : {
    "connector" : "mongodb" ,
    "name" : "mongodb" ,
    "host" : "database-mongo.service.consul" ,
    "port" : 27017
  }
};
