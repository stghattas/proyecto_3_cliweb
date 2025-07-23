let db;

function abrirDB(callback) {
  const request = indexedDB.open('FinanzasDB', 5); //!!!Aumentar cada que se cambia de version!!!

  request.onupgradeneeded = function (e) {
    db = e.target.result;

    if (!db.objectStoreNames.contains('categorias')) {
      db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
    }

    if (!db.objectStoreNames.contains('transacciones')) {
      const store = db.createObjectStore('transacciones', { keyPath: 'id', autoIncrement: true });
      store.createIndex('fecha', 'fecha', { unique: false });
    }

    if (!db.objectStoreNames.contains('presupuestos')) {
      const store = db.createObjectStore('presupuestos', { keyPath: 'id', autoIncrement: true });
      store.createIndex('fecha', ['anio', 'mes', 'categoriaId'], { unique: true });
    }
  };

  request.onsuccess = function (e) {
    db = e.target.result;
    if (callback) callback();
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

// updates

// Funciones para transacciones
function agregarTransaccion(data) {
  const tx = db.transaction(['transacciones'], 'readwrite');
  const store = tx.objectStore('transacciones');
  store.add(data);
}

function obtenerTransacciones(callback) {
  const tx = db.transaction(['transacciones'], 'readonly');
  const store = tx.objectStore('transacciones');
  const request = store.getAll();
  request.onsuccess = () => callback(request.result);
}

function eliminarTransaccion(id, callback) {
  const tx = db.transaction(['transacciones'], 'readwrite');
  const store = tx.objectStore('transacciones');
  store.delete(id);
  tx.oncomplete = callback;
}

// Funciones para presupuesto
function guardarPresupuesto(presupuesto) {
  const tx = db.transaction(['presupuestos'], 'readwrite');
  const store = tx.objectStore('presupuestos');
  store.put(presupuesto);
}

function obtenerPresupuestosDelMes(anio, mes, callback) {
  const tx = db.transaction(['presupuestos'], 'readonly');
  const store = tx.objectStore('presupuestos');
  const request = store.getAll();
  request.onsuccess = () => {
    const resultados = request.result.filter(p => p.anio === anio && p.mes === mes);
    callback(resultados);
  };
}

function eliminarPresupuesto(id, callback) {
  const tx = db.transaction(['presupuestos'], 'readwrite');
  tx.objectStore('presupuestos').delete(id);
  tx.oncomplete = callback;
}
