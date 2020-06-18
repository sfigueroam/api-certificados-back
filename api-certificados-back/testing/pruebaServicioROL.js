
process.env.REST_TOKEN_CLIENT_ID_CD = "OauthRcGestionCertificadoDeudasRsClient";
process.env.REST_TOKEN_SCOPE_CD = "/gestion-certificados-deudas/v1/*" ;
process.env.REST_TOKEN_CLIENT_SECRET_CD = "TGR.6St!0nC3rT";
process.env.REST_TOKEN_GRANT_TYPE_CD = "client_credentials";
process.env.HOST = "wstest.tesoreria.cl";
process.env.BUCKET_NAME="tgr-dev-api-certificados-data";
process.env.prefix = "tgr-dev-api-certificados";
//const crear = require('../lambdas/cdco');
const crear = require('../createCertificate');
//const crear = require('../getCertificate');

/*datos prueba:
1300243027 --> con deudas
7000001123 --> sin deudas
7048501123 --> Sin registro en cut con formato valido
97456456445--> sin registro en la CUT, con formato invalido
*/
process.env.ENV='dev';

console.log('Inicio de funcion');
let event = {"body": "{\"data\": {\"tipo\": \"cdco\",\"id\": {\"rol\":\"13002430279\" }}}"}; // json entrada para crear certificado
                    //{\"data\": {\"tipo\": \"cdco\",\"id\": {\"Rol\":\"1300001112\"}}}



//let event = {"pathParameters": {"idCert":"1AWS20190813CDC6YmESJNzx-CDC"}}; // json entrada para buscar certificado
//let event = {}


crear.handler(event, null, ()=>{ console.log("fin")});
