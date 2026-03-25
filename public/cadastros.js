$('#cadastrarUsuarios').click(function(){
	let uid_usuario = $('#uid_usuario').val();
	let id_empresa = $('#id_empresa').val();
	let nome = $('#nome').val();
	let email = $('#email').val();
	let senha = $('#senha').val();
	
	const funcionario = document.getElementById('funcionario');


	if(nome==""){
		alert("Informe um nome;");
		return;
	}

	if(email==""){
		alert("Informe o email;");
		return;
	}

	if(senha==""){
		alert("Informe o senha;");
		return;
	}


	if (funcionario.checked) {
		_funcionario= "0";
	} else {
		_funcionario= "1";
	}
	$.post('/adm/cadasrtar_usuarios', {
		uid_usuario,
		id_empresa,					
		nome,
		email,
		senha,
		_funcionario
	}, function(resposta) {
		//swal(resposta);
		Notiflix.Report.success(
			'Aviso',
			'Usuário Cadastrado com Sucesso.',
			'OK',
			function () {
				//alert('clicou em OK');
				window.location.href = "/adm/principal/"+uid_usuario;
			}
		)
	});
	
	
})
$('#fecharModal').click(function(){
	$('#modalCadastrarProdutos').modal('hide')
})