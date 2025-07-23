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

    if (isNaN(monto) || monto <= 0) return mostrarError('Monto inválido');

    obtenerPresupuestosDelMes(anio, mes, existentes => {
        const existe = existentes.find(p => p.categoriaId === categoriaId);
        if (existe) {
            mostrarAdvertencia('Ya existe un presupuesto para esta categoría este mes. Elimínalo para agregar uno nuevo.');
            return;
        }

        guardarPresupuesto({ categoriaId, monto, anio, mes });
        formPresupuesto.reset();
        setTimeout(cargarPresupuestos, 300);
    });
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
                            fechaTx.getMonth() + 1 === mes;
                    });

                    let totalIngresos = 0, totalEgresos = 0;

                    transaccionesCatMes.forEach(tx => {
                        if (tx.tipo === 'Ingreso') totalIngresos += tx.monto;
                        else if (tx.tipo === 'Egreso') totalEgresos += tx.monto;
                    });

                    const saldo = p.monto + totalIngresos - totalEgresos;

                    const li = document.createElement('li');
                    li.className = 'item-presupuesto';

                    const nombre = document.createElement('span');
                    nombre.className = 'nombre-categoria';
                    nombre.textContent = `${cat?.nombre || 'Sin categoría'}:`;

                    const detalle = document.createElement('span');
                    detalle.className = 'detalle-monto';
                    detalle.innerHTML =
                        `Presupuesto: $${p.monto.toFixed(2)}<br>` +
                        `Ingresos: $${totalIngresos.toFixed(2)} | ` +
                        `Egresos: $${totalEgresos.toFixed(2)}<br>` +
                        `Saldo actual: $${saldo.toFixed(2)} (${mes}/${anio})`;

                    // Colores de advertencia
                    const porcentaje = (totalEgresos / (p.monto + totalIngresos));
                    if (porcentaje >= 1) li.style.backgroundColor = '#ffcccc';
                    else if (porcentaje >= 0.8) li.style.backgroundColor = '#fff3cd';

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

window.cargarPresupuestos = cargarPresupuestos;
