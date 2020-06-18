'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: "us-east-1"});
const genToken = require('../genToken');
const servNube = require('../serviciosNube');
const _ = require('lodash');
const ex = require("../CertificateError");
const funcModules = require('../funcionesModulos');

let logBase= "[CREAR CERTIFICADO] ";

exports.cert_echo = async (data, confModule, ssmParameter, nombreCertificado) => {
    let errores = [];
    let respuesta={};
    let hostTokenNube = process.env.HOST_NUBE; //para ir a buscar el token
    
    console.log(logBase+'[INICIO PROCESO] Mensaje de Entrada:', data, confModule, 'ssmParameter: con datos de conexion a fuentes de datos');

    let promises = confModule.fuenteDatos.map( (value) => new Promise( async (resolve, reject) => {
    
        let fuente = "/"+value.id; //puedo tener "n" fuentes de origen de datos para armar el certificado
        let tokenGenerico, body = {};
        
        //obtengo las variables del parameter store para la fuente
        let ssm = funcModules.setParametrosSSM(ssmParameter, data, fuente); 
        
        if(_.isEmpty(ssm)){
            let e = {
                message: "Error interno.",
                code: "500"
            };
                
            errores.push(e);   
            console.log("variables no encontradas en ParameterStore para "+fuente);
            reject({errors: errores});
        
        }
        
        else {
            try{
                let tokenHost = value.tokenHost.replace("${env}", process.env.ENV); //cuando se obtiene el token de la nube
                tokenHost = tokenHost.replace("${ssm.HOST}", ssm["host"]); //cuando se obtiene el token desde onPremise
                tokenGenerico = await genToken.obtenerToken(tokenHost, value.tokenPath, ssm["client-id"],ssm.scope,ssm["client-secret"],ssm["grant-type"]);
                console.log(logBase+"tokenGenerico calculado");
            } catch(err){
                let e = {
                    message: "Error interno.",
                    code: "500"
                };
                    
                errores.push(e);   
                console.log(logBase+'Error al generar token nube', err);
                reject({errors: errores});
            }
            
            let parametros = funcModules.setParametrosAndMatch(data, value);
            
            if(parametros.metodo=="GET"){
                let cont = 0;
                _.forEach(parametros.params, function(param) {
                    if (cont == 0) {
                        parametros.path += param;
                    }
                    else {
                        param = '/' + param;
                        parametros.path += param;
                    }
                    cont++;
                });
                
            } else {
                body = parametros.params;
            }
            
            try{
                respuesta = await servNube.getDataCertificado(tokenGenerico, body , ssm["host"], parametros.path, parametros.metodo);
            } catch(err){
                let e = {
                    message: "Error interno.",
                    code: "500"
                };
                    
                errores.push(e);   
                console.log(logBase+'Error al llamar servicioNube para crear el certificado', err);
                reject(errores);
            }
          
            if(respuesta.statusCode == 200) {
                console.log(logBase+"respuesta ok");
                respuesta = JSON.parse(respuesta.resultado).data;
                
                if(!respuesta.hasOwnProperty('certificado')){
                    //generar error
                    let message="";
                    _.transform(respuesta.contenido, function(result, value, key) {
                      message += value.valor+" ";
                    }, {});
                    
                    reject(message, 500);
                }
            }
            else {
                let error="";
                if(respuesta.hasOwnProperty("errors")){
                    error = respuesta.errors[0].message;
                }
                
                else if(respuesta.hasOwnProperty("resultado") && JSON.parse(respuesta.resultado).hasOwnProperty("errores")){
                    error = JSON.parse(respuesta.resultado).errores[0].message;
                }
                
                reject("Error al obtener la información. "+error, 500);
            }
            
            resolve(respuesta);
        }
    }));
    
    await Promise.all(promises).then(values => {
        
        console.log("Promesas ok");
        
    }).catch( err => {
        console.log(err);
        throw new ex.CertificateError(err, 500);
    });

    return respuesta;
};