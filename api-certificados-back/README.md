# ApiCertificadosBack
API rest para generar y mostrar certificados.
La API se basa en los estandares definidos por arquitectura [ver estandares](https://drive.google.com/drive/folders/1Id1oZ1-Jb42nbRC7u5ldsjRs4wv4sQFx)

### Bucket s3
Los certificados generados y las configuraciones se guardan en:
`Bucket`: tgr-dev-api-certificados-data
[properties.json](https://tgr-dev-api-certificados-data.s3.amazonaws.com/config/properties.json) Archivo con la lista de certificados y sus configuraciones

### Formato de salida
Ver el más actualizado en [URL JSON](https://drive.google.com/open?id=1BeeLp2z0VKduhhVWNTq6woxqh_ErhIQA)

### Métodos

#### - createCertificate
Permite generar un certificado nuevo, tiene dos alternativas dependiendo de la configuración obtenida del properties.json:
`metodo cert_echo`: Función que consume una API externa y la respuesta no requiere un tratamiento especial para armar la salida.
`lambda cert_codigo`: Función que consume una o más API´s externas y necesita armar la respuesta en un formato genérico y previamente acordado. Existe un método cada codigo de certificado que fuese necesario

#### - getCertificate
Devuelve los datos de un certificado creado previamente

#### - getListCertificate
Lista los tipos de certificados que se pueden generar, en donde cada uno tiene una configuración asociada para conocer sus parametros de entrada, fuente de origen de los datos, permiso, entre otras cosas.

# Diagrama
[Diagrama original](https://drive.google.com/file/d/1VRf9RiTvoLluyTqwxp5d4QBNdxUreLSO/view?usp=sharing_eip&ts=5d5c0fd7)
[Diagrama actualizado](https://#)