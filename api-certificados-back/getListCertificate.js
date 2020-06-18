'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1"});
const s3 = new AWS.S3();

module.exports.handler = (event, context, callback) => {
    console.log("event:", event);
    return new Promise((resolve, reject) => {
        let path = "config/properties/model.json";
        let params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${path}`,
        };

        s3.getObject(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data.Body));
            }
        });

    }).then(listado => {
        const response = {
            statusCode: 201,
            body: JSON.stringify(listado),
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work  
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS  
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        };
        console.log("response:", response);
        callback(null, response);
        
    }).catch(e => {
        const response = {
            statusCode: 500,
            body: JSON.stringify(`NOK :`, e),
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work  
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS  
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        };
        
        console.log("response:", response);
        callback(e, response);
    });
};