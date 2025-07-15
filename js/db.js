let db;

function abrirDB() {
  const request = indexedDB.open('FinanzasDB', 1);

  request.onupgradeneeded = function (e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains('categorias')) {
      db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = function (e) {
    db = e.target.result;
    cargarCategorias(); // al iniciar
  };

  request.onerror = function () {
    console.error('Error al abrir IndexedDB');
  };
}

function agregarCategoria(nombre) {
  const transaction = db.transaction(['categorias'], 'readwrite');
  const store = transaction.objectStore('categorias');
  store.add({ nombre });
}

function obtenerCategorias(callback) {
  const transaction = db.transaction(['categorias'], 'readonly');
  const store = transaction.objectStore('categorias');
  const request = store.getAll();
  request.onsuccess = function () {
    callback(request.result);
  };
}

function eliminarCategoria(id, callback) {
  const transaction = db.transaction(['categorias'], 'readwrite');
  const store = transaction.objectStore('categorias');
  store.delete(id);
  transaction.oncomplete = callback;
}
