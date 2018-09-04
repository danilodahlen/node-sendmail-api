const elasticemail  = require('elasticemail');
const Connection    = require('../Connections/SqlServer.js');
const validator     = require("email-validator");

const f_enviarEmail = function(v_ViaBanco,v_Sequencia,v_Tipo,from,from_name,to,subject,text,f_callback){

    if(f_emailValido(from,from_name,to,subject,text)){

        const client = elasticemail.createClient({
            username: global.config.Elastic.username,
            apiKey: global.config.Elastic.apiKey
        });
   
        const msg = {
            from: from,
            from_name: from_name,
            to: to,
            subject: subject,
            body_text: text
        };
       
        client.mailer.send(msg, function(errEmail, result) {
            const error = false;
            let parametros = new Array();

            if (errEmail) {
                error = true;
            }

            if(v_ViaBanco){
                parametros.push(['int', v_Sequencia ]);
                parametros.push(['erro', (error ? err : "")]);
                
                Methods.f_executeProcedure(parametros,"Proc_GravarEmailEnviado", function(v_retorno, err) {
                    if(error)
                        f_callback(true,errEmail + " - " + err + " - " + to);
                    f_callback(false,"Sucesso");
                });
            }
            else{
                parametros.push(['int', v_Tipo ]);
                parametros.push(['string', from]);
                parametros.push(['string', from_name]);
                parametros.push(['string', to]);
                parametros.push(['string', subject]);
                parametros.push(['string', text]);
                parametros.push(['int', "1"]);
                parametros.push(['string', (error ? err : "")]);

                Methods.f_executeProcedure(parametros,"Proc_GravarEmails", function(v_retorno, err) {
                    if(error)
                        f_callback(true,errEmail + " - " + err + " - " + to);
                    f_callback(false,"Sucesso");        
                });
            }       
        });
    }
}

const f_convertJsonToArray = function(v_Param) {
    var keys = Object.keys(v_Param);
    var v_result = new Array(keys.length * 2);
    var j = 0;

    for (var i = 0; i < keys.length; i++) {
        v_result[j] = keys[i];
        v_result[j + 1] = v_Param[keys[i]];
        j = j + 2;
    }

    return v_result;
}

function _f_montarQuery(v_Param, v_Proc) {
    var retorno = 'EXEC ' + v_Proc + ' ';
    for (var i = 0; i < v_Param.length; i++) {

        if (v_Param[i][0] == "string") {
            retorno += '"' + v_Param[i][1] + '"' + ',';
        }
        if (v_Param[i][0] == "date") {
            retorno += '"' + f_toDate(v_Param[i][1]) + '"' + ',';
        }
        if (v_Param[i][0] == "float") {
            retorno += '' + f_toFloat(v_Param[i][1]) + '' + ',';
        }
        if (v_Param[i][0] == "decimal") {
            retorno += '' + f_toDecimal(v_Param[i][1]) + '' + ',';
        }
        if (v_Param[i][0] == "int") {
            retorno += '' + f_toInt(v_Param[i][1]) + '' + ',';
        }
        if (v_Param[i][0] == "bool") {
            retorno += '' + f_toInt(v_Param[i][1]) + '' + ',';
        }
    }

    retorno = retorno.substring(0, retorno.length - 1);

    return retorno;
}

const f_executeProcedure = function(v_Param, v_Proc, f_CallBack) {
    Connection.execute(_f_montarQuery(v_Param, v_Proc), function(v_Dados, err) {
        f_CallBack(v_Dados, err);
    });
}

const f_converterJsonToString = function(v_Param) {
    return JSON.stringify(v_Param);
}

const f_toInt = function(v_Param) {
    return f_replaceAll(f_replaceAll(v_Param, '.', ''), ',', '');
}

const f_toFloat = function(v_Param) {
    return f_replaceAll(v_Param, ',', '.');
}

const f_toDecimal = function(v_Param) {
    return f_replaceAll(v_Param, ',', '.');
}

const f_replaceAll = function(v_Texto, Substituir_De, Substituir_Por) {
    v_Texto = v_Texto.toString();
    while (v_Texto.indexOf(Substituir_De) > -1) {
        v_Texto = v_Texto.replace(Substituir_De, Substituir_Por);
    }

    return v_Texto;
}

const f_toDate = function(v_Param) {
    return v_Param.split("/")[2] + '-' + v_Param.split("/")[1] + '-' + v_Param.split("/")[0];
}

const f_zeroEsquerda = function(v_Valor, v_Tamanho) {
    v_Valor = v_Valor.toString();
    while (v_Valor.length < v_Tamanho)
        v_Valor = 0 + v_Valor;
    return v_Valor;
}

const f_emailValido = function(from, from_name, to, subject, text){
    const v_Valido = true;

    if(from == "" || !(validator.validate(from)))
        v_Valido  = false;

    if(from_name == "")
        v_Valido  = false;

    if(to == "" || !(validator.validate(to)))
        v_Valido  = false;

    if(subject == "")
        v_Valido  = false;
    
    if(text == "")
        v_Valido  = false;        

    return v_Valido;
}

module.exports = {
    f_toInt: f_toInt,
    f_toFloat: f_toFloat,
    f_toDecimal: f_toDecimal,
    f_toDate: f_toDate,
    f_zeroEsquerda: f_zeroEsquerda,
    f_replaceAll: f_replaceAll,
    f_executeProcedure: f_executeProcedure,
    f_converterJsonToString: f_converterJsonToString,
    f_convertJsonToArray: f_convertJsonToArray,
    f_enviarEmail: f_enviarEmail,
    f_emailValido: f_emailValido
}
