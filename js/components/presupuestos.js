const formPresupuesto = document.getElementById('formPresupuesto');
const listaPresupuestos = document.getElementById('listaPresupuestos');
const selectCategoriaPres = document.getElementById('categoriaPresupuesto');

function getFechaActual() {
    const hoy = new Date();
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 };
}

formPresupuesto.addEventListener('submit', function (e) {
    e.preventDefault();

    const categoriaId = parseInt(formPresupuesto.categoria.value);
    const monto = parseFloat(formPresupuesto.monto.value);
    const { anio, mes } = getFechaActual();

    if (isNaN(monto) || monto <= 0) return alert('Monto invalido');

    guardarPresupuesto({ categoriaId, monto, anio, mes });
    formPresupuesto.reset();
    setTimeout(() => cargarPresupuestos(), 100);
});

function cargarPresupuestos() {
    const { anio, mes } = getFechaActual();
    obtenerPresupuestosDelMes(anio, mes, presupuestos => {
        obtenerCategorias(categorias => {
            listaPresupuestos.innerHTML = '';
            presupuestos.forEach(p => {
                const cat = categorias.find(c => c.id === p.categoriaId);
                const li = document.createElement('li');
                li.classList.add('item-presupuesto');

                const nombre = document.createElement('span');
                nombre.className = 'nombre-categoria';
                nombre.textContent = (cat?.nombre || 'Sin categoría') + ':';

                const detalle = document.createElement('span');
                detalle.className = 'detalle-monto';
                detalle.textContent = `$${p.monto.toFixed(2)} (${mes}/${anio})`;

                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.onclick = () => {
                    if (confirm('¿Eliminar presupuesto?')) {
                        eliminarPresupuesto(p.id, cargarPresupuestos);
                    }
                };

                li.append(nombre, detalle, btnEliminar);
                listaPresupuestos.appendChild(li);
            });
        });
    });
}

function cargarCategoriasEnPresupuesto() {
    obtenerCategorias(categorias => {
        selectCategoriaPres.innerHTML = '';
        categorias.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nombre;
            selectCategoriaPres.appendChild(opt);
        });
    });
}
