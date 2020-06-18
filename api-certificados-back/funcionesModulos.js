const _ = require('lodash');

let self = {

 setParametrosAndMatch(parametrosRecibidos, parametrosEnviar) {
    let params={}, metodo, parametros, salida ={};
    let expTest = new RegExp(/^(\W)(\W)(\w|\d|.)+$/); //que no empiece por alfanumerico los 2 primeros caracteres
    let expSearchFirst = new RegExp(/[{]/);
    let expSearchLast = new RegExp(/[}]/);
  
    let path = _.split(parametrosEnviar.url, '${ssm.HOST}')[1];
    path = path.replace("${env}", process.env.ENV);     
    
    if(parametrosEnviar.hasOwnProperty("queryString")){
        metodo = "GET";
        parametros = parametrosEnviar.queryString;
    }
    
    if(parametrosRecibidos.hasOwnProperty("bodyParams")){
        metodo = "POST";
        parametros = parametrosEnviar.bodyParams;
    }
    
    
    _.forEach(parametros, function(param) {
       if(expTest.test(param))
       {
         let ini = param.search(expSearchFirst);
         let fin = param.search(expSearchLast);
         
         let newParam = param.substring(ini+1,fin).split(".");
         
         let origenData= newParam[0];
         let nombreParametro = newParam[1];
         
         if(origenData=="params"){
             params[nombreParametro] = parametrosRecibidos["id"][nombreParametro];
         }
       }
    });
    
    salida.metodo = metodo;
    salida.params = params;
    salida.path = path;
    
    return salida;
 },

 setParametrosSSM(parametrosSSM, data, fuente) {
    let variables = ['client-id','client-secret','scope','grant-type','host'];
    let credenciales = {};
    _.forEach(variables, function(nombreVar) {
           
        _.find(parametrosSSM.Parameters, function(o) { if(_.endsWith(o.Name, '/'+data.tipo+fuente+'/'+nombreVar)) { credenciales[nombreVar] = o.Value; }});
        
    });
    
    return credenciales;
 }
};

module.exports = self;
