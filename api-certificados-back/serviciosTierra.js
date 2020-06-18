const https = require('https');
const host = process.env.REST_HOST_TIERRA;
const port = 443;
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
/*
  Funcion encargada de crear un certificado valido.
*/
exports.getDataCertificado = (token, body, path, metodo) => {
    
    return new Promise((resolve, reject) => {
        let salida={};
        
        let datosTierra = body;
            
        let options = {
            hostname: host,
            port: port,
            path: path,
            method: metodo,
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: datosTierra
        };

        let respuesta = '', estado;
        let req = https.request(options, (res) => {
            
            estado= res.statusCode;
            res.on('data', (d) => {
                
                respuesta += d;
            });
            
        }).on('error', (error) => {
            reject(error);
        });

        req.write(JSON.stringify(datosTierra));
        req.on('close', () => {
            salida["statusCode"] = estado;
            salida["resultado"] = respuesta;
            resolve(salida);
        });
        req.end();
    })
    .catch((error) => {
    });
};

