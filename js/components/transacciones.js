const formTransaccion = document.getElementById('formTransaccion');
const listaTransacciones = document.getElementById('listaTransacciones');
const selectCategoria = document.getElementById('categoriaTransaccion');

formTransaccion.addEventListener('submit', function (e) {
    e.preventDefault();

    const tipo = formTransaccion.tipo.value;
    const monto = parseFloat(formTransaccion.monto.value);
    const ahora = new Date();
    const fecha = `${ahora.toISOString().slice(0, 10)} ${ahora.toTimeString().slice(0, 5)}`; // YYYY-MM-DD HH:MM
    const categoriaId = parseInt(formTransaccion.categoria.value);
    const descripcion = formTransaccion.descripcion.value.trim();

    if (isNaN(monto) || monto <= 0) return alert("Monto inválido");

    agregarTransaccion({ tipo, monto, fecha, categoriaId, descripcion });

    formTransaccion.reset();
    setTimeout(() => {
        cargarTransacciones();
    }, 100);
});

function cargarTransacciones() {
    listaTransacciones.innerHTML = '';
    obtenerTransacciones(transacciones => {
        obtenerCategorias(categorias => {
            transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            transacciones.forEach(tx => {
                const categoria = categorias.find(c => c.id === tx.categoriaId);
                const li = document.createElement('li');
                li.innerHTML = `
          <div>
            <strong>${tx.tipo}:</strong> $${tx.monto.toFixed(2)} -
            ${categoria ? categoria.nombre : 'Sin categoría'} 
            <br><small>${tx.fecha}</small><br>
            <em>${tx.descripcion || ''}</em>
          </div>
        `;
                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.onclick = () => {
                    if (confirm('¿Eliminar transaccion?')) {
                        eliminarTransaccion(tx.id, cargarTransacciones);
                    }
                };
                li.appendChild(btnEliminar);
                listaTransacciones.appendChild(li);
            });
        });
    });
}

function cargarCategoriasEnFormulario() {
  obtenerCategorias(categorias => {
    console.log('Categorías disponibles:', categorias); // 🐞 DEBUG

    selectCategoria.innerHTML = '';
    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      selectCategoria.appendChild(opt);
    });
  });
}

