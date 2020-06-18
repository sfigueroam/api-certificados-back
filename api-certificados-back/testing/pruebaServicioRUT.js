/*
process.env.REST_TOKEN_CLIENT_ID_CD = "OauthRcGestionCertificadoDeudasRsClient";
process.env.REST_TOKEN_SCOPE_CD = "/gestion-certificados-deudas/v1/*" ;
process.env.REST_TOKEN_CLIENT_SECRET_CD = "TGR.6St!0nC3rT";
process.env.REST_TOKEN_GRANT_TYPE_CD = "client_credentials";
process.env.prefix = "tgr-dev-api-certificados";
*/
process.env.HOST_NUBE = "id-dev.tegere.info";
process.env.BUCKET_NAME="tgr-dev-api-certificados-data";

/*
NUEVAS PARA TOKEN NUBE
*/
process.env.REST_TOKEN_CLIENT_ID = "6n3dthiffk4ntdt80u9mv2cmea";
process.env.REST_TOKEN_SCOPE = "tgr-dev-api-certificados-ds/all" ;
process.env.REST_TOKEN_CLIENT_SECRET = "1fkvo6mtkmsol92a41bi3bmessiqo4mpq7vmg9oo6a2cndr2l40j";
process.env.REST_TOKEN_GRANT_TYPE = "client_credentials";

// process.env.REST_TOKEN_CLIENT_ID_CLI = "odvjoaa0e59tqociicll19ico";
// process.env.REST_TOKEN_SCOPE_CLI = "tgr-dev-api-info-clientes/all" ;
// process.env.REST_TOKEN_CLIENT_SECRET_CLI = "r8kcq6rj4bck15emdifdqfodi0s9fblhfgshgldfdhf65qmkai6";
// process.env.REST_TOKEN_GRANT_TYPE_CLI = "client_credentials";
process.env.ENV='dev';
const crear = require('../createCertificate');
//const crear = require('../getCertificate');
//const crear = require('../getListCertificate');

/*datos prueba:
1300243027 --> con deudas
7000001123 --> sin deudas
7048501123 --> Sin registro en cut con formato valido
97456456445--> sin registro en la CUT, con formato invalido
*/

//con deuda chile prov. 16399313 9
//sin deuda chile prov. 15068042 5
console.log('Inicio de funcion');
let event = {"body": "{\"data\": {\"tipo\": \"cdcp\",\"id\": {\"rut\": 76610420,\"dv\": \"7\" }}}"}; // json entrada para crear certificado



//let event = {"pathParameters": {"idCert":"1AWS2019072200002522-CHPV"}}; // json entrada para buscar certificado
//let event = {}


crear.handler(event, null, ()=>{ console.log("fin")});
