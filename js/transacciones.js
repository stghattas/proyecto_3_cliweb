const formTransaccion = document.getElementById('formTransaccion');
const listaTransacciones = document.getElementById('listaTransacciones');
const selectCategoria = document.getElementById('categoriaTransaccion');

function formatearFechaHora(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'Fecha inválida';
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: 'numeric', minute: '2-digit',
        hour12: true
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
}

formTransaccion.addEventListener('submit', function (e) {
    e.preventDefault();

    const tipo = formTransaccion.tipo.value;
    const monto = parseFloat(formTransaccion.monto.value);
    const ahora = new Date();
    const fecha = ahora.toISOString();
    const categoriaId = parseInt(formTransaccion.categoria.value);
    const descripcion = formTransaccion.descripcion.value.trim();

    if (isNaN(monto) || monto <= 0) return mostrarError('error', 'Monto inválido');

    // Verificar presupuesto antes de registrar transacción
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;

    obtenerPresupuestosDelMes(anio, mes, presupuestos => {
        const presupuesto = presupuestos.find(p => p.categoriaId === categoriaId);

        if (presupuesto) {
            obtenerTransacciones(transacciones => {
                const transaccionesFiltradas = transacciones.filter(tx => {
                    const fechaTx = new Date(tx.fecha);
                    return tx.categoriaId === categoriaId &&
                        fechaTx.getFullYear() === anio &&
                        fechaTx.getMonth() + 1 === mes;
                });

                let totalIngresos = 0;
                let totalEgresos = 0;

                transaccionesFiltradas.forEach(tx => {
                    if (tx.tipo === 'Ingreso') totalIngresos += tx.monto;
                    else if (tx.tipo === 'Egreso') totalEgresos += tx.monto;
                });

                const saldo = presupuesto.monto + totalIngresos - totalEgresos;

                if (tipo === 'Egreso') {
                    const porcentajeUsado = (totalEgresos + monto) / (presupuesto.monto + totalIngresos);

                    if (porcentajeUsado > 1) {
                        mostrarError('Esta transacción excede el presupuesto disponible y no se registrará.');
                        return;
                    }

                    let mensajeAdvertencia = '';
                    if (porcentajeUsado === 1) {
                        mensajeAdvertencia = 'Esta transacción dejará tu presupuesto en 0. ¿Deseas continuar?';
                    } else if (porcentajeUsado >= 0.8) {
                        mensajeAdvertencia = 'Estás por alcanzar tu presupuesto. ¿Deseas continuar?';
                    }

                    //en consola se muestra
                    if (mensajeAdvertencia) {
                        mostrarAdvertencia(mensajeAdvertencia, () => {
                            procesarTransaccion({ tipo, monto, fecha, categoriaId, descripcion });
                        }, () => {
                            console.log('Transacción cancelada por el usuario.');
                        });
                        return;
                    }
                }

                agregarTransaccion({ tipo, monto, fecha, categoriaId, descripcion });
                formTransaccion.reset();
                setTimeout(() => {
                    cargarTransacciones();
                    if (typeof cargarPresupuestos === 'function') cargarPresupuestos();
                }, 100);
            });

        } else {
            agregarTransaccion({ tipo, monto, fecha, categoriaId, descripcion });
            formTransaccion.reset();
            setTimeout(() => {
                cargarTransacciones();
                if (typeof cargarPresupuestos === 'function') cargarPresupuestos();
            }, 100);
        }
    });
});

function cargarTransacciones() {
    listaTransacciones.innerHTML = '';
    obtenerTransacciones(transacciones => {
        obtenerCategorias(categorias => {
            obtenerPresupuestosDelMes(new Date().getFullYear(), new Date().getMonth() + 1, presupuestos => {
                transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                transacciones.forEach(tx => {
                    const categoria = categorias.find(c => c.id === tx.categoriaId);
                    const presupuesto = presupuestos.find(p => p.categoriaId === tx.categoriaId);
                    const li = document.createElement('li');
                    const fechaFormateada = formatearFechaHora(new Date(tx.fecha));
                    let extra = '';

                    if (presupuesto) {
                        const transaccionesCat = transacciones.filter(t => {
                            const f = new Date(t.fecha);
                            return t.categoriaId === tx.categoriaId &&
                                f.getFullYear() === new Date().getFullYear() &&
                                f.getMonth() + 1 === new Date().getMonth() + 1;
                        });

                        let totalIngresos = 0, totalEgresos = 0;
                        transaccionesCat.forEach(t => {
                            if (t.tipo === 'Ingreso') totalIngresos += t.monto;
                            else if (t.tipo === 'Egreso') totalEgresos += t.monto;
                        });

                        const saldo = presupuesto.monto + totalIngresos - totalEgresos;
                        extra = `<br><small><strong>Saldo presupuesto:</strong> $${saldo.toFixed(2)}</small>`;
                    }

                    li.innerHTML = `
            <div>
              <strong>${tx.tipo}:</strong> $${tx.monto.toFixed(2)} - ${categoria ? categoria.nombre : 'Sin categoría'}
              <br><small>${fechaFormateada}</small>${extra}
              <br><em>${tx.descripcion || ''}</em>
            </div>
          `;
                    const btnEliminar = document.createElement('button');
                    btnEliminar.textContent = 'Eliminar';
                    btnEliminar.onclick = () => {
                        if (confirm('¿Eliminar transacción?')) {
                            eliminarTransaccion(tx.id, () => {
                                cargarTransacciones();
                                if (typeof cargarPresupuestos === 'function') cargarPresupuestos();
                            });
                        }
                    };
                    li.appendChild(btnEliminar);
                    listaTransacciones.appendChild(li);
                });
            });
        });
    });
}

function cargarCategoriasEnFormulario() {
    obtenerCategorias(categorias => {
        selectCategoria.innerHTML = '';
        categorias.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nombre;
            selectCategoria.appendChild(opt);
        });
    });
}

function procesarTransaccion(data) {
    agregarTransaccion(data);
    formTransaccion.reset();
    setTimeout(() => {
        cargarTransacciones();
        if (typeof cargarPresupuestos === 'function') cargarPresupuestos();
    }, 100);
}