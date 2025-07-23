let chartsArray = [];
let wrappers = [];
let graficoActual = 0;

function inicializarDB() {
  const request = indexedDB.open("finanzasDB", 1);
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("categorias"))
      db.createObjectStore("categorias", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("presupuestos"))
      db.createObjectStore("presupuestos", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("transacciones"))
      db.createObjectStore("transacciones", { keyPath: "id", autoIncrement: true });
  };
  request.onsuccess = (event) => {
    db = event.target.result;
  };
  request.onerror = (event) => {
    console.error("Error al abrir la base de datos", event);
  };
}

function obtenerDesdeDB(nombre, callback) {
  const request = indexedDB.open("finanzasDB", 1);
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaccion = db.transaction(nombre, "readonly");
    const store = transaccion.objectStore(nombre);
    const datos = [];
    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        datos.push(cursor.value);
        cursor.continue();
      } else {
        callback(datos);
      }
    };
  };
}

function mostrarGrafico(index) {
  wrappers.forEach((w, i) => {
    w.style.display = i === index ? "block" : "none";
  });
  graficoActual = index;
}

async function renderCharts() {
  chartsArray.forEach(chart => chart?.destroy?.());
  chartsArray = [];

  const [categorias, presupuestos, transacciones] = await Promise.all([
    new Promise(resolve => obtenerDesdeDB("categorias", resolve)),
    new Promise(resolve => obtenerDesdeDB("presupuestos", resolve)),
    new Promise(resolve => obtenerDesdeDB("transacciones", resolve)),
  ]);

  const graficosConfig = [
    renderGraficoDistribucionGastosVsIngresos,     // ID: graficoDistribucion
    renderGraficoGastosPorCategoria,               // ID: graficoGastosCategoria
    renderGraficoEvolucionBalance,                 // ID: graficoBalanceMensual
    renderGraficoIngresosEstimadosVsReales,        // ID: graficoIngresos
    renderGraficoBalanceRealVsEstimado             // ID: graficoEvolucion
  ];

  graficosConfig.forEach((fn, i) => {
    const canvas = wrappers[i]?.querySelector("canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    chartsArray[i] = fn(ctx, categorias, presupuestos, transacciones);
  });

  llenarSelectorCategorias(categorias, transacciones);
  mostrarTransaccionesRecientes(transacciones, categorias);
}

function renderGraficoDistribucionGastosVsIngresos(ctx, _, __, transacciones) {
  let totalIngresos = 0, totalEgresos = 0;
  transacciones.forEach(t => {
    if (t.tipo === "Ingreso") totalIngresos += t.monto;
    else totalEgresos += t.monto;
  });

  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Ingresos', 'Egresos'],
      datasets: [{
        data: [totalIngresos, totalEgresos],
        backgroundColor: ['green', 'red']
      }]
    }
  });
}

function renderGraficoGastosPorCategoria(ctx, categorias, _, transacciones) {
  const egresos = {};
  transacciones.forEach(t => {
    if (t.tipo === "Egreso") {
      egresos[t.categoria] = (egresos[t.categoria] || 0) + t.monto;
    }
  });

  const labels = categorias.map(c => c.nombre);
  const data = categorias.map(c => egresos[c.id] || 0);
  

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Egresos por categoría',
        data,
        backgroundColor: labels.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`)
      }]
    }
  });
}

function renderGraficoEvolucionBalance(ctx, _, __, transacciones) {
  const porMes = {};
  transacciones.forEach(t => {
    const fecha = new Date(t.fecha);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    porMes[key] = (porMes[key] || 0) + (t.tipo === "Ingreso" ? t.monto : -t.monto);
  });

  const labels = Object.keys(porMes).sort();
  const data = labels.map(l => porMes[l]);

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Balance mensual',
        data,
        fill: false,
        borderColor: 'blue'
      }]
    }
  });
}

function renderGraficoIngresosEstimadosVsReales(ctx, categorias, presupuestos, transacciones) {
  const ingresos = {};
  transacciones.forEach(t => {
    if (t.tipo === "Ingreso") ingresos[t.categoria] = (ingresos[t.categoria] || 0) + t.monto;
  });

  const labels = categorias.map(c => c.nombre);
  const estimado = categorias.map(c => presupuestos.find(p => p.categoria === c.id)?.monto || 0);
  const real = categorias.map(c => ingresos[c.id] || 0);

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Estimado', data: estimado, backgroundColor: 'orange' },
        { label: 'Real', data: real, backgroundColor: 'green' }
      ]
    }
  });
}

function renderGraficoBalanceRealVsEstimado(ctx, categorias, presupuestos, transacciones) {
  const ingresos = {};
  const egresos = {};
  transacciones.forEach(t => {
    if (t.tipo === "Ingreso") ingresos[t.categoria] = (ingresos[t.categoria] || 0) + t.monto;
    if (t.tipo === "Egreso") egresos[t.categoria] = (egresos[t.categoria] || 0) + t.monto;
  });

  const labels = categorias.map(c => c.nombre);
  const estimado = categorias.map(c => presupuestos.find(p => p.categoria === c.id)?.monto || 0);
  const real = categorias.map(c => (ingresos[c.id] || 0) - (egresos[c.id] || 0));

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Balance Estimado', data: estimado, backgroundColor: 'rgba(75, 192, 192, 0.5)' },
        { label: 'Balance Real', data: real, backgroundColor: 'rgba(255, 99, 132, 0.5)' }
      ]
    }
  });
}

function llenarSelectorCategorias(categorias, transacciones) {
  const selector = document.getElementById("selectCategoriaGrafico");
  selector.innerHTML = '<option value="">Selecciona una categoría</option>';
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.nombre;
    selector.appendChild(option);
  });

  selector.onchange = () => {
    const id = parseInt(selector.value);
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
      renderGraficoPorCategoria(categoria, transacciones);
    }
  };
}

function renderGraficoPorCategoria(categoria, transacciones) {
  const ctx = document.getElementById("graficoCategoriaSeleccionada").getContext("2d");
  const trans = transacciones.filter(t => t.categoria === categoria.id);
  const ingresos = trans.filter(t => t.tipo === "Ingreso").reduce((acc, t) => acc + t.monto, 0);
  const egresos = trans.filter(t => t.tipo === "Egreso").reduce((acc, t) => acc + t.monto, 0);

  if (chartsArray[5]) chartsArray[5].destroy();

  chartsArray[5] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ingresos', 'Egresos'],
      datasets: [{
        label: `Totales para ${categoria.nombre}`,
        data: [ingresos, egresos],
        backgroundColor: ['green', 'red']
      }]
    }
  });
}

function mostrarTransaccionesRecientes(transacciones, categorias) {
  const lista = document.getElementById("listaTransaccionesRecientes");
  lista.innerHTML = "";
  const ultimas = transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
  ultimas.forEach(t => {
    const cat = categorias.find(c => c.id === t.categoria);
    const li = document.createElement("li");
    li.textContent = `${t.tipo}: $${t.monto} (${cat?.nombre || "Sin categoría"})`;
    lista.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarDB();

  wrappers = Array.from(document.querySelectorAll(".grafico-wrapper"));

  document.getElementById("btnAnterior")?.addEventListener("click", () => {
    if (graficoActual > 0) mostrarGrafico(graficoActual - 1);
  });

  document.getElementById("btnSiguiente")?.addEventListener("click", () => {
    if (graficoActual < wrappers.length - 1) mostrarGrafico(graficoActual + 1);
  });

  document.getElementById("btnGraficos")?.addEventListener("click", async (e) => {
    e.preventDefault();
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
    document.getElementById("seccionGraficos").classList.add("activa");
    await renderCharts();
    mostrarGrafico(0);
  });
});
