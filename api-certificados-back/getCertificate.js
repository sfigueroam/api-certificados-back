'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: "us-east-1"});
const funciones = require('./funciones');
const s3 = new AWS.S3();
const bucket = process.env.BUCKET_NAME;
const genToken = require('./genToken');
const servTierra = require('./serviciosTierra');
const _ = require('lodash');

module.exports.handler = (event, context, callback) => {
    var id= event.pathParameters.idCert;
    console.log("[INICIO GET CERTIFICATE] event:", event);
    
    
        
    return new Promise((resolve, reject) => {

        let path = funciones.getPath(id);
        console.log("Bucket: " , bucket);
        let params = {
            Bucket: bucket,
            Key: `${path}`,
        };
    
        s3.getObject(params, function(err, data) {

            if (err) {
                reject(err);
            } else {
                let resp =JSON.parse(data.Body);
                resolve(resp);
            }
        });
    
    }).then(datosS3 => {
        const response = {
            statusCode: 201,
            body: JSON.stringify(datosS3),
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work  
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS  
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        };
        
        console.log("[FIN GET CERTIFICATE] response:" , response);
        callback(null, response);
        
    }).catch(e => {
        console.log(`error ==> ${e}`);
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
        
        console.log("[FIN GET CERTIFICATE] error:" , response);
        callback(e, response);
        
    });
    
};