const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const base64 = require('base-64');
const uniqid = require('uniqid'); 
const uid2 = require('uid2');
//const cookieParser = require('cookie-parser');
//router.use(cookieParser());
const router = express.Router();

const dayjs = require('dayjs')
console.log(dayjs().format())

const title = 'GERENCIANDO SUA EMPRESA'
const title_adm = ""

router.get('/administracao/:empresa/:usuario/:sistema', (req,res)=>{
	const {empresa, usuario, sistema} = req.params;
	
	const date = new Date();
	const today = date.getDate();
	let dataDoDia = dataAtualFormatada(today);
	data_acesso = dayjs().format();
	
	
	const currentDate = new Date();
	const horas_acesso = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;

	console.log(horas_acesso); // Output 2023-08-23 17:02:33
	
	
	knex('tb_administracao').insert({
		empresa: empresa,
		usuario:usuario,
		sistema :sistema,
		data_acesso: dataDoDia,
		hora_acesso:horas_acesso
	}).then(result=>{
		res.send({status: 1, empresa: empresa, usuario: usuario, sistema: sistema, data_acesso: dataDoDia, horas_acesso: horas_acesso})		
	})

	
})

router.get('/administracao/home', (req,res)=>{
	
	
	res.send('administracao')
})

function dataDia (){
	var data = new Date();

	// Guarda cada pedaço em uma variável
	var dia     = data.getDate();           // 1-31
	var dia_sem = data.getDay();            // 0-6 (zero=domingo)
	var mes     = data.getMonth();          // 0-11 (zero=janeiro)
	var ano2    = data.getYear();           // 2 dígitos
	var ano4    = data.getFullYear();       // 4 dígitos
	var hora    = data.getHours();          // 0-23
	var min     = data.getMinutes();        // 0-59
	var seg     = data.getSeconds();        // 0-59
	var mseg    = data.getMilliseconds();   // 0-999
	var tz      = data.getTimezoneOffset(); // em minutos
	
	// Formata a data e a hora (note o mês + 1)
	//var str_data = dia + '/' + (mes+1) + '/' + ano4;
	var str_data = ano4 + '-' + (mes+1) + '-' + dia;
	var str_hora = hora + ':' + min + ':' + seg;
	
	if(dia<10){
		dia="0"+dia;	
	}
	
	var str_data = dia + '/' + (mes+1) + '/' +  ano4;
	// Mostra o resultado
	//alert('Hoje é ' + str_data + ' às ' + str_hora);
	//return str_data + ' ' +str_hora;
	return str_data;

}

function FormataStringData(data) {
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano+("0"+mes).slice(-2)+("0"+dia).slice(-2);
  // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
}

function FormataStringData(data) {
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano+("0"+mes).slice(-2)+("0"+dia).slice(-2);
  // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
}

function dataAtualFormatada(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();

	//return anoF+"-"+mesF+"-"+diaF;
    return diaF+"/"+mesF+"/"+anoF;
}

module.exports = router;
