document.addEventListener('DOMContentLoaded', function () {
  abrirDB();

  const btnCategorias = document.getElementById('btnCategorias');
  const seccionCategorias = document.getElementById('seccionCategorias');

  btnCategorias.addEventListener('click', function () {
    mostrarSeccion(seccionCategorias);
  });
});

function mostrarSeccion(seccionActiva) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  seccionActiva.classList.add('activa');
}
