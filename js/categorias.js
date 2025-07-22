const formCategoria = document.getElementById('formCategoria');
const inputCategoria = document.getElementById('nombreCategoria');
const listaCategorias = document.getElementById('listaCategorias');

formCategoria.addEventListener('submit', function (e) {
  e.preventDefault();
  const nombre = inputCategoria.value.trim();
  if (nombre !== '') {
    agregarCategoria(nombre);
    inputCategoria.value = '';
    setTimeout(() => cargarCategorias(), 100); // dar tiempo a IndexedDB
  }
});

function cargarCategorias() {
  listaCategorias.innerHTML = '';
  obtenerCategorias(function (categorias) {
    categorias.forEach(cat => {
      const li = document.createElement('li');
      li.textContent = cat.nombre;
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.style.marginLeft = '10px';
      btnEliminar.onclick = function () {
        if (confirm(`¿Eliminar la categoria "${cat.nombre}"?`)) {
          eliminarCategoria(cat.id, cargarCategorias);
        }
      };
      li.appendChild(btnEliminar);
      listaCategorias.appendChild(li);
    });
  });
}
