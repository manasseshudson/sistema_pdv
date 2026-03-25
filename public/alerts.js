// CONFIGURAÇÃO GLOBAL
Notiflix.Notify.init({
  position: 'center-cente',
  timeout: 3000,
  fontSize: '14px',
});

Notiflix.Confirm.init({
  okButtonBackground: '#16a34a',
  cancelButtonBackground: '#dc2626',
});

// ALERTA DE SUCESSO
function alertSucesso(msg = 'Operação realizada com sucesso!') {
  Notiflix.Notify.success(msg);
}

// ALERTA DE ERRO
function alertErro(msg = 'Ocorreu um erro inesperado!') {
  Notiflix.Notify.failure(msg);
}

// ALERTA DE INFORMAÇÃO
function alertInfo(msg) {
  Notiflix.Notify.info(msg);
}

// ALERTA DE AVISO
function alertAviso(msg) {
  Notiflix.Notify.warning(msg);
}

// CONFIRMAÇÃO
function alertConfirmacao(msg, onConfirm) {
  Notiflix.Confirm.show(
    'Confirmação',
    msg,
    'Sim',
    'Não',
    function () {
      if (typeof onConfirm === 'function') onConfirm();
    }
  );
}

// LOADING
function alertLoading(msg = 'Processando...') {
  Notiflix.Loading.standard(msg);
}

// FECHAR LOADING
function alertCloseLoading() {
  Notiflix.Loading.remove();
}



function alertAvisoCentral(msg, onOk) {
  Notiflix.Report.warning(
    'Aviso',
    msg,
    'OK',
    function () {
      if (typeof onOk === 'function') onOk();
    }
  );
}
