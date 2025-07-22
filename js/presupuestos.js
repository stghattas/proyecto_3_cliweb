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

    if (isNaN(monto) || monto <= 0) return alert('Monto inválido');

    guardarPresupuesto({ categoriaId, monto, anio, mes });
    formPresupuesto.reset();

    setTimeout(() => {
        cargarPresupuestos();
    }, 300);
});

function cargarPresupuestos() {
    const { anio, mes } = getFechaActual();
    obtenerPresupuestosDelMes(anio, mes, presupuestos => {
        obtenerCategorias(categorias => {
            obtenerTransacciones(transacciones => {
                listaPresupuestos.innerHTML = '';

                presupuestos.forEach(p => {
                    const cat = categorias.find(c => c.id === p.categoriaId);

                    const transaccionesCatMes = transacciones.filter(tx => {
                        const fechaTx = new Date(tx.fecha);
                        return tx.categoriaId === p.categoriaId &&
                            fechaTx.getFullYear() === anio &&
                            (fechaTx.getMonth() + 1) === mes;
                    });

                    let totalIngresos = 0;
                    let totalEgresos = 0;

                    transaccionesCatMes.forEach(tx => {
                        if (tx.tipo === 'Ingreso') totalIngresos += tx.monto;
                        else if (tx.tipo === 'Egreso') totalEgresos += tx.monto;
                    });

                    const saldo = p.monto + totalIngresos - totalEgresos;

                    const li = document.createElement('li');
                    li.classList.add('item-presupuesto');

                    const nombre = document.createElement('span');
                    nombre.className = 'nombre-categoria';
                    nombre.textContent = (cat?.nombre || 'Sin categoría') + ':';

                    const detalle = document.createElement('span');
                    detalle.className = 'detalle-monto';
                    detalle.textContent =
                        `Presupuesto: $${p.monto.toFixed(2)} | ` +
                        `Saldo actual: $${saldo.toFixed(2)} (${mes}/${anio})`;

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

// Hacer disponible globalmente
window.cargarPresupuestos = cargarPresupuestos;

