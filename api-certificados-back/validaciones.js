exports.validacionesFormato = function (data, expresiones) {
    let errores = [];

    for (let elem in expresiones) {
        if (data.hasOwnProperty(elem) || !expresiones[elem].opcional) {
            if (validaExpresion(data[elem], expresiones[elem].expr.replace("abrir_llave", "{").replace("cerrar_llave","}"))) {
                
                let e = {
                    message: "El campo " + elem + " no cumple con formato acordado",
                    code: expresiones[elem].codigoError
                };

                errores.push(e);
            }
        } 
        else if(data[elem] === undefined && !expresiones[elem].opcional){
            let e = {
                    message: "El campo " + elem + " es obligatorio",
                    code: expresiones[elem].codigoError
                };

            errores.push(e);
        }
    }
    return errores;
};

function validaExpresion(campo, expresion) {
    expresion = new RegExp(expresion);
    return !expresion.test(campo);
}
