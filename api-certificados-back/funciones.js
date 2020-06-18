'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
AWS.config.update({region: "us-east-1"});
const parameterStore = new AWS.SSM()
const _ = require('lodash');
const bucket = process.env.BUCKET_NAME;
const shortid = require('shortid');
const moment = require('moment');
const  numeroClave = 6080500; //TODO: para "ocultar" la fecha hacia afuera. Se resta el numero. Y luego al consultar un id, se le suma
const ex = require("./CertificateError");

let logBaseFunciones  = "[FUNCIONES]";


let self = {
    
    getAndValidateData: (event) => {
        let body;
        
        try{
            body = JSON.parse(event.body);
        } catch (e){
            throw new ex.CertificateError("Formato Json invalido", 400);
        }  
        
        if(!body.hasOwnProperty("data") || !body.data.hasOwnProperty("tipo") ){
            throw new ex.CertificateError("El campo tipo es obligatorio", 400);
        } else {
            return body.data;
        }
    },
    
    getConfiguracionS3 : () => {
     
        return new Promise((resolve, reject) => {
    
            let path = `config/properties/controller.json`; 
            
            let params = {
                Bucket: bucket,
                Key: `${path}`,
            };
        
            s3.getObject(params, function(err, data) {
                
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data.Body.toString('utf-8')));
                }
            });
            
        }).then(datosS3 => {
            return datosS3;
            
        });
        
    },

    getNombreCertS3 : (dataIn) => {
     
        return new Promise((resolve, reject) => {
    
            let path = `config/properties/model.json`; 
            
            let params = {
                Bucket: bucket,
                Key: `${path}`,
            };
        
            s3.getObject(params, function(err, data) {
                
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(JSON.parse(data.Body.toString('utf-8')));
                }
            });
            
        }).then(datosS3 => {
            
            try{
                let nombreCert=_.filter(datosS3.certificados, { 'certificado': _.toLower(dataIn.tipo) });
                
                if(_.size(nombreCert)==1) {
                    return nombreCert[0].nombre;
                }
                else{ throw new ex.CertificateError("Configuracion no encontrada para el tipo: <"+dataIn.tipo+">"); }
            } catch(e){
                throw new ex.CertificateError("Configuracion no encontrada para el tipo: <"+dataIn.tipo+">");
            }
            
        });
        
    },
    
    getConfigModule: (configuracion,tipoCertificado) => {
    
        try{
            let confLambda=_.filter(configuracion, { 'certificado': _.toLower(tipoCertificado) });
            
            if(_.size(confLambda)==1) {
                return confLambda[0];
            }
            else{ throw new ex.CertificateError("Configuracion no encontrada para el tipo: <"+tipoCertificado+">"); }
        } catch(e){
            throw new ex.CertificateError("Configuracion no encontrada para el tipo: <"+tipoCertificado+">");
        }
    },
    
    createCertificado: (certificateResult, configuracion) => {
        
        let nameAndPathFile = self.getFileNameAndPath(configuracion.certificado);
        let filePath = `${nameAndPathFile.path}${nameAndPathFile.filename}${nameAndPathFile.ext}`;
        let fecCaducidad = '';
        let certificateData = certificateResult;
        
        let certificado;
        
        if (configuracion.hasOwnProperty("version") && configuracion.version == 2) {
            
            certificado = 
            {  
                metadata: {
                    id : nameAndPathFile.filename,
                    tipo: configuracion.tipo,
                    subtipo: configuracion.subtipo,
                    fechaEmision : moment.utc().toISOString(),
                    version: 2
                },
                "certificador": certificateData.certificador,
                "certificado": certificateData.certificado,
                "posdata": certificateData.posdata
            };
            
        } else {
        
            certificado = 
            {  
                metadata: {
                    id : nameAndPathFile.filename,
                    tipo: configuracion.tipo,
                    subtipo: configuracion.subtipo,
                    fechaEmision : moment.utc().toISOString()
                },
                "certificador": certificateData.certificador,
                "certificado": certificateData.certificado,
                "posdata": certificateData.posdata
            };
        
        }
        
        if(configuracion.hasOwnProperty("caducidad")){
            fecCaducidad = moment.utc().add(configuracion.caducidad.duracion,configuracion.caducidad.tipo).toISOString();
            certificado.metadata.fechaCaducidad = moment(fecCaducidad).format("YYYY-MM-DD");
        }
        
        let salida = {
            certificadoCompleto: certificado,
            filePath: filePath,
            id : nameAndPathFile.filename,
            ext: nameAndPathFile.ext
        };
        
        return(salida);
    },

    saveCertificado: (certificado) => {
        let certificateData;
        let filePath = certificado.filePath;
        return new Promise(async (resolve, reject) => {
    
            let certificadoS3 = JSON.stringify(certificado.certificadoCompleto);
            
            const params = {
                Bucket: bucket,
                Key: filePath,
                Body: certificadoS3
            };
            
            try{
                await s3.upload(params, function(s3Err, data) {
                    
                    if (s3Err) {
                        console.log(logBaseFunciones+'[saveCertificado] Error al guardar el certificado:', " certificadoS3",certificadoS3);
                        reject(s3Err);
                    }  
                    
                    else {
                        resolve(certificado.id);
                    }
                });
            }catch(e){
                console.log(logBaseFunciones+'[saveCertificado] Error al guardar el certificado:', " certificadoS3",certificadoS3);
                reject(e);
            }
            
        }).catch((error) => {
            console.log(error, logBaseFunciones+'[saveCertificado] Error en promesa. ', " certificateData",certificateData);
            throw new ex.CertificateError("Error al guardar el certificado", 500);
        });
    },

    createResponse: (id) => {
        
        let salida = { requestId : id };
            
        return salida;
    },
    
    send: (httpCode, resultado, callback) => {
        const response = {
            statusCode: httpCode,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        };
    
        if (resultado) {
            response.body = JSON.stringify(resultado);
        }
    
        console.log(logBaseFunciones+'[FIN PROCESO] response', response);
        callback(null, response);
        return;
    },
    
    getFileNameAndPath: (tipoCertificado) => {
        let salida = null; 
    
        var mes = moment().format("MM"); 
        var dia = moment().format("DD"); 
        var anio = moment().format("YYYY");    
        
        shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$');
        let id =shortid.generate();
        let fechaMod =_.subtract(_.toNumber(moment().format("YYYYMMDD")), numeroClave);
        let idCertificado  = `${fechaMod}${id}`;//`1AWS${fechaMod}${id}`;//data.data.certificateId;//TODO: original=> data.data.codigoIdentificacion;
        let nameFinal = `${idCertificado}${tipoCertificado}`;
        
    
        var path = `certificates/${tipoCertificado}/${anio}/${mes}/${dia}/`; 
        
        salida = { 
            filename: nameFinal,
            path: path,
            ext: ".json" 
        }; 
     
        return (salida); 
    },

    getPath : (idCert) => {
    
        var TipoCert= idCert.substr(-4,4);
    
        console.log(logBaseFunciones+`[getPath] idCert: ${idCert}`);
    
        var fakeDate    = idCert.substr(0, 8);
        var realDate    = _.add(_.toNumber(fakeDate), numeroClave);
        var anio        = realDate.toString().substr(0, 4);
        var mes         = realDate.toString().substr(4, 2);
        var dia         = realDate.toString().substr(6, 2);
        
        var path = `certificates/${TipoCert}/${anio}/${mes}/${dia}/${idCert}.json`;
     
        return (path);
    
    },
    
    getParametrosSSM : (prefijo, codigoCertificado) => {
        
        let prefix = prefijo+codigoCertificado;
        prefix = prefix.replace("${env}",process.env.ENV );
        
        return new Promise((resolve, reject) => {
            var params = {
              Path: prefix,
              Recursive: true,
              WithDecryption: true
            };
            
            parameterStore.getParametersByPath(params, function(err, data) {
              if (err) {
                  console.log(err, err.stack); // an error occurred
                  reject(err);
              }
              else{
                  console.log(data);           // successful response
                  resolve(data);
              }
                  
            });
        });
    }
};

module.exports = self;

