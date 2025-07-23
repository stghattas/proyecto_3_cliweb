function mostrarError(mensaje) {
  mostrarAlerta(mensaje, 'error');
}

function mostrarAdvertencia(mensaje, onConfirmar, onCancelar) {
  mostrarAlerta(mensaje, 'advertencia', onConfirmar, onCancelar);
}

function mostrarAlerta(mensaje, tipo, onConfirmar, onCancelar) {
  const contenedor = document.getElementById('alertaContainer');
  contenedor.innerHTML = '';

  const alerta = document.createElement('div');
  alerta.className = `alerta ${tipo}`;

  const icono = document.createElement('i');
  icono.className = tipo === 'error'
    ? 'fa-solid fa-xmark'
    : 'fa-solid fa-triangle-exclamation';

  const contenido = document.createElement('div');
  contenido.className = 'contenido-alerta';

  const texto = document.createElement('p');
  texto.textContent = mensaje;
  contenido.appendChild(texto);

  if (tipo === 'error') {
    const instruccion = document.createElement('p');
    instruccion.className = 'instruccion';
    instruccion.textContent = 'Haga clic en cualquier lado de la pantalla para continuar';
    contenido.appendChild(instruccion);
  }

  if (tipo === 'advertencia') {
    const botones = document.createElement('div');
    botones.className = 'botones-alerta';

    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Confirmar';
    btnConfirmar.className = 'btn-confirmar';
    btnConfirmar.onclick = () => {
      contenedor.innerHTML = '';
      if (typeof onConfirmar === 'function') onConfirmar();
    };

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Rechazar';
    btnCancelar.className = 'btn-cancelar';
    btnCancelar.onclick = () => {
      contenedor.innerHTML = '';
      if (typeof onCancelar === 'function') onCancelar();
    };

    botones.appendChild(btnConfirmar);
    botones.appendChild(btnCancelar);
    contenido.appendChild(botones);
  }

  alerta.appendChild(icono);
  alerta.appendChild(contenido);
  contenedor.appendChild(alerta);

  setTimeout(() => alerta.classList.add('mostrar'), 50);

  if (tipo === 'error') {
    const cerrar = () => {
      alerta.classList.remove('mostrar');
      setTimeout(() => {
        contenedor.innerHTML = '';
      }, 400);
      document.removeEventListener('click', cerrar);
    };
    setTimeout(() => {
      document.addEventListener('click', cerrar);
    }, 300);
  }
}
