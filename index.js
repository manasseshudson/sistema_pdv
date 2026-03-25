
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const base64 = require('base-64');
const uniqid = require('uniqid'); 
const uid2 = require('uid2');
const cors = require('cors');
const path = require('path');
const dayjs = require('dayjs');

require('dotenv').config();
app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

const title = 'GERENCIANDO SUA EMPRESA'
const title_adm = ""

const login = require('./login');
const adm = require('./adm');
const user = require('./user');
const administracao = require('./administracao');

app.use('/',login);
app.use('/',adm);
app.use('/',user);
app.use('/',administracao);

app.get('/', (req,res)=>{ 
    res.redirect('/login')
})


app.get('/administrativo', (req,res)=>{ 
	console.log(dayjs().format('DD/MM/YYYY'))    
    console.log(dayjs().format('HH:mm:ss'))

	knex('tb_empresa').select().then(empresas=>{
		res.render('administrativo',{
			title,
			user: "Administrativo",
			empresas		
		})
		
	})
    
})
app.get('/cadastrar',(req,res)=>{
	res.render('cadastrar',{
		title		
	})
})
app.get('/validarCNPJ/:cnpj',(req,res)=>{
	const { cnpj } = req.params;
	
	///let _cnpj = cnpj.replace('/','').replace('.','').replace('.','').replace('-','');
	console.log(cnpj);
	knex('tb_empresa').where({cnpj_sem_formato: cnpj}).select().then(result=>{
		if(result.length>0){
			console.log(result);
			res.send("Empresa já cadastrada com este CNPJ");		
		}else{
			res.send("ok");		
		}
	})
	
})

app.post('/cadEmpresa',(req,res)=>{
	const { nome_empresa, cnpj, nome, email, senha} = req.body;
	let data_cadastro = dayjs().format('DD/MM/YYYY');
	
	knex('tb_empresa').insert({
		nome: 	nome_empresa,
		cnpj : 	cnpj,
		cnpj_sem_formato: cnpj.replace('/','').replace('.','').replace('.','').replace('-',''),
		data_cadastro: data_cadastro
	})	
	.returning('id_empresa')	
	.then(result=>{		
		let id_empresa = result[0];
		let _usuario = base64.encode(email);
		let _senha = base64.encode(senha);
		
		knex('tb_usuario').insert({
			usuario: 		_usuario,
			descricao:  	nome,
			email : 		email,
			senha: 			_senha,
			uid_usuario : 	uid2(10),
			id_empresa: id_empresa
		})	
		.then(result=>{
			//res.redirect('/login');
			res.send('Empresa Cadastrada com Sucesso.')
		})
		
	})
})

app.get('/uid', (req,res)=>{ 
    res.send(uid2(10))
})
/*----------------------------------*/

app.listen( 3003,()=>{
	console.log('Api Rodando porta 3003 ')
})
