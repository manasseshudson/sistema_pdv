
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const base64 = require('base-64');
const dayjs = require('dayjs')


const cookieParser = require('cookie-parser');
const router = express.Router();

const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend");


router.use(cookieParser());

const title = 'GERENCIANDO SUA EMPRESA'

router.get('/loginEmail', (req,res)=>{


	const mailersend = new MailerSend({
		api_key: "mlsn.4520174656bf7433290aff5b27066abd2b00713790a5b3c9bc38673d261e2fbc",
	});

	const recipients = [new Recipient("manasseshudson@gmail.com", "Recipient")];

	const emailParams = new EmailParams()
		.setFrom("info@trial-yzkq340kw86gd796.mlsender.net")
		.setFromName("Your Name")
		.setRecipients(recipients)
		.setSubject("Subject")
		.setHtml("Greetings from the team, you got this message through MailerSend.")
		.setText("Greetings from the team, you got this message through MailerSend.");

	mailersend.send(emailParams);
		res.send('1')
})



router.get('/login', (req,res)=>{
	res.render('login',{
        abrir_aviso: false,
        mensagem_modal: '',
        tempo_modal :1000 ,
        title
    })
})

router.post('/login', (req,res)=>{
    const { email, senha} = req.body;
    let _email = base64.encode(email);
    let _senha = base64.encode(senha);


	//console.log(_email)
	//console.log(_senha)

    try{
        knex('tb_usuario').where({usuario: _email, senha: _senha}).select().then(result=>{     
            
			
            if(result.length>0){
				knex('tb_empresa').where({id_empresa: result[0].id_empresa}).select().then(empresa=>{     
				
					let empresa_cliente = empresa[0].nome; 				
					let id_empresa = empresa[0].id_empresa; 				
					
					if(result[0].admin=="0"){
						res.cookie('user', result[0].uid_usuario); 
						//res.redirect('/user/abertura_caixa/'+result[0].uid_usuario)
						res.redirect('user/vendas/'+result[0].uid_usuario)
						
					}else{
						res.cookie('user', result[0].uid_usuario); 
						res.redirect('adm/principal/'+result[0].uid_usuario)
					}
				})				
            }else{
				res.render('login',{
					abrir_aviso: true,
					mensagem_modal: 'Email ou senha incorretos',
					tempo_modal :2000 ,
					title
				})				
			}            
        })
    }catch(error){
        console.log(error)
    }	
})


router.get('/loginIntegracao/:email/:senha/:cnpj', (req,res)=>{
    const { email, senha, cnpj} = req.params;
    let _email = base64.encode(email);
    let _senha = base64.encode(senha);
	let _cnpj = cnpj;

    try{
        knex('tb_usuario').where({usuario: _email, senha: _senha}).select().then(result=>{     

            if(result.length>0){
				knex('tb_empresa').where({id_empresa: result[0].id_empresa}).select().then(empresa=>{
					//console.log(empresa)
					if (empresa.length>0){
						if (empresa[0].cnpj_sem_formato==_cnpj){
							var result = {"status": 1, "mensagem": "", "dados": empresa};			
							res.status(200).json(result);
							return;			
						}else{
							res.send('Nao foi possivel logar na aplicação. CNPJ Não enconrado')
						}
					}else{
						res.send('Nao foi possivel logar na aplicação')						
					}
					
				})				
            }else{
				res.send('Nao foi possivel logar na aplicação')
			}            
        })
    }catch(error){
			(error)
    }	
})



router.get('/res_senha', (req,res)=>{
    //console.log(dayjs().format('DD/MM/YYYY'))    
    //console.log(dayjs().format('HH:mm:ss'))

	res.render('res_senha',{
        abrir_aviso: false,
        mensagem_modal: '',
        tempo_modal :1000 ,
        title
    })
})

router.post('/res_senha',(req,res)=>{
    const { cpf, email, senha, contra_senha} = req.body;

    if(senha != contra_senha){
        res.render('res_senha',{
            abrir_aviso: true,
            mensagem_modal: 'As Senhas não são iguais.',
            tempo_modal :3000 
        })  
    }else{

        knex('tb_aluno').where({cpf: cpf, email: email}).select().then(result=>{
            if (result.length>0){
                knex('tb_usuario').where({id_aluno : result[0].id_aluno})
                .update({
                    senha : base64.encode(senha)
                }).then(result=>{
                    console.log('senha alterada com sucesso')
                    res.redirect('/ead/login')   
                })
            }else{
                res.render('res_senha',{
                    abrir_aviso: true,
                    mensagem_modal: 'CPF ou Email não encontrados.',
                    tempo_modal :3000 
                })      
            }

        })
    }


})

async function postData(url = "") {
	// Default options are marked with *
	const response = await fetch(url, {
	  method: "GET", // *GET, POST, PUT, DELETE, etc.
	  mode: "cors", // no-cors, *cors, same-origin
	  cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
	  credentials: "same-origin", // include, *same-origin, omit
	  headers: {
		"Content-Type": "application/json",
		// 'Content-Type': 'application/x-www-form-urlencoded',
	  },
	  redirect: "follow", // manual, *follow, error
	  referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
	  //body: JSON.stringify(data), // body data type must match "Content-Type" header
	});

	return response.json(); // parses JSON response into native JavaScript objects
}

module.exports = router;