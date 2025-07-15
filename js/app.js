document.addEventListener('DOMContentLoaded', function () {
    abrirDB(() => {
        // solo después de que la DB esté lista
        cargarCategorias();
        cargarCategoriasEnFormulario();
    });


    const btnCategorias = document.getElementById('btnCategorias');
    const seccionCategorias = document.getElementById('seccionCategorias');
    const btnTransacciones = document.getElementById('btnTransacciones');
    const seccionTransacciones = document.getElementById('seccionTransacciones');

    btnTransacciones.addEventListener('click', () => {
        mostrarSeccion(seccionTransacciones);
        cargarTransacciones();
        cargarCategoriasEnFormulario();
    });

    btnCategorias.addEventListener('click', function () {
        mostrarSeccion(seccionCategorias);
    });
});

function mostrarSeccion(seccionActiva) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    seccionActiva.classList.add('activa');
}
