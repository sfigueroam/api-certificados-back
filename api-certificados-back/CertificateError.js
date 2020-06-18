'use strict';

class CertificateError extends Error {
    constructor(args, codError){
        super(args, codError);
        this.message =args;
        this.code=codError;
    }
}

module.exports = {CertificateError};

