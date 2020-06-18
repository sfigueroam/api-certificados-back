'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: "us-east-1"});

const func = require('./funciones');
const modulos = require('./modules');
let errores = [];
let statusCode = 500;

module.exports.handler = async (event, context, callback) => {
    
    try {
        //valido JSON y obtengo data
        let data = func.getAndValidateData(event);
        
        //obtengo nombre del certificado desde el properties "model.json" de s3
        let nombreCertificado = await func.getNombreCertS3(data);
        
        //obtengo configuracion para el certificado desde "controller.json" de s3
        let configuracion = await func.getConfiguracionS3();
        
        //obtengo datos del modulo a utilizar, filtrando por tipo de certificado
        let confModule = func.getConfigModule(configuracion.certificados, data.tipo);
        
        //obtengo variables desde el parameterStore para este certificado en particular
        let ssmParameter = await func.getParametrosSSM(configuracion.ssmPrefix, data.tipo);
        
        //traductor correspondiente y que realiza las llamadas a fuentes de datos (carpeta modules)
        let resultado = await modulos[confModule.module][confModule.module](data, confModule, ssmParameter, nombreCertificado);
        
        //crea certificado con resultado anterior
        let infoCertificado = func.createCertificado(resultado, confModule);
        
        //guardo en s3 el certificado.
        await func.saveCertificado(infoCertificado);
        
        //respuesta de la API
        let response = func.createResponse(infoCertificado.id);
        func.send(201, response, callback);
        
    }catch (e) {
        let err = {message:e.message, code:e.code};
        errores.push(err);
        func.send(statusCode, {errors: errores}, callback);
        return false;
    }
};
