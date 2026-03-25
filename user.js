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
//console.log(dayjs().format())

const title = 'GERENCIANDO SUA EMPRESA'
const title_adm = ""

router.get('/user/pdv/:uid_usuario/:venda', (req,res)=>{
	const { uid_usuario, venda } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		var id_empresa = result[0].id_empresa;

		var email_user = result[0].email;
		var nome_user = result[0].descricao;
		
		knex('tb_empresa').where({id_empresa: id_empresa}).select().then(result_empresa=>{			
			var UsaContasPagar = result_empresa[0].UsaContasPagar;
			var UsaContasReceber = result_empresa[0].UsaContasReceber;
			var UsaFiado = result_empresa[0].UsaFiado;

			var nome_empresa = result_empresa[0].nome;
			var cnpj_empresa = result_empresa[0].cnpj;
			var cnpj_formatado = result_empresa[0].cnpj_formatado;
			knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{
				knex('tb_produto').where({id_empresa: id_empresa}).select().then(produtos=>{
					//console.log(produtos)
					knex('tb_condicao_pagamento').select().then(condPagto=>{
						//console.log(condPagto)
						
						res.render('user/vendas',{
							title,
							logo: 'IBADEJUF',
							logo_site: title,
							user: result[0].descricao,
							venda,
							nome_empresa,
							cnpj_empresa,
							cnpj_formatado,
							email_user,
							nome_user,
							produtos,
							cliente,
							uid_usuario,
							abrir_aviso: false,
							id_empresa: id_empresa,
							UsaContasPagar,
							UsaContasReceber,
							UsaFiado,
							condPagto
						})			
					})
				})	
			
			})
		})
	})    
	
})


router.get('/user/abertura_caixa/:uid_usuario', async (req,res)=>{
	const { uid_usuario } = req.params;
	
	console.log(uid_usuario);
	//const id = await knex('tb_usuario').where({uid_usuario: uid_usuario}).select().first();
		
	//console.log(dataAtualFormatada())
	//console.log(FormataStringData(dataAtualFormatada()));
	//console.log(dataHojeFormatada())
	
	const dadosAbertura = await knex('tb_lancamento')
			.where({'tb_lancamento.id_empresa': 10})
			.andWhere({uid_usuario: uid_usuario})
			//.andWhere(knex.raw('data_pagamento='+dataHojeFormatada()))
			.andWhere(knex.raw('month(data_pagamento)='+mes()))
			.andWhere(knex.raw('year(data_pagamento)='+ano()))
			.andWhere(knex.raw('day(data_pagamento)='+dia()))
			.andWhere({'descricao':'ABERTURA DE CAIXA'})
			//.andWhere({'descricao':'FECHAMENTO DE CAIXA'})
			.select();
			//ABERTURA DE CAIXA
			//FECHAMENTO DE CAIXA
	
	const dadosFechamento = await knex('tb_lancamento')
			.where({'tb_lancamento.id_empresa': 10})
			.andWhere({uid_usuario: uid_usuario})
			.andWhere(knex.raw('month(data_pagamento)='+mes()))
			.andWhere(knex.raw('year(data_pagamento)='+ano()))
			.andWhere(knex.raw('day(data_pagamento)='+dia()))
			.andWhere({'descricao':'FECHAMENTO DE CAIXA'})
			.select();
	
	
	console.log('qtde abertura: '+dadosAbertura.length)
	console.log('qtde fechamento: '+dadosFechamento.length)
	
	let booExisteAbertura = false;
	let booExisteFechamento = false;
	
	
	if(dadosAbertura.length > 0){
		booExisteAbertura = true
	}
	if(dadosFechamento.length > 0){
		booExisteFechamento = true
	}
	
	if(booExisteAbertura == true && booExisteFechamento == true || booExisteAbertura == false && booExisteFechamento == false  ){
		if(dadosAbertura.length == dadosFechamento.length){
			console.log('fazer nova abertura')
			res.status(200).send({mensagem : "nao houve abertura"});
		}
	}
	
})

router.post('/user/aberturaCaixa',(req,res)=>{
	const {uid_usuario,id_empresa,valor} = req.body;
	
	const date = new Date();
	const today = date.getDate();
	let dataDoDia = dataAtualFormatada(today);
	
	try{
		knex('tb_lancamento').insert({
			uid_usuario,
			id_empresa,
			descricao : "ABERTURA DE CAIXA",
			valor,
			status:1,
			data_pagamento:dataDiaSemHoras(),
			data_externa: dataDoDia
		}).then(result=>{
				res.status(200).send({mensagem : "nao houve abertura"});
		});
	}
	catch(error){
		console.log(error)
	}
})

router.post('/user/fechamentoCaixa',(req,res)=>{
	const {uid_usuario,id_empresa,valor} = req.body;
		
	const date = new Date();
	const today = date.getDate();
	let dataDoDia = dataAtualFormatada(today);
	
	try{
		knex('tb_lancamento').insert({
			uid_usuario,
			id_empresa,
			valor,
			status:1,
			data_pagamento:dataDiaSemHoras(),
			descricao : "FECHAMENTO DE CAIXA",
			data_externa: dataDoDia
		}).then(result=>{
				res.status(200).send({mensagem : "Fechamento de Caixa Realizdo com Sucesso."});
		});
	}
	catch(error){
		console.log(error)
	}
})



router.post('/user/realizarOutrasSaidas',(req,res)=>{
	const {uid_usuario,id_empresa,descricao_saida,valor_saida} = req.body;
	const date = new Date();
	const today = date.getDate();
	let dataDoDia = dataAtualFormatada(today);
	try{
		knex('tb_lancamento').insert({
			uid_usuario,
			id_empresa,
			valor: valor_saida,
			status:1,
			data_pagamento:dataDiaSemHoras(),
			descricao : descricao_saida,
			data_externa: dataDoDia,
			saidas: 1
		}).then(result=>{
			res.status(200).send({mensagem : "Cadastro Realizdo com Sucesso."});
		});
	}
	catch(error){
		console.log(error)
	}
	
	
})



router.get('/user/lancamentos_filtro/:uid_usuario/:mes/:ano', (req,res)=>{

    const { uid_usuario, mes, ano } = req.params;

	


	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{

			knex('tb_lancamento').sum('tb_lancamento.valor as total')
			.where({'tb_lancamento.id_empresa': id_empresa})
			.andWhere(knex.raw('month(data_pagamento)='+mes))
			.andWhere(knex.raw('year(data_pagamento)='+ano))
			.select()
			.then(sum_lancamentos=>{
				//console.log(sum_lancamentos)
				knex('tb_lancamento')
				.where({'tb_lancamento.id_empresa': id_empresa})
				.andWhere(knex.raw('month(data_pagamento)='+mes))
				.andWhere(knex.raw('year(data_pagamento)='+ano))
					.innerJoin('tb_cliente','tb_cliente.id_cliente','tb_lancamento.id_cliente')
					.select('tb_lancamento.id_lancamento','tb_lancamento.documento',
							'tb_lancamento.valor',
							'tb_cliente.nome',
							'tb_lancamento.status',
							'tb_lancamento.data',
							'tb_lancamento.data_externa',
							'tb_lancamento.data_pagamento_externa','tb_lancamento.data_pagamento',knex.raw('month(data_pagamento) as mes_pagamento')  ,
							knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),
							'tb_lancamento.observacao','tb_lancamento.descricao_itens_lancamentos',
							)
					.then(lancamentos=>{
						
						//console.log(sum_lancamentos[0].total)
						let mes_des="";
						if(mes=="01"){
							mes_des ="Janeiro"							
						}
						if(mes=="02"){
							mes_des ="Fevereiro"							
						}
						if(mes=="03"){
							mes_des ="Março"							
						}						
						if(mes=="04"){
							mes_des ="Abril"							
						}
						if(mes=="05"){
							mes_des ="Maio"							
						}
						if(mes=="06"){
							mes_des ="Junho"							
						}
						if(mes=="07"){
							mes_des ="Julho"							
						}
						if(mes=="08"){
							mes_des ="Agosto"							
						}
						if(mes=="09"){
							mes_des ="Setembro"							
						}
						if(mes=="10"){
							mes_des ="Outubro"							
						}
						if(mes=="11"){
							mes_des ="Novembro"							
						}
						if(mes=="12"){
							mes_des ="Dezembro"							
						}
						
						res.render('adm/lancamentos_filtro',{
							title,
							logo: 'IBADEJUF',
							logo_site: title,
							user: result[0].descricao,
							uid_usuario,
							lancamentos,
							abrir_aviso: false,
							id_empresa,
							cliente,
							total : sum_lancamentos[0].total,
							text_mes: mes_des
						})
						
						
						
				})
			})



			
		})
	})    
	
})

/*
router.post('/user/lancamentos_filtro', (req,res)=>{
    const { uid_usuario, mes, ano } = req.body;


	console.log(uid_usuario);
	console.log(mes);
	console.log(ano);

	//console.log(FormataStringData("30/10/2024"))
	
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{

			knex('tb_lancamento')
			.where({'tb_lancamento.id_empresa': id_empresa})
			//.andWhere(knex.raw('month(data_pagamento)=01 AND year(data_pagamento)=2025'))
			.andWhere(knex.raw('month(data_pagamento)='+mes))
			//.andWhere()
				.innerJoin('tb_cliente','tb_cliente.id_cliente','tb_lancamento.id_cliente')
				.select('tb_lancamento.id_lancamento','tb_lancamento.documento',
						'tb_lancamento.valor',
						'tb_cliente.nome',
						'tb_lancamento.status',
						'tb_lancamento.data',
						'tb_lancamento.data_externa',
						'tb_lancamento.data_pagamento_externa','tb_lancamento.data_pagamento',knex.raw('month(data_pagamento) as mes_pagamento')  ,
						knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),
						'tb_lancamento.observacao','tb_lancamento.descricao_itens_lancamentos',
						)
				.then(lancamentos=>{
					
					console.log(lancamentos)
					res.render('adm/lancamentos_filtro',{
						title,
						logo: 'IBADEJUF',
						logo_site: title,
						user: result[0].descricao,
						uid_usuario,
						lancamentos,
						abrir_aviso: false,
						id_empresa,
						cliente
					})
			})
		})
	})    
})
*/

router.get('/user/produtos/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_produto').where({id_empresa: id_empresa}).select().then(produtos=>{
			//console.log(produtos)
			res.render('user/produtos',{
				title,
				logo: 'IBADEJUF',
				logo_site: title,
				user: result[0].descricao,
				produtos,
				uid_usuario,
				id_empresa
			})
		})
	})
})

router.get('/user/addProdutos/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		
			res.render('adm/addProdutos',{
				title,
				logo: 'IBADEJUF',
				logo_site: title,
				user: result[0].descricao,
				
				uid_usuario,
				id_empresa
			})
		
	})	
})

router.get('/user/altProduto/:id_produto/:uid_usuario', (req,res)=>{
    const { uid_usuario, id_produto } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_produto').where({id_produto: id_produto}).select().then(produtos=>{
			//console.log(produtos)
			res.render('adm/altProdutos',{
				title,
				logo: 'IBADEJUF',
				logo_site: title,
				user: result[0].descricao,
				produtos,
				id_produto: produtos[0].id_produto,
				produto: produtos[0].descricao,
				valor: produtos[0].valor,
				uid_usuario,
				id_empresa
			})
		})
	})	
})

router.post('/user/produtos', (req,res)=>{
    const { uid_usuario, id_empresa, produto, valor } = req.body;

	
	knex('tb_produto').insert({
		uid_usuario: uid_usuario,
		id_empresa: id_empresa,
		descricao: produto,
		valor: valor
	}).then(result=>{
		res.send('Produto Cadastrado com sucesso')
	})
	
    
})

router.post('/user/altProdutos', (req,res)=>{
    const { uid_usuario, id_empresa, produto, valor, id_produto } = req.body;

	
	knex('tb_produto')
	.where({id_produto: id_produto})
	.update({
		descricao: produto,
		valor: valor.replace(',','.')
	}).then(result=>{
		res.send('Produto Atualizado com sucesso')
	})
	
    
})
router.get('/user/remProduto/:id_produto/:uid_usuario', (req,res)=>{
    const { uid_usuario, id_produto } = req.params;

	
	knex('tb_produto')
	.where({id_produto: id_produto})
	.del().then(result=>{
		res.redirect('/user/produtos/'+uid_usuario);
		//res.send('Produto excluido com sucesso')
	})
	
    
})


router.post('/user/attDadosPessoais',(req,res)=>{
	const { uid_usuario, id_empresa, nome_empresa, cnpj_empresa, nome_user, email_user, senha_user } = req.body;
	
	
	//console.log(uid_usuario);
	//console.log(id_empresa);
	//console.log(nome_empresa);
	//console.log(cnpj_empresa);
	//console.log(nome_user);
	//console.log(email_user);
	//console.log(senha_user);
	
	knex('tb_empresa')
	.where({id_empresa: id_empresa})
	.update({
		nome: nome_empresa,
		cnpj : 	cnpj_empresa,
		cnpj_sem_formato: cnpj_empresa.replace('/','').replace('.','').replace('.','').replace('-',''),
		
	}).then(result=>{
		
		if(senha_user==""){
			let _usuario = base64.encode(email_user);
			let _senha = base64.encode(senha_user);
				
			knex('tb_usuario')
			.where({uid_usuario: uid_usuario})
			.update({
				usuario: 		_usuario,
				descricao:  	nome_user,
				email : 		email_user
			}).then(result=>{
				res.send('alterando senhda');
				console.log('não trocando senha senhda')				
			})		
		}else{
			let _usuario = base64.encode(email_user);
			let _senha = base64.encode(senha_user);
				
			knex('tb_usuario')
			.where({uid_usuario: uid_usuario})
			.update({
				usuario: 		_usuario,
				descricao:  	nome_user,
				email : 		email_user,
				senha: 			_senha
			}).then(result=>{
				res.send('alterando senhda');
				console.log('alterando senhda')				
			})		
		}
		
		
		
	})
	
	
	
	
	
})


router.get('/user/principal/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		var id_empresa = result[0].id_empresa;

		var email_user = result[0].email;
		var nome_user = result[0].descricao;
		
		knex('tb_empresa').where({id_empresa: id_empresa}).select().then(result_empresa=>{			
			var UsaContasPagar = result_empresa[0].UsaContasPagar;
			var UsaContasReceber = result_empresa[0].UsaContasReceber;
			var UsaFiado = result_empresa[0].UsaFiado;


			var nome_empresa = result_empresa[0].nome;
			var cnpj_empresa = result_empresa[0].cnpj;
			var cnpj_formatado = result_empresa[0].cnpj_formatado;



			const date = new Date();
			const today = date.getDate();
			let currentMonth = date.getMonth() + 1;

			let dataDoDia = dataAtualFormatada(today);
			
			if(currentMonth<10){
				currentMonth="0"+currentMonth;
			}
			knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{
			knex('tb_lancamento')
			.where({'tb_lancamento.id_empresa': id_empresa})
			.andWhere({'tb_lancamento.data_externa': dataDoDia})
			.innerJoin('tb_cliente','tb_cliente.id_cliente','tb_lancamento.id_cliente')			
			.select('tb_lancamento.id_lancamento','tb_lancamento.valor','tb_lancamento.data_pagamento_externa',
					'tb_cliente.nome','tb_lancamento.status','tb_lancamento.data', 
					'tb_lancamento.data_externa','tb_lancamento.documento',
					knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),					
					 'tb_lancamento.observacao').then(lancamentos=>{
						 
					 knex('vwVlrTotalReceber').where({id_empresa: id_empresa}).select().then(vlrTotalReceber=>{
						 knex('vwVlrTotalRecebido').where({id_empresa: id_empresa}).select().then(vlrTotalRecebido=>{
							
							//console.log('valor ecebdio: '+vlrTotalRecebido[0])
							
							
							
							let valorRecebido = "";
							if(vlrTotalRecebido[0]===undefined){
								valorRecebido = "0"
							}else{
								valorRecebido = vlrTotalRecebido[0].valor_recebido;
							}
							//console.log(valorRecebido)
							
							
							
							let valorReceber = "";
							if(vlrTotalReceber.length=="0"){
								valorReceber = "0"
							}else{
								valorReceber = vlrTotalReceber[0].valor_receber;
							}
							//console.log('valor receber : '+valorReceber)
							
							
							knex('tb_boletos_cobranca').where({id_empresa: id_empresa}).andWhere({status: 0}).andWhere({mostrar_dashboard: 1}).select().then(mostrar_boleto=>{
								if(mostrar_boleto.length=="0"){
									visualizar_boleto_dashboard = "0"
									link_boleto_dashboard = ""
								}else{
									visualizar_boleto_dashboard = "1"
									link_boleto_dashboard = mostrar_boleto[0].boleto
								}
							
								res.render('adm/principal',{
									title,
									logo: 'IBADEJUF',
									logo_site: title,
									user: result[0].descricao,
									
									nome_empresa,
									cnpj_empresa,
									cnpj_formatado,
									email_user,
									nome_user,
									
									cliente,
									lancamentos,
									total_receber: valorReceber,
									total_recebido: valorRecebido,
									uid_usuario,
									abrir_aviso: false,
									id_empresa: id_empresa,
									UsaContasPagar,
									UsaContasReceber,
									UsaFiado,
									mostrar_boleto_dashboard: visualizar_boleto_dashboard,
									link_boleto: link_boleto_dashboard
								})						
							})
							
						 })
					 })
					

					
					/*	 
				knex('vw_lancamento_receber').where({id_empresa: id_empresa}).sum('valor_receber as valor_receber').select().then(total_receber=>{
					
					knex('vw_lancamento_recebido').where({id_empresa: id_empresa}).select().then(total_recebido=>{
						knex('vw_lancamento_recebido').where({id_empresa: id_empresa}).sum('valor_recebido as valor_recebido').select().then(total_recebido=>{
							
							if(total_receber.length>0){
								total_receber= total_receber[0].valor_receber;												
							}else{
								total_receber="0.00";
							}						
							
							if(total_recebido.length>0){
								total_recebido= total_recebido[0].valor_recebido;
							}else{
								total_recebido="0.00";
							}
							
						})
					
					})
					
					
				})*/
			})
		})
			
		})
		
		
		
		
		
		
		
	})    
})

router.get('/user/lancamentos/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;


	//console.log(FormataStringData("30/10/2024"))

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{

			knex('tb_lancamento').where({'tb_lancamento.id_empresa': id_empresa})
				.innerJoin('tb_cliente','tb_cliente.id_cliente','tb_lancamento.id_cliente')
				.select('tb_lancamento.id_lancamento','tb_lancamento.documento',
						'tb_lancamento.valor',
						'tb_cliente.nome',
						'tb_lancamento.status',
						'tb_lancamento.data',
						'tb_lancamento.data_externa',
						'tb_lancamento.data_pagamento_externa',
						knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),
						'tb_lancamento.observacao','tb_lancamento.descricao_itens_lancamentos',
						)
				.then(lancamentos=>{
					//console.log(lancamentos[0].id_lancamento)	
					
					/*
					knex('tb_lancamento_produto_observacao').where({id_lancamento: lancamentos[0].id_lancamento}).select().then(obs=>{
						//console.log(obs)
							
							
							
						for (let i = 0; i < obs.length; i++) {
							
							//console.log(obs[i].id_lancamento)
							knex('tb_lancamento').where({id_lancamento: obs[i].id_lancamento}).select('descricao_itens_lancamentos').then(observacao_lanc=>{
								
								console.log(observacao_lanc);
								
							})
							
							
							
							knex('tb_lancamento').where({id_lancamento: obs[0].id_lancamento}).update({
								descricao_itens_lancamentos: obs[i].observacao
							}).then(res=>{})
							
						}
						
					})
					*/
					
					res.render('user/lancamentos',{
						title,
						logo: 'IBADEJUF',
						logo_site: title,
						user: result[0].descricao,
						uid_usuario,
						lancamentos,
						abrir_aviso: false,
						id_empresa,
						cliente
					})
			})
		})
	})    
})




router.post('/user/addLancamento',async (req,res)=>{
	const { uid_usuario, id_empresa,id_cliente,documento,data,data_vencimento,condicao_pagamento,observacao } = req.body;
	
	
	
	const condpagto = await knex('tb_condicao_pagamento').where({Codigo:condicao_pagamento }).select().first();
	
	let _codigo_condicao_pagamento = condicao_pagamento;
	
	if(data_vencimento===undefined ||data_vencimento==""){
		_data_vencimento="1970-01-01";
		data_vencimento_="";
	}else{
		_data_vencimento = FormataStringData(data_vencimento);
		data_vencimento_ = data_vencimento;	
	}
	//let data_ = "2024-10-03";
	let data_ = FormataStringData(data);
	let data_externa = dataAtualFormatada();
	
	
	knex('tb_lancamento').where({documento: documento}).select().then(result=>{
		if(result.length>0){
			knex('tb_lancamento').where({documento: documento}).del().then(result=>{
				//console.log('venda excluida com sucesso');
				knex('tb_lancamento').insert({
					id_cliente:  				id_cliente,
					documento :  				documento,
					data: 		 				data_,
					data_externa: 		 		data_externa,
					data_vencimento: 			_data_vencimento,
					data_vencimento_externa: 	data_vencimento_,
					observacao:  				observacao,
					uid_usuario: 				uid_usuario,
					id_empresa: 				id_empresa,
					condicao_pagamento: 		condpagto.Descricao,
					codigo_condicao_pagamento: _codigo_condicao_pagamento,
					status: 1,
					descricao: "VENDA"
					
					
					
				})
				.returning('id_lancamento')                        
				.then(result=>{
					let id_lancamento = result[0];
					let itens_add = "";
					
					knex('TBtemp_lancamentos_cliente_produtos').where({documento: documento}).select().then(result=>{
						
						let i =1;
						let text = "";
						for (let i = 0; i < result.length; i++) {
							
							
							knex('tb_produto').where({id_produto: result[i].id_produto}).select('descricao').then(prod=>{
								itens_add = 'Produto: '+prod[0].descricao + ' --  Qtde: '+result[i].qtde + ' --  Valor: ' +result[i].valor;
								knex('tb_lancamento_produto_observacao').insert({
									id_lancamento : id_lancamento,
									observacao: itens_add						
								}).then(result=>{})
							})
						}
					})
			
					knex('TBtemp_lancamentos_cliente_produtos').where({documento: documento}).select().then(result=>{
						let i =1;
						let text = "";
						for (let i = 0; i < result.length; i++) {
							
						  knex('tb_lancamento_produto').insert({
							  id_produto: result[i].id_produto,
							  id_lancamento: id_lancamento,
							  qtde: result[i].qtde,
							  valor: result[i].valor
						  }).then(result=>{
								//
								knex('vw_total_venda_produtos')	
								.where({documento: documento})	
								.select().then(result=>{
									var vltTotalLancamento = result[0].vlrTotal;
									knex('tb_lancamento').where({documento: documento})
									.update({
										valor: vltTotalLancamento							
									}).then(result=>{
										//console.log(itens_add)
										knex('tb_lancamento').where({id_lancamento: id_lancamento}).update({														
											descricao_itens_lancamentos: itens_add						
										}).then(result=>{
										})	
									})
								})
							})
						}
						res.send('')
					})
				})
			})
		}else{
			
			knex('tb_lancamento').insert({
				id_cliente:  				id_cliente,
				documento :  				documento,
				data: 		 				data_,
				data_externa: 		 		data_externa,
				data_vencimento: 			_data_vencimento,
				data_vencimento_externa: 	data_vencimento_,
				observacao:  				observacao,
				uid_usuario: 				uid_usuario,
				id_empresa: 				id_empresa,
				condicao_pagamento: 		condpagto.Descricao,
				codigo_condicao_pagamento: _codigo_condicao_pagamento,
				status: 					1,
				descricao: "VENDA"
				
			})
			.returning('id_lancamento')                        
			.then(result=>{
				let id_lancamento = result[0];
				let itens_add = "";
				
				knex('TBtemp_lancamentos_cliente_produtos').where({documento: documento}).select().then(result=>{
					
					let i =1;
					let text = "";
					for (let i = 0; i < result.length; i++) {
						
						
						knex('tb_produto').where({id_produto: result[i].id_produto}).select('descricao').then(prod=>{
							itens_add = 'Produto: '+prod[0].descricao + ' --  Qtde: '+result[i].qtde + ' --  Valor: ' +result[i].valor;
							knex('tb_lancamento_produto_observacao').insert({
								id_lancamento : id_lancamento,
								observacao: itens_add						
							}).then(result=>{})
						})
					}
				})
		
				knex('TBtemp_lancamentos_cliente_produtos').where({documento: documento}).select().then(result=>{
					let i =1;
					let text = "";
					for (let i = 0; i < result.length; i++) {
						
					  knex('tb_lancamento_produto').insert({
						  id_produto: result[i].id_produto,
						  id_lancamento: id_lancamento,
						  qtde: result[i].qtde,
						  valor: result[i].valor
					  }).then(result=>{
							//
							knex('vw_total_venda_produtos')	
							.where({documento: documento})	
							.select().then(result=>{
								var vltTotalLancamento = result[0].vlrTotal;
								knex('tb_lancamento').where({documento: documento})
								.update({
									valor: vltTotalLancamento							
								}).then(result=>{
									//console.log(itens_add)
									knex('tb_lancamento').where({id_lancamento: id_lancamento}).update({														
										descricao_itens_lancamentos: itens_add						
									}).then(result=>{
									})	
								})
							})
						})
					}
					res.send('')
				})
			})
			
		}
	})
	
	
	
})


router.post('/user/editLancamento',(req,res)=>{
	const { uid_usuario, id_cliente,documento, id_empresa , observacao, data, data_vencimento } = req.body;
	
	
	//console.log('uid_usuario '+uid_usuario);
	//console.log('vencimento '+data_vencimento);
	//console.log('doc '+documento);
	//console.log('id_empresa '+id_empresa);
	//console.log('observacao '+observacao);
	//console.log('data '+data);
	
	
	
	/*
	if(data_vencimento===undefined ||data_vencimento==""){
		_data_vencimento="1970-01-01";
		data_vencimento_="";
	}else{
		_data_vencimento = FormataStringData(data_vencimento);
		data_vencimento_ = data_vencimento;	
	}
	//let data_ = "2024-10-03";
	let data_ = FormataStringData(data);
	
	
	let data_externa = dataAtualFormatada();
	
	knex('tb_lancamento').insert({
		id_cliente:  				id_cliente,
		documento :  				documento,
		data: 		 				data_,
		data_externa: 		 		data_externa,
		data_vencimento: 			_data_vencimento,
		data_vencimento_externa: 	data_vencimento_,
		observacao:  				observacao,
		uid_usuario: 				uid_usuario,
		id_empresa: 				id_empresa
	})
	.returning('id_lancamento')                        
	.then(result=>{
		let id_lancamento = result[0];
		let itens_add = "";
		
		knex('TBtemp_lancamentos_cliente_produtos').where({documento: documento}).select().then(result=>{
			
			let i =1;
			let text = "";
			for (let i = 0; i < result.length; i++) {
				
				
				knex('tb_produto').where({id_produto: result[i].id_produto}).select('descricao').then(prod=>{
					itens_add = 'Produto: '+prod[0].descricao + ' --  Qtde: '+result[i].qtde + ' --  Valor: ' +result[i].valor;
					knex('tb_lancamento_produto_observacao').insert({
						id_lancamento : id_lancamento,
						observacao: itens_add
						
					}).then(res=>{})
					
					
				})
			}
		})
		
		knex('TBtemp_lancamentos_cliente_produtos').where({documento: documento}).select().then(result=>{
			let i =1;
			let text = "";
			for (let i = 0; i < result.length; i++) {
				
			  knex('tb_lancamento_produto').insert({
				  id_produto: result[i].id_produto,
				  id_lancamento: id_lancamento,
				  qtde: result[i].qtde,
				  valor: result[i].valor
			  }).then(result=>{
					//
					knex('vw_total_venda_produtos')	
					.where({documento: documento})	
					.select().then(result=>{
						var vltTotalLancamento = result[0].vlrTotal;
						knex('tb_lancamento').where({documento: documento})
						.update({
							valor: vltTotalLancamento							
						}).then(result=>{
							console.log(itens_add)
							knex('tb_lancamento').where({id_lancamento: id_lancamento}).update({						
								
								descricao_itens_lancamentos: itens_add						
							}).then(res=>{
							})	
							
						})
					})				
				
				})
			  
			}
			res.send('')
		})
	})
	*/
})

/*
router.post('/user/addLancamento',(req,res)=>{
	const { uid_usuario, id_cliente,documento,data,data_vencimento,valor,observacao, id_empresa} = req.body;
	
	let data_vencimento_ = "";
	
	if(data_vencimento==""){
		_data_vencimento="1970-01-01";
		data_vencimento_=_data_vencimento;
	}else{
		_data_vencimento = data_vencimento;
		data_vencimento_ = FormataStringData(_data_vencimento);	
	}
	
	let data_ = FormataStringData(data);
	
	knex('tb_lancamento').insert({
		id_cliente:  				id_cliente,
		documento :  				documento,
		data: 		 				data_,
		data_externa: 		 		data,
		data_vencimento: 			data_vencimento_,
		data_vencimento_externa: 	_data_vencimento,
		valor:		 				valor,
		observacao:  				observacao,
		uid_usuario: 				uid_usuario,
		id_empresa: 				id_empresa
	})
	.then(result=>{
		knex('tb_cliente').where({ id_cliente: id_cliente}).select().then(cliente=>{
			knex('tb_log_lancamentos').insert({
				id_cliente: id_cliente,
				nome_cliente: cliente[0].nome,
				documento: documento,
				data_externa: data,
				valor: valor,
				observacao: observacao
			}).then(resultado=>{
				res.send('Lancamento efetuado com sucesso.')
			})	
			
		})
	})
})
*/


router.get('/user/verLacamentoCliente/:id_cliente/:uid_usuario', (req,res)=>{
	const { uid_usuario, id_cliente } = req.params;
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		knex('tb_lancamento')
		.where({id_cliente : id_cliente})
		.select('tb_lancamento.id_lancamento',
			'tb_lancamento.valor',
			
			'tb_lancamento.status',
			'tb_lancamento.data',
			 'tb_lancamento.data_externa',
			 knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),
			 'tb_lancamento.observacao')
			.then(result=>{
			//console.log(result);
			res.redirect('/user/lancamentos_cliente/'+id_cliente+'/'+uid_usuario)
		})
	})    
})

router.get('/user/lancamentos_cliente/:id_cliente/:uid_usuario', (req,res)=>{
	const { uid_usuario, id_cliente } = req.params;
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		var id_empresa = result[0].id_empresa;
		

			knex('tb_lancamento').where({id_cliente : id_cliente}).select('tb_lancamento.id_lancamento',
				'tb_lancamento.valor',			
				'tb_lancamento.status',
				'tb_lancamento.data','tb_lancamento.documento',
				'tb_lancamento.data_externa',
				'tb_lancamento.data_pagamento_externa',
				knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),
				'tb_lancamento.observacao')
			.then(lancamentos=>{
				knex('tb_cliente').where({id_cliente : id_cliente}).select().then(cliente=>{			
					knex('vw_lancamento_receber').where({id_cliente: id_cliente}).select().then(total_receber=>{
							knex('vw_lancamento_recebido').where({id_cliente: id_cliente}).select().then(total_recebido=>{
							
							if(total_receber.length=="0"){
								total_receber="0.00";
							}else{
								total_receber = total_receber[0].valor_receber;
							}	
							if(total_recebido.length=="0"){
								total_recebido="0.00";
							}else{							
								total_recebido= total_recebido[0].valor_recebido;
							}
							res.render('adm/lancamentos_cliente',{
								title,
								logo: 'IBADEJUF',
								logo_site: title,
								user: result[0].descricao,
								clienteNome: cliente[0].nome,
								lancamentos,
								total_receber ,
								total_recebido ,
								uid_usuario,
								abrir_aviso: false,
								id_empresa,
								cliente,
								id_cliente
							})
						})
					})
				})
			})
		
	})    
})

router.get('/user/lancamentos_cliente_detalhes/:id_lancamento/:uid_usuario/:id_cliente?', (req,res)=>{
	const { uid_usuario, id_cliente, id_lancamento } = req.params;
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		var id_empresa = result[0].id_empresa;
		

			knex('tb_lancamento').where({id_lancamento : id_lancamento})
			.select('tb_lancamento.id_lancamento','tb_lancamento.id_cliente','tb_lancamento.documento',
				'tb_lancamento.valor',			
				'tb_lancamento.status',
				'tb_lancamento.data',
				'tb_lancamento.data_externa',
				'tb_lancamento.data_pagamento_externa',
				knex.raw('CASE WHEN tb_lancamento.data_vencimento_externa="1970-01-01" then "" else tb_lancamento.data_vencimento_externa end  as data_vencimento_externa'),
				'tb_lancamento.observacao')
			.then(lancamentos=>{
				
				//knex('tb_cliente').where({id_cliente : id_cliente}).select().then(cliente=>{			
							
					knex('vw_produtos_lancamentos').where({id_lancamento: id_lancamento}).select().then(produtos=>{
						res.render('adm/lancamentos_cliente_detalhes',{
							title,
							logo: 'IBADEJUF',
							logo_site: title,
							user: result[0].descricao,
							clienteNome: "",//cliente[0].nome,
							lancamentos,
							total_receber: "" ,
							total_recebido: "" ,
							uid_usuario,
							abrir_aviso: false,
							id_empresa,
							cliente:"",
							produtos,
							id_cliente:0,
							documento: lancamentos[0].documento,
							valor: lancamentos[0].valor,
							data_vencimento_externa:lancamentos[0].data_vencimento_externa,
							observacao: lancamentos[0].observacao

							
						})
						
						
					})
							
					
				
				//})

			})
		
	})    
})


router.get('/user/remLancamento/:id_lancamento/:uid_usuario', (req,res)=>{
    const { uid_usuario, id_lancamento } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		knex('tb_lancamento')
		.where({id_lancamento : id_lancamento})
		.del()
			.then(result=>{
			res.redirect('/user/lancamentos/'+uid_usuario)
		})
	})    
})

router.get('/user/clientes/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		knex('vw_dados_lancamento_cliente').where({id_empresa_cliente: result[0].id_empresa}).select().then(clientes=>{
			//console.log(clientes)
			res.render('adm/clientes',{
				title,
				logo: 'IBADEJUF',
				logo_site: title,
				user: result[0].descricao,
				uid_usuario,
				clientes,
				abrir_aviso: false
			})
		})
	})    
})

router.get('/user/addCliente/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		res.render('adm/addClientes',{
			title,
			logo: 'IBADEJUF',
			logo_site: title,
			user: result[0].descricao,
			uid_usuario,
			abrir_aviso: false,
			mensagem_modal: 'Cliente ja Cadastrado',
			timer: 1,
			id_empresa : result[0].id_empresa
		})

	})    
})

router.post('/user/addCliente',(req,res)=>{
	const { uid_usuario, nome,email,cpf,telefone,cep,endereco,numero,complemento,bairro,cidade,uf, id_empresa} = req.body;
	
	knex('tb_cliente').insert({
		nome: 					nome,
		email : 				email,
		cpf_cnpj: 				cpf,
		endereco_cep:			cep,
		endereco_rua: 			endereco,
		endereco_numero: 		numero,
		endereco_complemento:	complemento,
		endereco_bairro:		bairro,
		endereco_cidade:		cidade,
		endereco_uf: 			uf,
		endereco_telefone: 		telefone,
		endereco_celular: 		telefone,
		observacao: 			"",
		status: 				1,
		uid_usuario:			uid_usuario,
		id_empresa: 			id_empresa
		
	})
	.returning('uid_usuario')
	.then(result=>{
		let id_cliente = result[0];
		knex('tb_cliente').where({id_cliente: id_cliente}).select().then(cliente=>{		
			//console.log('uid use '+cliente[0].uid_usuario)
			
			res.redirect('/user/addCliente/'+cliente[0].uid_usuario)
		})	
	})
	
})

router.get('/user/delCliente/:id_cliente/:uid_usuario',(req,res)=>{
	const {id_cliente, uid_usuario} =req.params;
	
	knex('tb_cliente')
    .where({id_cliente: id_cliente}).del()    
    .then(result=>{
        
        res.redirect('/user/clientes/'+uid_usuario)        
    })
	
})

router.get('/user/validarCpf/:cpf/:id_empresa',(req,res)=>{
	const {cpf, id_empresa} =req.params;
	
	knex('tb_cliente').where({cpf_CNPJ: cpf}).andWhere({id_empresa: id_empresa}).select().then(result=>{
		//console.log(result)
		//console.log(result.length)
		if(result.length > 0 ){
			console.log('Já Cadastrado Cliente com este cpf :' + cpf)
			res.send('Já Cadastrado Cliente com este cpf :' + cpf)			
		}else{
			res.send("0")
		}
	})
})

router.get('/user/receberLancamentoParcial/:id_lancamento/:uid_usuario',(req,res)=>{
	const { id_lancamento, uid_usuario } = req.params;
	
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{

			knex('tb_lancamento').where({'tb_lancamento.id_empresa': id_empresa}).andWhere({id_lancamento: id_lancamento})
				.innerJoin('tb_cliente','tb_cliente.id_cliente','tb_lancamento.id_cliente')			
				.select('tb_lancamento.id_lancamento','tb_lancamento.id_cliente','tb_cliente.nome as nome_cliente','tb_lancamento.documento','tb_lancamento.data_externa',
				'tb_lancamento.data_vencimento_externa',
				'tb_lancamento.data_vencimento','tb_lancamento.valor', 'tb_lancamento.observacao')
				.then(lancamentos=>{
					console.log(lancamentos[0].valor)
					res.render('adm/receberPagto',{
						id_lancamento: lancamentos[0].id_lancamento,
						id_cliente: lancamentos[0].id_cliente,
						nome_cliente: lancamentos[0].nome_cliente,
						documento: lancamentos[0].documento,
						data: lancamentos[0].data_externa,
						vencimento:lancamentos[0].data_vencimento,
						vencimento_formatado:lancamentos[0].data_vencimento_externa,
						valor: lancamentos[0].valor,
						observacao:lancamentos[0].observacao,
						
						title,
						logo: 'IBADEJUF',
						logo_site: title,
						user: result[0].descricao,
						uid_usuario,
						//lancamentos,
						abrir_aviso: false,
						id_empresa,
						cliente
					})
			})
		})
	})
})

router.get('/user/receberLancamentoTotal/:id_lancamento/:uid_usuario',(req,res)=>{
	const { id_lancamento, uid_usuario } = req.params;
	knex('tb_lancamento')
	.where({id_lancamento: id_lancamento})
	.update({'status': 1,
			data_pagamento: FormataStringData(dataDia()),
			data_pagamento_externa : dataDia()	
	})
	.then(result=>{
		res.redirect('/user/principal/'+uid_usuario)		
	});
})

router.post('/user/receberLancamentoParcial',(req,res)=>{
	const { uid_usuario,id_cliente,documento,data,data_vencimento,valor,observacao, id_empresa, id_lancamento} = req.body;
	
	
	console.log(valor)
	
	let data_vencimento_ = "";
	
	if(data_vencimento==""){
		_data_vencimento="1970-01-01";
		data_vencimento_=_data_vencimento;
	}else{
		_data_vencimento = data_vencimento;
		data_vencimento_ = FormataStringData(_data_vencimento);	
	}
	
	let data_ = FormataStringData(data);
	
	
	knex('tb_lancamento')
	.where({id_lancamento: id_lancamento})
	.select().then(cr=>{
		console.log(cr[0].valor)
		let _valor = cr[0].valor;
		
		let _valor_diferenca = parseFloat(cr[0].valor) - parseFloat(valor);
		console.log('Novo Valor '+valor);
		
		return;
		knex('tb_lancamento')
		.where({id_lancamento: id_lancamento})
		.update({'status': 1, valor: _valor_diferenca}).then(result=>{
		
			console.log('Diferenca '+_valor_diferenca);
			if (valor=="0.00"){
				res.send('Lancamento Recebido com sucesso.')
			}else{
				
				knex('tb_lancamento').insert({
					id_cliente:  				id_cliente,
					documento :  				documento,
					data: 		 				data_,
					data_externa: 		 		data,
					data_vencimento: 			data_vencimento_,
					data_vencimento_externa: 	_data_vencimento,
					valor:		 				valor,
					observacao:  				observacao,
					uid_usuario: 				uid_usuario,
					id_empresa: 				id_empresa
				})
				.then(result=>{
					res.send('Lancamento Recebido com sucesso.')
				})
				
			}
			
			//res.send('Lancamento efetuado com sucesso.')
		})
		
		
	})
	
	/*
	knex('tb_lancamento')
	.where({id_lancamento: id_lancamento})
	.update({status: 'Pago', valor: ''}).then(result=>{
		
	})
	
	
	///let data = dayjs('2019-01-25').format('YYYYMMDD');
	*/
	
})

router.get('/user/editLancamento/:id_lancamento/:uid_usuario',(req,res)=>{
	const { id_lancamento, uid_usuario } = req.params;
	
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		var id_empresa = result[0].id_empresa;
		knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{

			knex('tb_lancamento').where({'tb_lancamento.id_empresa': id_empresa}).andWhere({id_lancamento: id_lancamento})
				.innerJoin('tb_cliente','tb_cliente.id_cliente','tb_lancamento.id_cliente')			
				.select('tb_lancamento.id_lancamento','tb_lancamento.id_cliente','tb_cliente.nome as nome_cliente','tb_lancamento.documento','tb_lancamento.data_externa','tb_lancamento.data_vencimento','tb_lancamento.valor', 'tb_lancamento.observacao')
				.then(lancamentos=>{
					console.log(lancamentos)
				res.render('adm/editLancamento.ejs',{
					id_lancamento: lancamentos[0].id_lancamento,
					id_cliente: lancamentos[0].id_cliente,
					nome_cliente: lancamentos[0].nome_cliente,
					documento: lancamentos[0].documento,
					data: lancamentos[0].data_externa,
					vencimento:lancamentos[0].data_vencimento,
					valor: lancamentos[0].valor,
					observacao:lancamentos[0].observacao,
					
					title,
					logo: 'IBADEJUF',
					logo_site: title,
					user: result[0].descricao,
					uid_usuario,
					//lancamentos,
					abrir_aviso: false,
					id_empresa,
					cliente
				})
			})
		})
	})
})

router.post('/user/editLancamento/',(req,res)=>{
	const { uid_usuario, id_cliente, documento,data,data_vencimento,valor,observacao, id_empresa, id_lancamento} = req.body;
	
	let data_vencimento_ = "";
	
	if(data_vencimento==""){
		_data_vencimento="1970-01-01";
		data_vencimento_=_data_vencimento;
	}else{
		_data_vencimento = data_vencimento;
		data_vencimento_ = FormataStringData(_data_vencimento);	
	}
	
	let data_ = FormataStringData(data);
	
	///let data = dayjs('2019-01-25').format('YYYYMMDD');
	knex('tb_lancamento')
	.where({id_lancamento: id_lancamento})
	.update({
		id_cliente:  				id_cliente,
		documento :  				documento,
		data: 		 				data_,
		data_externa: 		 		data,
		data_vencimento: 			data_vencimento_,
		data_vencimento_externa: 	_data_vencimento,
		valor:		 				valor,
		observacao:  				observacao
	})
	.then(result=>{
		res.send('Lancamento Editado com sucesso.')
	})
})



router.get('/user/editpdv/:uid_usuario/:venda', (req,res)=>{
	const { uid_usuario, venda } = req.params;

	//console.log(venda)

	knex('tb_lancamento').where({documento: venda}).select().then(lancamentos=>{		
		//console.log(lancamentos)
		
		knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		var id_empresa = result[0].id_empresa;
		var email_user = result[0].email;
		var nome_user = result[0].descricao;
		
		knex('tb_empresa').where({id_empresa: id_empresa}).select().then(result_empresa=>{			
			var UsaContasPagar = result_empresa[0].UsaContasPagar;
			var UsaContasReceber = result_empresa[0].UsaContasReceber;
			var UsaFiado = result_empresa[0].UsaFiado;

			var nome_empresa = result_empresa[0].nome;
			var cnpj_empresa = result_empresa[0].cnpj;
			var cnpj_formatado = result_empresa[0].cnpj_formatado;
			knex('tb_cliente').where({id_empresa: id_empresa}).andWhere({id_cliente: lancamentos[0].id_cliente }).select().then(cli=>{
				
				knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{
					
					knex('tb_produto').where({id_empresa: id_empresa}).select().then(produtos=>{
						res.render('adm/editvendas',{
							title,
							logo: 'IBADEJUF',
							logo_site: title,
							user: result[0].descricao,
							vencimento: lancamentos[0].data_vencimento_externa,
							observacao: lancamentos[0].observacao,
							venda,
							nome_empresa,
							cnpj_empresa,
							cnpj_formatado,
							email_user,
							nome_user,
							produtos,
							id_cliente: cli[0].id_cliente,
							nome_cliente:cli[0].nome,
							cliente,
							uid_usuario,
							abrir_aviso: false,
							id_empresa: id_empresa,
							UsaContasPagar,
							UsaContasReceber,
							UsaFiado
						})			
					})
				})	
			
			})
		})
	})
		
	})


        
	
})


router.get('/user/vendas/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{		
		var id_empresa = result[0].id_empresa;

		var email_user = result[0].email;
		var nome_user = result[0].descricao;
		
		knex('tb_empresa').where({id_empresa: id_empresa}).select().then(result_empresa=>{			
			var UsaContasPagar = result_empresa[0].UsaContasPagar;
			var UsaContasReceber = result_empresa[0].UsaContasReceber;
			var UsaFiado = result_empresa[0].UsaFiado;

			var nome_empresa = result_empresa[0].nome;
			var cnpj_empresa = result_empresa[0].cnpj;
			var cnpj_formatado = result_empresa[0].cnpj_formatado;
			knex('tb_cliente').where({id_empresa: id_empresa}).select().then(cliente=>{
				knex('tb_produto').where({id_empresa: id_empresa}).select().then(produtos=>{
							
					
					res.redirect('/user/pdv/'+uid_usuario+'/'+documento_venda())
					
					/*res.render('adm/vendas',{
						title,
						logo: 'IBADEJUF',
						logo_site: title,
						user: result[0].descricao,
						
						nome_empresa,
						cnpj_empresa,
						cnpj_formatado,
						email_user,
						nome_user,
						produtos,
						cliente,
						uid_usuario,
						abrir_aviso: false,
						id_empresa: id_empresa,
						UsaContasPagar,
						UsaContasReceber,
						UsaFiado
					})*/			
				})	
			
			})
		})
	})    
})

router.get('/user/getDadosproduto/:id_produto',(req,res)=>{
	const { id_produto } = req.params;
	
	knex('tb_produto').where({id_produto : id_produto}).select().then(result=>{
		//console.log(result)
		if(result.length>0){
			////console.log(result[0].valor)
			res.send(result[0].valor)
		}
	})
})
router.post('/user/produtosVendas',(req,res)=>{
	
	const { uid_usuario, documento_interno, /*id_cliente, */id_produto, qtde, valor } = req.body;

	///console.log('documento  '+documento_interno)
	//console.log('uid  '+uid_usuario)
	//console.log('cleinte '+id_cliente)				
	//console.log('produto '+id_produto)
	//console.log('Quantidade '+qtde)
	//console.log('Quantidade '+valor)
	
	knex('TBtemp_lancamentos_cliente_produtos').insert({
		documento: documento_interno,
		id_cliente: 0,
		id_produto: id_produto,
		qtde : qtde,
		valor: valor
		
	}).then(result=>{
		knex('TBtemp_lancamentos_cliente_produtos').where({documento : documento_interno}).select().then(result=>{
				//console.log(result)
				//res.send(result[0].valor)
				res.send('')
				/*res.render('/user/produtos_tabela',{
					produtos: result
				})*/			
			
		})
		
	})
})
router.get('/user/produtos_tabela/:uid_usuario/:documento_interno/:tipo',(req,res)=>{
	const {uid_usuario, documento_interno, tipo}= req.params;
	
	knex('TBtemp_lancamentos_cliente_produtos')
	.innerJoin('tb_produto','tb_produto.id_produto','TBtemp_lancamentos_cliente_produtos.id_produto')
	.where({documento: documento_interno})	
	.select('id_temp_lancamentos_cliente_produtos','tb_produto.id_produto',
			'tb_produto.descricao as produto',
			'TBtemp_lancamentos_cliente_produtos.qtde',
			'TBtemp_lancamentos_cliente_produtos.valor',
			knex.raw('TBtemp_lancamentos_cliente_produtos.qtde * TBtemp_lancamentos_cliente_produtos.valor as valorTotal')
			).then(result=>{
				
				if(tipo=="A"){
					res.render('adm/produtos_tabela',{
						produtos: result,
						documento: documento_interno,
						uid_usuario
					})
				}else{
					res.render('adm/produtos_tabela_e',{
						produtos: result,
						documento: documento_interno,
						uid_usuario
					})					
				}
		})
	
})
router.get('/user/produtos_tabela_total/:documento_interno',(req,res)=>{
	const {documento_interno}= req.params;
	
	knex('vw_total_venda_produtos')	
	.where({documento: documento_interno})
	
	.select().then(result=>{
				//console.log(result)
				//res.send(result[0].valor)
				if(result.length>0){
					res.render('adm/produtos_tabela_total',{
						vlrTotal: result[0].vlrTotal
					})
				}else{
					
					res.render('adm/produtos_tabela_total',{
						vlrTotal: 0
					})
				}
		})
	
})
router.get('/user/removerProdutosVenda/:id/:uid_usuario/:documento/:tipo', (req,res)=>{
	const {id, uid_usuario, documento, tipo}= req.params;
	
	knex('TBtemp_lancamentos_cliente_produtos')
	.where({id_temp_lancamentos_cliente_produtos: id})
	.del().then(result=>{
		if(tipo=="E"){
			res.redirect('/user/editPdv/'+uid_usuario+'/'+documento)
		}else{
			res.redirect('/user/pdv/'+uid_usuario+'/'+documento)
		}
	})	
	
})
/*
router.get('/user/removerProdutosVenda/:id/:uid_usuario/:documento', (req,res)=>{
	const {id, uid_usuario, documento}= req.params;
	
	knex('TBtemp_lancamentos_cliente_produtos')
	.where({id_temp_lancamentos_cliente_produtos: id})
	.del().then(result=>{
	
		//res.redirect('/user/produtos_tabela/'+documento)
		res.redirect('/user/pdv/'+uid_usuario+'/'+documento)
		
		
	})	
	
})
*/

router.get('/verificarProdutos/:id_empresa',(req,res)=>{
	const { id_empresa } =req.params;
	
	knex('tb_produto').where({id_empresa : id_empresa}).select().then(produtos=>{
		var result = {"status": 1, "mensagem": "", "dados": produtos};			
		res.status(200).json(result);
		return;					
	})
})


module.exports = router;



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
	return ano4+(mes+1)+dia+hora+min+seg;
	

}
function dataDiaSemHoras (){
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
	//return str_data;
	return ano4+'-'+(mes+1)+'-'+dia;
	

}
/*
function FormataStringData(data) {
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano+("0"+mes).slice(-2)+("0"+dia).slice(-2);
  // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
}
*/
function FormataStringData(data) {
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano+("0"+mes).slice(-2)+("0"+dia).slice(-2);
  // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
}

function DataDiaBanco(data) {
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano+"-"+("0"+mes).slice(-2)+"-"+("0"+dia).slice(-2);
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

function mes(){
    var data = new Date(),
        //dia  = data.getDate().toString(),
        //diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();

	//return anoF+"-"+mesF+"-"+diaF;
    return mesF;
}

function dia(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();

	//return anoF+"-"+mesF+"-"+diaF;
    return diaF;
}

function ano(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();

	//return anoF+"-"+mesF+"-"+diaF;
    return anoF;
}



function documento_venda (){
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
	return ano4+''+(mes+1)+dia+hora+min+seg;
	

}


function dataHojeFormatada() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // meses começam em 0
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}