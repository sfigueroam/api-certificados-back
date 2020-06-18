process.env.BUCKET_NAME="tgr-dev-api-certificados-data";

/*
NUEVAS PARA TOKEN NUBE
*/
process.env.REST_TOKEN_CLIENT_ID = "OauthTrVerificadorRSClient";
process.env.REST_TOKEN_SCOPE = "/verificador/v1*" ;
process.env.REST_TOKEN_CLIENT_SECRET = "TGR.V3r!f1CAd0r";
process.env.REST_TOKEN_GRANT_TYPE = "client_credentials";
process.env.ENV='dev';
process.env.REST_HOST_TIERRA='wstest.tesoreria.cl';

const crear = require('../getCertificate');

console.log('Inicio de funcion');
let event = {"pathParameters": {"idCert":"14110620gEn7auo3cdco"}}; // json entrada para buscar certificado

//nube:1AWS14110612w0jtpEiRE-cdcp
//tierra: 2019110801001662
crear.handler(event, null, ()=>{ console.log("fin")});
