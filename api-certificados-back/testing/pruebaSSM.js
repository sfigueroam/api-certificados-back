'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: "us-east-1"});
const parameterStore = new AWS.SSM()

var params = {
  Path: '/tgr/dev/certificados/back',
  /*ParameterFilters: [
    {
      Key: 'back',
      Option: 'BeginsWith',
      Values: [
        '/tgr/dev/certificados/back',
      ]
    },
  ],*/
  Recursive: true,
  WithDecryption: true
};

parameterStore.getParametersByPath(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

/*
module.exports.get = async (param) => {
  param='/tgr/dev/certificados/back/client-id';
  
  
};*/