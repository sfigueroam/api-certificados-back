const https = require('https');
const host = process.env.HOST;
const port = 443;
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.getDataCertificado = (token, body, hostNube, pathNube, metodo) => {
    
    return new Promise((resolve, reject) => {
        let salida={};
        
        let datos = body;//funciones.armaData(body, configuracion);
        
        let options = {
            hostname: hostNube,
            port: port,
            path: pathNube,
            method: metodo,
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: datos
        };

        let respuesta = '', estado;
        
        console.log("datos llamado chile proveedores:",options);
        let req = https.request(options, (res) => {
            
            estado= res.statusCode;
            res.on('data', (d) => {
                
                respuesta += d;
            });
            
        }).on('error', (error) => {
            reject(error);
        });

        req.write(JSON.stringify(datos));
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

