process.env.BUCKET_NAME="tgr-dev-api-certificados-data";


const crear = require('../getListCertificate');


console.log('Inicio de funcion');
let event = {};

crear.handler(event, null, ()=>{});
