

## Descripción

Esta aplicación web permite gestionar y visualizar datos financieros personales, como categorías, presupuestos y transacciones, utilizando IndexedDB para almacenamiento local y Chart.js para la visualización interactiva de gráficos.

---

## Características

* Almacenamiento local de categorías, presupuestos y transacciones mediante IndexedDB.
* Visualización de varios gráficos financieros:

  * Distribución de gastos vs ingresos (gráfico de pastel).
  * Gastos por categoría (gráfico de dona).
  * Evolución del balance mensual (gráfico de líneas).
  * Comparación de ingresos estimados vs reales (gráfico de barras).
  * Balance real vs estimado por categoría (gráfico de barras).
* Selector de categoría para ver gráficos detallados.
* Lista de transacciones recientes.
* Navegación entre diferentes gráficos.

---


---

## Instalación y uso

1. Clona el repositorio:

   ```bash
   git clone https://github.com/stghattas/proyecto_3_cliweb.git
   cd proyecto_3_cliweb
   ```

2. Abre el archivo `index.html` en tu navegador (Chrome, Firefox, Edge recomendados).

3. La aplicación inicializará la base de datos IndexedDB y mostrará los gráficos con los datos almacenados.

4. Para agregar datos, usa las interfaces de categorías, presupuestos y transacciones (según estén implementadas).

---

## Estructura del proyecto

```
finanzas-dashboard/
├── index.html           # Página principal con la interfaz y los canvases para gráficos
├── styles.css           # Estilos CSS de la aplicación
├── js              # Lógica principal: IndexedDB, generación y control de gráficos
├── README.md            # Documentación del proyecto
└── assets/              # Recursos estáticos (imágenes, iconos, etc.)
```

---

## Cómo funciona

* **IndexedDB** se inicializa con tres object stores: `categorias`, `presupuestos` y `transacciones`.
* Al abrir la sección de gráficos, se leen los datos de la base, se procesan y generan los gráficos con Chart.js.
* Se muestra un selector para filtrar datos por categoría, que actualiza dinámicamente un gráfico adicional.
* La lista de transacciones recientes se actualiza con los datos más recientes almacenados.

---

## Notas

* Es importante abrir la página en un servidor local o que el navegador permita el uso de IndexedDB para evitar problemas de permisos.
* La base de datos comienza vacía; para visualizar gráficos, se deben agregar datos.
* Asegúrate de que el navegador soporte IndexedDB y Canvas.

---
