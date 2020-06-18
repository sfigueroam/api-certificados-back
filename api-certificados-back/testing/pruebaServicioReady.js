
process.env.REST_TOKEN_CLIENT_ID_CD = "OauthRcGestionCertificadoDeudasRsClient";
process.env.REST_TOKEN_SCOPE_CD = "/gestion-certificados-deudas/v1/*" ;
process.env.REST_TOKEN_CLIENT_SECRET_CD = "TGR.6St!0nC3rT";
process.env.REST_TOKEN_GRANT_TYPE_CD = "client_credentials";
process.env.HOST = "wstest.tesoreria.cl";
process.env.BUCKET_NAME="tgr-dev-api-certificados-data";
process.env.prefix = "tgr-dev-api-certificados";

const crear = require('../lambdas/ready');

console.log('Inicio de funcion');
let event = {"data":{"tipo":"cdcp","id":{"Rol":"1300001112"}},"confLambda":{"certificado":"cdco","nombre":"Certificado de Deudas de Contribuciones","tipo":"certificado-deuda","subtipo":"contribuciones","campos":[{"nombre":"Rol","tipo":"rol","condicion":"obligatorio"}],"pathTierra":"/gestion-certificados-deudas/v1/territoriales","lambda":"ready","privado":false}}
event = JSON.stringify(event);


crear.handler(event, null, ()=>{ console.log("fin")});
