const Timer = require('setinterval');

const express = require('express');
const app = express();

const Methods = require('./Functions/methods');
const Log     = require('./Functions/writeLog');

global.config = require("./Config/configuration.json");

const Intervalo = new Timer(function*() {
    Log.writeLog("Info","Iniciou serviço");
    
    let parametros = new Array();
    parametros.push(['int', global.config.Filtro.quantidade]);

    Methods.f_executeProcedure(parametros,"Proc_FiltrarEmails", function(v_retorno, err) {
        const v_Dados = v_retorno;
    
        for(let i = 0; i < v_Dados.length; i++){
            Methods.f_EnviarEmail(true,
                                v_Dados[i].em_id,
                                v_Dados[i].id_tipo_email, 
                                v_Dados[i].em_from, 
                                v_Dados[i].em_from_name,
                                v_Dados[i].em_to,
                                v_Dados[i].em_subject,
                                v_Dados[i].em_text,
                                function(error,message){
                                    if(error){
                                        Log.writeLog("Erro",message);    
                                    }
                                    else{
                                        Log.writeLog("Info", "Enviado para: " + v_Dados[i].em_from);
                                    }

                                    Log.writeLog("Info","Finalizou serviço");
                                });
        }
    });

}, global.config.Intevalo.tempo);

app.get('/enviarEmail', function (req, res) {

    const tipo    =  req.query.tipo;
    const from    =  req.query.from;
    const name    =  req.query.from_name;
    const to      =  req.query.to;
    const subject =  req.query.subject;
    const text    =  req.query.text;

    Methods.f_EnviarEmail(false,
                        null,
                        tipo,
                        from, 
                        from_name,
                        to,
                        subject,
                        text,
                        function(error,message){
                            if(error){
                                Log.writeLog("Erro",message);    
                            }
                            else{
                                Log.writeLog("Info", "Enviado para: " + from);
                            }
                        });
});

app.listen(3000);

if(global.config.Intevalo.habilitado)
    Intervalo.setInterval();
else
    Intervalo.clearInterval();
  

