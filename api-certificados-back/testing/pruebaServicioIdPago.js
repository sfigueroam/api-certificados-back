process.env.HOST_NUBE = "id-dev.tegere.info";
process.env.BUCKET_NAME="tgr-dev-api-certificados-data";

process.env.REST_TOKEN_CLIENT_ID = "6n3dthiffk4ntdt80u9mv2cmea";
process.env.REST_TOKEN_SCOPE = "tgr-dev-api-certificados-ds/all" ;
process.env.REST_TOKEN_CLIENT_SECRET = "1fkvo6mtkmsol92a41bi3bmessiqo4mpq7vmg9oo6a2cndr2l40j";
process.env.REST_TOKEN_GRANT_TYPE = "client_credentials";

process.env.ENV='dev';
const crear = require('../createCertificate');
console.log('Inicio de funcion');

let event = {"body": "{\"data\": {\"tipo\": \"cpop\",\"id\": {\"id\":\"38474794\" }}}"};

crear.handler(event, null, ()=>{ console.log("fin")});
