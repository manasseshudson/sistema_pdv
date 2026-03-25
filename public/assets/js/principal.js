$(document).ready(function() {

	if(getCookie("naoMostrarModal")==false){
		//$('#Novidade').modal('show');
	}
	
/*	const options = { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 }
	const formatNumber = new Intl.NumberFormat('pt-BR', options)
	
	console.log(formatNumber.format(<%= total_receber %>));
	console.log(formatNumber.format(<%= total_recebido	 %>));
	var receber = formatNumber.format(<%= total_receber %>);
	var recebido = formatNumber.format(<%= total_recebido %>);

	document.getElementById("vlrTotalReceber").innerHTML="******";
	document.getElementById("vlrTotalRecebidos").innerHTML="******";
	
	document.getElementById("someSwitchOptionSuccess").checked = false;
*/	
	/*
	var checkboxModal = document.getElementById("naoMostrarModal");
	checkboxModal.addEventListener('change', function () {
		if (checkboxModal.checked) {
			document.cookie = "naoMostrarModal=true"; 
		}
	});
	*/
	
	

	//$('#modalNovidades').modal('show');
	$("#cpf").mask("000.000.000-00");
	var url_atual = window.location.href;
	console.log(url_atual);
	$('#valor').mask('000000000000000,00', {reverse: true});
	$("#data_atual").mask("00/00/0000");
	$("#data_vencimento").mask("00/00/0000");
	var getData = dataAtual();			
	document.getElementById("data_atual").value = getData;
	function dataAtual(){
		var data = new Date();
		var dia = String(data.getDate()).padStart(2, '0');
		var mes = String(data.getMonth() + 1).padStart(2, '0');
		var ano = data.getFullYear();
		dataAtual = dia + '/' + mes + '/' + ano;			   
		return dataAtual;
	}
	
	
	
	document.getElementById("informacao_dia").innerHTML = getData;
	
	
	$("#cpf").on("focusout", function() {
		var cpf = $("#cpf").val();
		var id_empresa = $("#id_empresa").val();
		
		$.get("/adm/validarCpf/"+cpf+"/"+id_empresa, function(data){
		
			if (data=="0"){
				$("#salvarCliente").attr("disabled", false);
			}else{
				swal("Cliente já Cadastrado");
				$("#salvarCliente").attr("disabled", true);
				
			}
		});
	})
	
	
	$("#data_atual").on("focusout", function() {
		let data_lancamento = $("#data_atual").val();
		console.log(validaData(data_lancamento))
		
		if(validaData(data_lancamento)==false){
			swal("Informe a data de Lançamento corretamente");
		}
	})
	
	$("#data_vencimento").on("focusout", function() {
		let data_vencimento = $("#data_vencimento").val();
		console.log(data_vencimento)
		if(data_vencimento!=""){
			if(validaData(data_vencimento)==false){
				swal("Informe a data de Vencimento corretamente");
			}
		}
	})
	
	
	$("#atualizarDadosEmpresaUsusario").click(function(){
		
		
		let uid = $("#uid_usuario").val();
		let id_empresa= $("#id_empresa").val();
		let nome_empresa = $("#nome_empresa").val();
		let cnpj_empresa = $("#cnpj_empresa").val();
		
		let nome_user = $("#nome_user").val();
		let email_user = $("#email_user").val();
		let senha_user = $("#senha_user").val();
		
		
		console.log(uid);
		console.log(id_empresa);
		console.log(nome_empresa);
		console.log(cnpj_empresa);
		console.log(nome_user);
		console.log(email_user);
		console.log(senha_user);
		
		$.post('/adm/produtosVendas', {
			uid_usuario: uid,
			id_empresa: id_empresa,					
			nome_empresa: nome_empresa,
			cnpj_empresa: cnpj_empresa,
			nome_user: nome_user,
			email_user: email_user,
			senha_user: senha_user
		}, function(resposta) {
			swal("Dados Atualizados com Sucesso");
			setTimeout(() => {
			  window.location.href = "/adm/principal/"+uid;				  
			}, "1000");
		});
	})
	
	//SALVAR CLIENTE
	$("#salvarCliente").click(function(){
		var uid = $("#uid_usuario").val();
		var id_empresa= $("#id_empresa").val();
		var nome = $("#nome_cliente").val();
		
		var cpf = $("#cpf").val();	
		var cnpj = $("#cnpj").val();	
		
		if (cpf==""){
			cpf=cnpj;
		}
		
		$.post('/adm/addCliente', {
			uid_usuario: uid,				
			nome: nome,
			cpf: cpf,
			id_empresa: id_empresa
			
		}, function(resposta) {
			swal("Cliente Cadastrado com Sucesso");
			setTimeout(() => {
			  window.location.href = "/adm/principal/"+uid;				  
			}, "000");
		});

	})
	
	
	$("#salvarLancamento").click(function(){
	
		var uid = $("#uid_usuario").val();			
		var id_empresa = $("#id_empresa").val();			
		var id_cliente = $("#id_cliente").val();
		var valor = $("#valor").val();	
		
		if(id_cliente=="0" || id_cliente==""){
			swal("Informe o Cliente");
			return;
		}
		console.log('valor '+valor);
		if(valor===undefined || valor==""){
			swal("Informe o Valor");
			return;
		}
		var documento = $("#documento").val();				
		var data_lancamento = $("#data_atual").val();	
		var data_vencimento = $("#data_vencimento").val();					
		var observacao = $("#observacao").val();					
		
		console.log(id_empresa)
		
	$.post('/adm/addLancamento', {
		uid_usuario: uid,
		id_empresa: id_empresa,
		id_cliente: id_cliente,
		documento: documento,
		data: data_lancamento,
		data_vencimento: data_vencimento, 
		valor: valor.replace(',','.'),
		observacao: observacao
		
	}, function(resposta) {
		
		swal(resposta);				
		setTimeout(() => {
		  window.location.href = "/adm/principal/"+uid;
		  
		}, "1000");
		
		
	});

	})


	const greetingMessage = () => {
		let h = new Date().toLocaleTimeString('pt-BR', {hour: 'numeric', hour12: false}); // formato 24 horas (0-23)
		if (h >= 0 && h <= 5) { // entre meia noite (0h) e 5 da madrugada
			return 'Boa madrugada';
		} else if (h >= 6 && h < 12) { // entre 6 e 11 da manhã
			return 'Bom dia';
		} else if (h >= 12 && h < 18) { // entre meio dia (12h) e 17 (5h) da tarde
			return 'Boa tarde';
		} else if (h >= 18 && h <= 23) { // entre 18 (6h) e 23 (11h) da noite
			return 'Boa noite';
	  }
	}
	document.getElementById("saudacao").innerHTML = greetingMessage();
	console.log(greetingMessage())


	function validaData (valor) {
	  // Verifica se a entrada é uma string
	  if (typeof valor !== 'string') {
		return false
	  }

	  // Verifica formado da data
	  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
		return false
	  }

	  // Divide a data para o objeto "data"
	  const partesData = valor.split('/')
	  const data = { 
		dia: partesData[0], 
		mes: partesData[1], 
		ano: partesData[2] 
	  }
	  
	  // Converte strings em número
	  const dia = parseInt(data.dia)
	  const mes = parseInt(data.mes)
	  const ano = parseInt(data.ano)
	  
	  // Dias de cada mês, incluindo ajuste para ano bissexto
	  const diasNoMes = [ 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]

	  // Atualiza os dias do mês de fevereiro para ano bisexto
	  if (ano % 400 === 0 || ano % 4 === 0 && ano % 100 !== 0) {
		diasNoMes[2] = 29
	  }
	  
	  // Regras de validação:
	  // Mês deve estar entre 1 e 12, e o dia deve ser maior que zero
	  if (mes < 1 || mes > 12 || dia < 1) {
		return false
	  }
	  // Valida número de dias do mês
	  else if (dia > diasNoMes[mes]) {
		return false
	  }
	  
	  // Passou nas validações
	  return true
	}
	
	
	function getCookie(cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

})