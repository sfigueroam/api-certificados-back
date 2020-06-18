'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: "us-east-1"});
const genToken = require('../genToken');
const servNube = require('../serviciosNube');
const _ = require('lodash');
const ex = require("../CertificateError");
const funcModules = require('../funcionesModulos');

let logBase= "[CREAR CERTIFICADO] ";

exports.cert_cdcp = async (data, confModule, ssmParameter, nombreCertificado) => {
    
    let errores = [];
    let respuesta={};
    let salida;
    let parrafos = [];
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
                tokenGenerico = await genToken.obtenerToken(hostTokenNube, value.tokenPath, ssm["client-id"],ssm.scope,ssm["client-secret"],ssm["grant-type"]);
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
               _.forEach(parametros.params, function(param) {
                     parametros.path += param;
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
                respuesta = JSON.parse(respuesta.resultado);
                
                if(!respuesta.data.hasOwnProperty('certificado')){
                    //generar error
                    let message="";
                    _.transform(respuesta.data.contenido, function(result, value, key) {
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
                
                reject("Error al obtener la información. "+error, 500);
            }
            
            let cantidadCampos = respuesta.data.contenido.length;
            let letras = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
            
            for(let i=0; i<cantidadCampos;i++){
              
              let parrafo = {
                "prioridad":letras[i],
                "tipo": "string",
                "valor": respuesta.data.contenido[i].valor
              };
              
              parrafos.push(parrafo);
            }
            
            resolve(respuesta);
        }
    }));
    
    await Promise.all(promises).then(values => {
        
        console.log("Promesas ok");
        salida = 
        {
        	"certificador": {
        	    "prioridad":"A",
        		"tipo": "certificador",
        		"valor": {
        			"primario": {
        			    "prioridad":"A",
        				"tipo": "institucion",
        				"valor": {
        					"logo": {
        					    "prioridad":"A",
        						"tipo": "base64",
        						"valor": respuesta.data.certificado.logo
        					}
        				}
        			}
        		}
        	},
        	"certificado": {
        	    "prioridad": "B",
        		"etiqueta": nombreCertificado,
        		"tipo": "certificado",
        		"valor": {
        			"id": {
        			    "prioridad": "A",
        				"etiqueta": "Rut",
        			    "tipo": "number",
        				"valor": respuesta.data.cliente.rut
    				},
    				"nombre": {
			            "prioridad":"B",
    					"etiqueta": "Nombre",
    					"tipo": "string",
    					"valor": respuesta.data.cliente.nombre
    				}
    			    
        		}
        	},
        	"posdata": {
        	    "prioridad":"C",
        		"tipo": "lista",
        		"valor": {
        		}
        	}
        };
        
        salida.posdata.valor = parrafos;
        console.log(salida);
        
    }).catch( err => {
        console.log(err);
        throw new ex.CertificateError(err, 500);
    });
    
    return salida;

};