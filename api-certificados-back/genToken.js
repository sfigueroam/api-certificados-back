'use strict';
const https = require('https');
const querystring = require('querystring');

const port = 443;

exports.obtenerToken = (host, path, clienteId, scope, clientSecret, grantType) => {
    return new Promise((resolve, reject) => {

        let data = {
                     "grant_type": grantType,
                     "client_secret": clientSecret,
                     "client_id": clienteId,
                     "scope": scope
        };
    
        let postData = querystring.stringify(data);
    
        let options = {
            hostname: host,
            port: port,
            path: path,
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
    
        let respuesta = '';
        let token = null;
        let req = https.request(options, (res) => {
               
            if (res.statusCode != 200 && res.statusCode != 201) {
                let status = {
                    id: 1,
                    mensaje: 'Error en promesa genToken',
                    error: "Error al invocar el servicio"
                };
            return (status);
            }
    
            res.on('data', (d) => {
                respuesta += d;
            });
        });
    
        req.write(postData);
        req.on('error', (e) => {
            resolve(e);
        });
    
        req.on('close', () => {
            try {
                if (JSON.parse(respuesta).access_token != null)
                    token = JSON.parse(respuesta).access_token;
    
            } catch (error) {

            }
    
            resolve(token);
        });
        req.end();
    }).catch((error) => {

        let status = {
            id: 1,
            mensaje: 'Error en promesa genToken',
            error: error
        };
    
        return (status);
    });
};