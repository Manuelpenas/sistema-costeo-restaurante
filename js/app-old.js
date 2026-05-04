let medidas = JSON.parse(localStorage.getItem('medidas')) || [];
let ingredientes = JSON.parse(localStorage.getItem('ingredientes')) || [];
let subRecetas = JSON.parse(localStorage.getItem('subRecetas')) || [];
let recetas = JSON.parse(localStorage.getItem('recetas')) || [];
let costosFijos = JSON.parse(localStorage.getItem('costosFijos')) || [];

// Variables de edición
let editingMedidaId = null;
let editingIngredienteId = null;
let editingSubRecetaId = null;
let editingrecetaId = null;
let editingCostoFijoId = null;

document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initFormMedida();
    initFormIngrediente();
    initFormSubReceta();
    initFormreceta();
    initFormCostoFijo();
    cargarMedidas();
    cargarIngredientes();
    cargarsubRecetas();
    cargarrecetas();
    cargarCostosFijos();
    actualizarSelectores();
    cargarStockTable();
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            document.getElementById(tab).classList.add('active');
            if (tab === 'costos') {
                actualizarSelectores();
            }
            if (tab === 'inventario') {
                cargarStockTable();
            }
            if (tab === 'recetas') {
                actualizarSelectoresCostosFijos();
            }
        });
    });
}

// ==================== MEDIDAS ====================
function initFormMedida() {
    const form = document.getElementById('form-medida');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-medida').value.trim();
        const abreviatura = document.getElementById('abreviatura').value.trim();
        const equivalencia = parseFloat(document.getElementById('equivalencia').value);
        const unidadBase = document.getElementById('unidad-base').value;
        
        if (!nombre || !abreviatura || !equivalencia || !unidadBase) {
            alert('Complete todos los campos');
            return;
        }
        
        if (editingMedidaId) {
            // Actualizar
            const medida = medidas.find(m => m.id === editingMedidaId);
            if (medida) {
                medida.nombre = nombre;
                medida.abreviatura = abreviatura;
                medida.equivalencia = equivalencia;
                medida.unidadBase = unidadBase;
            }
            editingMedidaId = null;
            document.getElementById('btn-cancelar-medida').style.display = 'none';
            form.querySelector('button[type="submit"]').textContent = 'Guardar Medida';
        } else {
            // Crear nuevo
            if (medidas.some(m => m.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert('Esta medida ya existe.');
                return;
            }
            medidas.push({
                id: Date.now(),
                nombre: nombre,
                abreviatura: abreviatura,
                equivalencia: equivalencia,
                unidadBase: unidadBase
            });
        }
        
        guardarDatos();
        form.reset();
        cargarMedidas();
        actualizarSelectoresMedidas();
    });
}

function cargarMedidas() {
    const tbody = document.querySelector('#tabla-medidas tbody');
    tbody.innerHTML = '';
    medidas.forEach(m => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => editarMedida(m.id);
        tr.innerHTML = `
            <td>${m.nombre}</td>
            <td>${m.abreviatura}</td>
            <td>${m.equivalencia}</td>
            <td>${m.unidadBase}</td>
            <td><button class="btn-remove" onclick="event.stopPropagation(); eliminarMedida(${m.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function editarMedida(id) {
    const medida = medidas.find(m => m.id === id);
    if (!medida) return;
    editingMedidaId = id;
    document.getElementById('nombre-medida').value = medida.nombre;
    document.getElementById('abreviatura').value = medida.abreviatura;
    document.getElementById('equivalencia').value = medida.equivalencia;
    document.getElementById('unidad-base').value = medida.unidadBase;
    document.getElementById('btn-cancelar-medida').style.display = 'inline-block';
    document.querySelector('#form-medida button[type="submit"]').textContent = 'Actualizar Medida';
}

function cancelarEdicionMedida() {
    editingMedidaId = null;
    document.getElementById('form-medida').reset();
    document.getElementById('btn-cancelar-medida').style.display = 'none';
    document.querySelector('#form-medida button[type="submit"]').textContent = 'Guardar Medida';
}

function eliminarMedida(id) {
    if (confirm('¿Eliminar esta medida?')) {
        medidas = medidas.filter(m => m.id !== id);
        guardarDatos();
        cargarMedidas();
        actualizarSelectoresMedidas();
    }
}

// ==================== INGREDIENTES ====================
function initFormIngrediente() {
    const form = document.getElementById('form-ingrediente');
    const cantidadInput = document.getElementById('cantidad');
    const precioTotalInput = document.getElementById('precio-total-ing');
    const precioUnitarioInput = document.getElementById('precio-unitario');

    function calcularPrecioUnitario() {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precioTotal = parseFloat(precioTotalInput.value) || 0;
        if (cantidad > 0) {
            precioUnitarioInput.value = (precioTotal / cantidad).toFixed(4);
        } else {
            precioUnitarioInput.value = '';
        }
    }

    cantidadInput.addEventListener('input', calcularPrecioUnitario);
    precioTotalInput.addEventListener('input', calcularPrecioUnitario);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-ingrediente').value.trim();
        const categoria = document.getElementById('categoria').value;
        const unidad = document.getElementById('unidad').value;
        const cantidad = parseFloat(document.getElementById('cantidad').value);
        const precioTotal = parseFloat(document.getElementById('precio-total-ing').value);
        const precioUnitario = cantidad > 0 ? precioTotal / cantidad : 0;

        if (editingIngredienteId) {
            const ingrediente = ingredientes.find(i => i.id === editingIngredienteId);
            if (ingrediente) {
                ingrediente.categoria = categoria;
                ingrediente.nombre = nombre;
                ingrediente.unidad = unidad;
                ingrediente.cantidad = cantidad;
                ingrediente.precioTotal = precioTotal;
                ingrediente.precioUnitario = precioUnitario;
            }
            editingIngredienteId = null;
            document.getElementById('btn-cancelar-ingrediente').style.display = 'none';
            form.querySelector('button[type="submit"]').textContent = 'Guardar Ingrediente';
        } else {
            if (ingredientes.some(i => i.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert('Este ingrediente ya está registrado.');
                return;
            }
            ingredientes.push({
                id: Date.now(),
                categoria: categoria,
                nombre: nombre,
                unidad: unidad,
                cantidad: cantidad,
                precioTotal: precioTotal,
                precioUnitario: precioUnitario
            });
        }
        
        guardarDatos();
        form.reset();
        cargarIngredientes();
        actualizarSelectores();
        cargarStockTable();
    });
}

function cargarIngredientes() {
    const tbody = document.querySelector('#tabla-ingredientes tbody');
    tbody.innerHTML = '';
    ingredientes.forEach(ing => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => editarIngrediente(ing.id);
        tr.innerHTML = `
            <td>${ing.categoria}</td>
            <td>${ing.nombre}</td>
            <td>${ing.unidad}</td>
            <td>${ing.cantidad}</td>
            <td>S/. ${ing.precioUnitario.toFixed(4)}</td>
            <td>S/. ${ing.precioTotal.toFixed(2)}</td>
            <td>${ing.cantidad}</td>
            <td><button class="btn-remove" onclick="event.stopPropagation(); eliminarIngrediente(${ing.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function editarIngrediente(id) {
    const ing = ingredientes.find(i => i.id === id);
    if (!ing) return;
    editingIngredienteId = id;
    document.getElementById('categoria').value = ing.categoria;
    document.getElementById('nombre-ingrediente').value = ing.nombre;
    document.getElementById('unidad').value = ing.unidad;
    document.getElementById('cantidad').value = ing.cantidad;
    document.getElementById('precio-total-ing').value = ing.precioTotal;
    document.getElementById('precio-unitario').value = ing.precioUnitario.toFixed(4);
    document.getElementById('btn-cancelar-ingrediente').style.display = 'inline-block';
    document.querySelector('#form-ingrediente button[type="submit"]').textContent = 'Actualizar Ingrediente';
}

function cancelarEdicionIngrediente() {
    editingIngredienteId = null;
    document.getElementById('form-ingrediente').reset();
    document.getElementById('btn-cancelar-ingrediente').style.display = 'none';
    document.querySelector('#form-ingrediente button[type="submit"]').textContent = 'Guardar Ingrediente';
}

function eliminarIngrediente(id) {
    if (confirm('¿Eliminar este ingrediente?')) {
        ingredientes = ingredientes.filter(i => i.id !== id);
        guardarDatos();
        cargarIngredientes();
        actualizarSelectores();
        cargarStockTable();
    }
}

// ==================== Sub Recetas ====================
function initFormSubReceta() {
    const form = document.getElementById('form-sub-ingrediente');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-sub-ingrediente').value.trim();
        
        if (editingSubRecetaId) {
            const sub = subRecetas.find(s => s.id === editingSubRecetaId);
            if (sub) {
                sub.nombre = nombre;
                // Recalcular insumos
                const insumos = [];
                let costoTotal = 0;
                document.querySelectorAll('#insumos-sub .ingrediente-row').forEach(row => {
                    const select = row.querySelector('.select-insumo');
                    const cantidadUsada = parseFloat(row.querySelector('.cantidad-uso-insumo').value);
                    const insumoId = parseInt(select.value);
                    const insumo = ingredientes.find(i => i.id === insumoId);
                    if (insumo && cantidadUsada) {
                        const costo = cantidadUsada * insumo.precioUnitario;
                        insumos.push({
                            insumoId: insumoId,
                            nombre: insumo.nombre,
                            unidad: insumo.unidad,
                            cantidad: cantidadUsada,
                            costoUnitario: insumo.precioUnitario,
                            subtotal: costo
                        });
                        costoTotal += costo;
                    }
                });
                sub.insumos = insumos;
                sub.costoTotal = costoTotal;
            }
            editingSubRecetaId = null;
            document.getElementById('btn-cancelar-sub').style.display = 'none';
            form.querySelector('button[type="submit"]').textContent = 'Guardar Sub receta';
        } else {
            if (subRecetas.some(s => s.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert('Este Sub receta ya existe.');
                return;
            }
            const insumos = [];
            let costoTotal = 0;
            document.querySelectorAll('#insumos-sub .ingrediente-row').forEach(row => {
                const select = row.querySelector('.select-insumo');
                const cantidadUsada = parseFloat(row.querySelector('.cantidad-uso-insumo').value);
                const insumoId = parseInt(select.value);
                const insumo = ingredientes.find(i => i.id === insumoId);
                if (insumo && cantidadUsada) {
                    const costo = cantidadUsada * insumo.precioUnitario;
                    insumos.push({
                        insumoId: insumoId,
                        nombre: insumo.nombre,
                        unidad: insumo.unidad,
                        cantidad: cantidadUsada,
                        costoUnitario: insumo.precioUnitario,
                        subtotal: costo
                    });
                    costoTotal += costo;
                }
            });
            subRecetas.push({
                id: Date.now(),
                nombre: nombre,
                insumos: insumos,
                costoTotal: costoTotal
            });
        }
        
        guardarDatos();
        form.reset();
        document.getElementById('costo-total-sub').textContent = '0.00';
        document.getElementById('insumos-sub').innerHTML = `
            <div class="ingrediente-row">
                <select class="select-insumo" required onchange="actualizarUnidadInsumo(this)">
                    <option value="">Seleccionar insumo...</option>
                </select>
                <input type="number" class="cantidad-uso-insumo" placeholder="Cantidad" step="0.01" required oninput="calcularCostoSub()">
                <span class="unidad-label">-</span>
                <span class="costo-insumo">S/. 0.00</span>
                <button type="button" class="btn-remove" onclick="eliminarInsumo(this)">X</button>
            </div>
        `;
        cargarsubRecetas();
        actualizarSelectores();
    });
}

function cargarsubRecetas() {
    const tbody = document.querySelector('#tabla-sub-recetas tbody');
    tbody.innerHTML = '';
    subRecetas.forEach(sub => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => editarSubReceta(sub.id);
        const insumosList = sub.insumos.map(i => i.nombre + ' (' + i.cantidad + ' ' + i.unidad + ')').join(', ');
        tr.innerHTML = `
            <td>${sub.nombre}</td>
            <td>${insumosList}</td>
            <td>S/. ${sub.costoTotal.toFixed(2)}</td>
            <td><button class="btn-remove" onclick="event.stopPropagation(); eliminarSubReceta(${sub.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function editarSubReceta(id) {
    const sub = subRecetas.find(s => s.id === id);
    if (!sub) return;
    editingSubRecetaId = id;
    document.getElementById('nombre-sub-ingrediente').value = sub.nombre;
    // Cargar insumos
    const container = document.getElementById('insumos-sub');
    container.innerHTML = '';
    sub.insumos.forEach(ins => {
        const div = document.createElement('div');
        div.className = 'ingrediente-row';
        div.innerHTML = `
            <select class="select-insumo" required onchange="actualizarUnidadInsumo(this)">
                <option value="">Seleccionar insumo...</option>
            </select>
            <input type="number" class="cantidad-uso-insumo" value="${ins.cantidad}" placeholder="Cantidad" step="0.01" required oninput="calcularCostoSub()">
            <span class="unidad-label">${ins.unidad}</span>
            <span class="costo-insumo">S/. ${ins.subtotal.toFixed(2)}</span>
            <button type="button" class="btn-remove" onclick="eliminarInsumo(this)">X</button>
        `;
        container.appendChild(div);
    });
    actualizarSelectoresInsumos();
    calcularCostoSub();
    document.getElementById('btn-cancelar-sub').style.display = 'inline-block';
    document.querySelector('#form-sub-ingrediente button[type="submit"]').textContent = 'Actualizar Sub receta';
}

function cancelarEdicionSub() {
    editingSubRecetaId = null;
    document.getElementById('form-sub-ingrediente').reset();
    document.getElementById('costo-total-sub').textContent = '0.00';
    document.getElementById('insumos-sub').innerHTML = `
        <div class="ingrediente-row">
            <select class="select-insumo" required onchange="actualizarUnidadInsumo(this)">
                <option value="">Seleccionar insumo...</option>
            </select>
            <input type="number" class="cantidad-uso-insumo" placeholder="Cantidad" step="0.01" required oninput="calcularCostoSub()">
            <span class="unidad-label">-</span>
            <span class="costo-insumo">S/. 0.00</span>
            <button type="button" class="btn-remove" onclick="eliminarInsumo(this)">X</button>
        </div>
    `;
    document.getElementById('btn-cancelar-sub').style.display = 'none';
    document.querySelector('#form-sub-ingrediente button[type="submit"]').textContent = 'Guardar Sub receta';
}

function eliminarSubReceta(id) {
    if (confirm('¿Eliminar este Sub receta?')) {
        subRecetas = subRecetas.filter(s => s.id !== id);
        guardarDatos();
        cargarsubRecetas();
        actualizarSelectores();
    }
}

// ==================== recetas ====================
function initFormreceta() {
    const form = document.getElementById('form-receta');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-receta').value.trim();
        
        if (editingrecetaId) {
            const receta = recetas.find(p => p.id === editingrecetaId);
            if (receta) {
                receta.nombre = nombre;
                // Recalcular ingredientes y subRecetas
                const ingredientesreceta = [];
                let costoTotal = 0;
                document.querySelectorAll('#ingredientes-receta .ingrediente-row').forEach(row => {
                    const select = row.querySelector('.select-ingrediente');
                    const cantidadInput = row.querySelector('.cantidad-uso');
                    const unidadSelect = row.querySelector('.unidad-uso');
                    const ingredienteId = parseInt(select.value);
                    const ingrediente = ingredientes.find(i => i.id === ingredienteId);
                    if (ingrediente && cantidadInput.value) {
                        const cantidadUsada = parseFloat(cantidadInput.value);
                        const unidadUsada = unidadSelect.value || ingrediente.unidad;
                        const costo = calcularCostoConConversion(ingrediente, cantidadUsada, unidadUsada);
                        ingredientesreceta.push({
                            tipo: 'ingrediente',
                            id: ingredienteId,
                            nombre: ingrediente.nombre,
                            unidadOriginal: ingrediente.unidad,
                            cantidadUsada: cantidadUsada,
                            unidadUsada: unidadUsada,
                            costoUnitario: ingrediente.precioUnitario,
                            subtotal: costo
                        });
                        costoTotal += costo;
                    }
                });
                const subRecetasreceta = [];
                document.querySelectorAll('#sub-recetas-receta .sub-ingrediente-row').forEach(row => {
                    const select = row.querySelector('.select-sub-ingrediente');
                    const cantidad = parseFloat(row.querySelector('.cantidad-uso-sub').value);
                    const subId = parseInt(select.value);
                    const sub = subRecetas.find(s => s.id === subId);
                    if (sub && cantidad > 0) {
                        const costo = cantidad * sub.costoTotal;
                        subRecetasreceta.push({
                            tipo: 'sub-ingrediente',
                            id: subId,
                            nombre: sub.nombre,
                            unidad: 'porción',
                            cantidad: cantidad,
                            costoUnitario: sub.costoTotal,
                            subtotal: costo
                        });
                        costoTotal += costo;
                    }
                });
                receta.ingredientes = ingredientesreceta;
                receta.subRecetas = subRecetasreceta;
                receta.costoTotal = costoTotal;
            }
            editingrecetaId = null;
            document.getElementById('btn-cancelar-receta').style.display = 'none';
            form.querySelector('button[type="submit"]').textContent = 'Guardar receta';
        } else {
            const ingredientesreceta = [];
            let costoTotal = 0;
            document.querySelectorAll('#ingredientes-receta .ingrediente-row').forEach(row => {
                const select = row.querySelector('.select-ingrediente');
                const cantidadInput = row.querySelector('.cantidad-uso');
                const unidadSelect = row.querySelector('.unidad-uso');
                const ingredienteId = parseInt(select.value);
                const ingrediente = ingredientes.find(i => i.id === ingredienteId);
                if (ingrediente && cantidadInput.value) {
                    const cantidadUsada = parseFloat(cantidadInput.value);
                    const unidadUsada = unidadSelect.value || ingrediente.unidad;
                    const costo = calcularCostoConConversion(ingrediente, cantidadUsada, unidadUsada);
                    ingredientesreceta.push({
                        tipo: 'ingrediente',
                        id: ingredienteId,
                        nombre: ingrediente.nombre,
                        unidadOriginal: ingrediente.unidad,
                        cantidadUsada: cantidadUsada,
                        unidadUsada: unidadUsada,
                        costoUnitario: ingrediente.precioUnitario,
                        subtotal: costo
                    });
                    costoTotal += costo;
                }
            });
            const subRecetasreceta = [];
            document.querySelectorAll('#sub-recetas-receta .sub-ingrediente-row').forEach(row => {
                const select = row.querySelector('.select-sub-ingrediente');
                const cantidad = parseFloat(row.querySelector('.cantidad-uso-sub').value);
                const subId = parseInt(select.value);
                const sub = subRecetas.find(s => s.id === subId);
                if (sub && cantidad > 0) {
                    const costo = cantidad * sub.costoTotal;
                    subRecetasreceta.push({
                        tipo: 'sub-ingrediente',
                        id: subId,
                        nombre: sub.nombre,
                        unidad: 'porción',
                        cantidad: cantidad,
                        costoUnitario: sub.costoTotal,
                        subtotal: costo
                    });
                    costoTotal += costo;
                }
            });
            recetas.push({
                id: Date.now(),
                nombre: nombre,
                ingredientes: ingredientesreceta,
                subRecetas: subRecetasreceta,
                costosFijos: [...costosFijosreceta], // Agregar costos fijos al receta
                costoTotal: costoTotal
            });
        }
        
        guardarDatos();
        form.reset();
        costosFijosreceta = []; // Limpiar costos fijos temporales
        document.getElementById('ingredientes-receta').innerHTML = `
            <div class="ingrediente-row">
                <select class="select-ingrediente" required onchange="actualizarUnidadIngrediente(this)">
                    <option value="">Seleccionar ingrediente...</option>
                </select>
                <input type="number" class="cantidad-uso" placeholder="Cantidad" step="0.01" required oninput="calcularCostoreceta()">
                <select class="unidad-uso" onchange="calcularCostoreceta()">
                    <option value="">Medida...</option>
                </select>
                <span class="stock-label">Stock: -</span>
                <span class="costo-ingrediente">S/. 0.00</span>
                <button type="button" class="btn-remove" onclick="eliminarIngredienteRow(this)">X</button>
            </div>
        `;
        document.getElementById('sub-recetas-receta').innerHTML = `
            <div class="sub-ingrediente-row">
                <select class="select-sub-ingrediente" onchange="actualizarUnidadSub(this)">
                    <option value="">Seleccionar Sub receta...</option>
                </select>
                <input type="number" class="cantidad-uso-sub" placeholder="Cantidad" step="0.01" oninput="calcularCostoreceta()">
                <span class="unidad-label-sub">-</span>
                <span class="costo-sub-ingrediente">S/. 0.00</span>
                <button type="button" class="btn-remove" onclick="eliminarSubRecetaRow(this)">X</button>
            </div>
        `;
        document.getElementById('lista-costos-fijos-receta').innerHTML = '';
        cargarrecetas();
        actualizarSelectores();
    });
}

function calcularCostoConConversion(ingrediente, cantidadUsada, unidadUsada) {
    // Si la unidad usada es la misma que la del ingrediente, cálculo directo
    if (unidadUsada === ingrediente.unidad) {
        return cantidadUsada * ingrediente.precioUnitario;
    }
    // Si no, buscar conversión en medidas
    const medidaIngrediente = medidas.find(m => m.abreviatura === ingrediente.unidad || m.nombre === ingrediente.unidad);
    const medidaUsada = medidas.find(m => m.abreviatura === unidadUsada || m.nombre === unidadUsada);
    
    if (medidaIngrediente && medidaUsada && medidaIngrediente.unidadBase === medidaUsada.unidadBase) {
        // Convertir a unidad base
        const cantidadEnBase = cantidadUsada * medidaUsada.equivalencia;
        const cantidadEnOriginal = cantidadEnBase / medidaIngrediente.equivalencia;
        return cantidadEnOriginal * ingrediente.precioUnitario;
    }
    // Si no hay medida, intentar conversión básica
    const conversionesBasicas = {
        'kg': { base: 'g', factor: 1000 },
        'g': { base: 'g', factor: 1 },
        'l': { base: 'ml', factor: 1000 },
        'ml': { base: 'ml', factor: 1 },
        'unidad': { base: 'unidad', factor: 1 }
    };
    const convOrig = conversionesBasicas[ingrediente.unidad];
    const convUsada = conversionesBasicas[unidadUsada];
    if (convOrig && convUsada && convOrig.base === convUsada.base) {
        const cantidadEnBase = cantidadUsada * convUsada.factor;
        const cantidadEnOriginal = cantidadEnBase / convOrig.factor;
        return cantidadEnOriginal * ingrediente.precioUnitario;
    }
    // Si no se puede convertir, usar cálculo directo (asumiendo misma unidad)
    return cantidadUsada * ingrediente.precioUnitario;
}

function cargarrecetas() {
    const tbody = document.querySelector('#tabla-recetas tbody');
    tbody.innerHTML = '';
    recetas.forEach(receta => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => editarreceta(receta.id);
        const ingredientesList = receta.ingredientes.map(i => i.nombre + ' (' + i.cantidadUsada + ' ' + i.unidadUsada + ')').join(', ');
        const subList = receta.subRecetas ? receta.subRecetas.map(s => s.nombre + ' (' + s.cantidad + ' ' + s.unidad + ')').join(', ') : '';
        tr.innerHTML = `
            <td>${receta.nombre}</td>
            <td>${ingredientesList}</td>
            <td>${subList}</td>
            <td>S/. ${receta.costoTotal.toFixed(2)}</td>
            <td><button class="btn-remove" onclick="event.stopPropagation(); eliminarreceta(${receta.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function editarreceta(id) {
    const receta = recetas.find(p => p.id === id);
    if (!receta) return;
    editingrecetaId = id;
    document.getElementById('nombre-receta').value = receta.nombre;
    // Cargar ingredientes
    const container = document.getElementById('ingredientes-receta');
    container.innerHTML = '';
    receta.ingredientes.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'ingrediente-row';
        div.innerHTML = `
            <select class="select-ingrediente" required onchange="actualizarUnidadIngrediente(this)">
                <option value="">Seleccionar ingrediente...</option>
            </select>
            <input type="number" class="cantidad-uso" value="${ing.cantidadUsada}" placeholder="Cantidad" step="0.01" required oninput="calcularCostoreceta()">
            <select class="unidad-uso" onchange="calcularCostoreceta()">
                <option value="">Medida...</option>
            </select>
            <span class="stock-label">Stock: -</span>
            <span class="costo-ingrediente">S/. ${ing.subtotal.toFixed(2)}</span>
            <button type="button" class="btn-remove" onclick="eliminarIngredienteRow(this)">X</button>
        `;
        container.appendChild(div);
    });
    actualizarSelectoresIngredientes();
    // Cargar subRecetas
    const subContainer = document.getElementById('sub-recetas-receta');
    subContainer.innerHTML = '';
    if (receta.subRecetas) {
        receta.subRecetas.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'sub-ingrediente-row';
            div.innerHTML = `
                <select class="select-sub-ingrediente" onchange="actualizarUnidadSub(this)">
                    <option value="">Seleccionar Sub receta...</option>
                </select>
                <input type="number" class="cantidad-uso-sub" value="${sub.cantidad}" placeholder="Cantidad" step="0.01" oninput="calcularCostoreceta()">
                <span class="unidad-label-sub">porción</span>
                <span class="costo-sub-ingrediente">S/. ${sub.subtotal.toFixed(2)}</span>
                <button type="button" class="btn-remove" onclick="eliminarSubRecetaRow(this)">X</button>
            `;
            subContainer.appendChild(div);
        });
    }
    actualizarSelectoressubRecetas();
    // Cargar costos fijos asociados al receta
    costosFijosreceta = receta.costosFijos ? [...receta.costosFijos] : [];
    renderizarCostosFijosreceta();
    calcularCostoreceta();
    document.getElementById('btn-cancelar-receta').style.display = 'inline-block';
    document.querySelector('#form-receta button[type="submit"]').textContent = 'Actualizar receta';
}

function cancelarEdicionreceta() {
    editingrecetaId = null;
    costosFijosreceta = []; // Limpiar costos fijos
    document.getElementById('form-receta').reset();
    document.getElementById('ingredientes-receta').innerHTML = `
        <div class="ingrediente-row">
            <select class="select-ingrediente" required onchange="actualizarUnidadIngrediente(this)">
                <option value="">Seleccionar ingrediente...</option>
            </select>
            <input type="number" class="cantidad-uso" placeholder="Cantidad" step="0.01" required oninput="calcularCostoreceta()">
            <select class="unidad-uso" onchange="calcularCostoreceta()">
                <option value="">Medida...</option>
            </select>
            <span class="stock-label">Stock: -</span>
            <span class="costo-ingrediente">S/. 0.00</span>
            <button type="button" class="btn-remove" onclick="eliminarIngredienteRow(this)">X</button>
        </div>
    `;
    document.getElementById('sub-recetas-receta').innerHTML = `
        <div class="sub-ingrediente-row">
            <select class="select-sub-ingrediente" onchange="actualizarUnidadSub(this)">
                <option value="">Seleccionar Sub receta...</option>
            </select>
            <input type="number" class="cantidad-uso-sub" placeholder="Cantidad" step="0.01" oninput="calcularCostoreceta()">
            <span class="unidad-label-sub">-</span>
            <span class="costo-sub-ingrediente">S/. 0.00</span>
            <button type="button" class="btn-remove" onclick="eliminarSubRecetaRow(this)">X</button>
        </div>
    `;
    document.getElementById('lista-costos-fijos-receta').innerHTML = '';
    document.getElementById('btn-cancelar-receta').style.display = 'none';
    document.querySelector('#form-receta button[type="submit"]').textContent = 'Guardar receta';
}

function eliminarreceta(id) {
    if (confirm('¿Eliminar este receta?')) {
        recetas = recetas.filter(p => p.id !== id);
        guardarDatos();
        cargarrecetas();
        actualizarSelectores();
    }
}

// ==================== COSTOS FIJOS ====================
function initFormCostoFijo() {
    // Esta función ya no usa addEventListener, se usa onsubmit en el HTML
    // Se mantiene por compatibilidad
}

function guardarCostoFijo(e) {
    if (e) e.preventDefault();
    
    const concepto = document.getElementById('concepto-costo-fijo').value;
    const monto = parseFloat(document.getElementById('monto-costo-fijo').value);
    const diasMes = parseInt(document.getElementById('dias-mes').value) || 30;
    const totalrecetasVendidos = parseInt(document.getElementById('total-recetas-vendidos').value) || 1000;
    
    if (!concepto || !monto || !totalrecetasVendidos) {
        alert('Complete todos los campos requeridos');
        return;
    }
    
    // El costo por receta es el monto mensual dividido entre los recetas vendidos
    const costoPorreceta = monto / totalrecetasVendidos;
    
    if (editingCostoFijoId) {
        // Editar
        const costo = costosFijos.find(c => c.id === editingCostoFijoId);
        if (costo) {
            costo.concepto = concepto;
            costo.monto = monto;
            costo.diasMes = diasMes;
            costo.totalrecetasVendidos = totalrecetasVendidos;
            costo.costoPorreceta = costoPorreceta;
        }
        editingCostoFijoId = null;
        document.getElementById('btn-cancelar-costo').style.display = 'none';
        document.querySelector('#form-costo-fijo button[type="submit"]').textContent = 'Guardar Costo Fijo';
    } else {
        // Crear nuevo
        costosFijos.push({
            id: Date.now(),
            concepto: concepto,
            monto: monto,
            diasMes: diasMes,
            totalrecetasVendidos: totalrecetasVendidos,
            costoPorreceta: costoPorreceta
        });
    }
    
    // Guardar y actualizar
    guardarDatos();
    
    // Limpiar formulario
    document.getElementById('form-costo-fijo').reset();
    document.getElementById('dias-mes').value = 30;
    
    // Recargar tabla
    cargarCostosFijos();
    actualizarSelectoresCostosFijos();
    
    alert('Costo fijo guardado correctamente');
}

function cargarCostosFijos() {
    // Recargar del localStorage para asegurar datos actualizados
    costosFijos = JSON.parse(localStorage.getItem('costosFijos')) || [];
    
    const tbody = document.querySelector('#tabla-costos-fijos tbody');
    if (!tbody) {
        console.error('No se encontró la tabla de costos fijos');
        return;
    }
    
    tbody.innerHTML = '';
    let totalMensual = 0;
    
    if (costosFijos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" style="text-align:center; color:#999; padding:20px;">No hay costos fijos registrados</td>';
        tbody.appendChild(tr);
    } else {
        costosFijos.forEach(cf => {
            totalMensual += cf.monto;
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.onclick = function() { editarCostoFijo(cf.id); };
            tr.innerHTML = `
                <td>${cf.concepto || 'Sin concepto'}</td>
                <td>S/. ${(cf.monto || 0).toFixed(2)}</td>
                <td>${cf.diasMes || 30}</td>
                <td>${cf.totalrecetasVendidos || 0}</td>
                <td>S/. ${(cf.costoPorreceta || 0).toFixed(2)}</td>
                <td><button class="btn-remove" onclick="event.stopPropagation(); eliminarCostoFijo(${cf.id})">X</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    const totalElement = document.getElementById('total-costos-fijos');
    if (totalElement) {
        totalElement.textContent = 'S/. ' + totalMensual.toFixed(2);
    }
    
    const promedioElement = document.getElementById('costo-fijo-promedio');
    if (promedioElement) {
        const costoPromedio = costosFijos.length > 0 ? 
            costosFijos.reduce((sum, c) => sum + (c.costoPorreceta || 0), 0) / costosFijos.length : 0;
        promedioElement.textContent = 'S/. ' + costoPromedio.toFixed(2);
    }
}

function editarCostoFijo(id) {
    const cf = costosFijos.find(c => c.id === id);
    if (!cf) return;
    editingCostoFijoId = id;
    document.getElementById('concepto-costo-fijo').value = cf.concepto;
    document.getElementById('monto-costo-fijo').value = cf.monto;
    document.getElementById('dias-mes').value = cf.diasMes;
    document.getElementById('total-recetas-vendidos').value = cf.totalrecetasVendidos;
    document.getElementById('btn-cancelar-costo').style.display = 'inline-block';
    document.querySelector('#form-costo-fijo button[type="submit"]').textContent = 'Actualizar Costo Fijo';
}

function cancelarEdicionCosto() {
    editingCostoFijoId = null;
    document.getElementById('form-costo-fijo').reset();
    document.getElementById('dias-mes').value = 30;
    document.getElementById('btn-cancelar-costo').style.display = 'none';
    document.querySelector('#form-costo-fijo button[type="submit"]').textContent = 'Guardar Costo Fijo';
}

function eliminarCostoFijo(id) {
    if (confirm('¿Eliminar este costo fijo?')) {
        costosFijos = costosFijos.filter(c => c.id !== id);
        guardarDatos();
        cargarCostosFijos();
    }
}

// ==================== FUNCIONES AUXILIARES ====================
function cargarStockTable() {
    const tbody = document.querySelector('#tabla-stock tbody');
    tbody.innerHTML = '';
    ingredientes.forEach(ing => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ing.nombre}</td>
            <td>${ing.unidad}</td>
            <td>${ing.cantidad}</td>
            <td>${ing.cantidad}</td>
            <td><input type="number" class="nuevo-stock" data-id="${ing.id}" step="0.01" placeholder="Nuevo ingreso"></td>
            <td><button class="btn-primary" onclick="actualizarStock(${ing.id})">Actualizar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarStock(id) {
    const input = document.querySelector(`.nuevo-stock[data-id="${id}"]`);
    const nuevoIngreso = parseFloat(input.value);
    if (isNaN(nuevoIngreso) || nuevoIngreso < 0) {
        alert('Ingrese un valor válido');
        return;
    }
    const ingrediente = ingredientes.find(i => i.id === id);
    if (ingrediente) {
        ingrediente.cantidad += nuevoIngreso;
        ingrediente.precioUnitario = ingrediente.cantidad > 0 ? ingrediente.precioTotal / ingrediente.cantidad : 0;
        guardarDatos();
        cargarIngredientes();
        cargarStockTable();
        actualizarSelectores();
    }
}

function actualizarSelectores() {
    actualizarSelectoresIngredientes();
    actualizarSelectoressubRecetas();
    actualizarSelectoresrecetas();
    actualizarSelectoresInsumos();
    actualizarSelectoresMedidas();
}

function actualizarSelectoresMedidas() {
    // Actualizar selects que usan medidas
    const selects = document.querySelectorAll('.unidad-uso, #unidad, #unidad-base');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar...</option>';
        medidas.forEach(m => {
            const option = document.createElement('option');
            option.value = m.abreviatura;
            option.textContent = m.nombre + ' (' + m.abreviatura + ')';
            select.appendChild(option);
        });
        // Agregar unidades base por defecto
        const unidadesBase = ['kg', 'g', 'l', 'ml', 'unidad', 'docena'];
        unidadesBase.forEach(u => {
            if (!medidas.some(m => m.abreviatura === u)) {
                const option = document.createElement('option');
                option.value = u;
                option.textContent = u;
                select.appendChild(option);
            }
        });
        select.value = selectedValue;
    });
}

function actualizarSelectoresIngredientes() {
    const selects = document.querySelectorAll('.select-ingrediente');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar ingrediente...</option>';
        ingredientes.forEach(ing => {
            const option = document.createElement('option');
            option.value = ing.id;
            option.textContent = ing.nombre + ' (' + ing.unidad + ') - S/. ' + ing.precioUnitario.toFixed(4) + '/' + ing.unidad;
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

function actualizarSelectoressubRecetas() {
    const selects = document.querySelectorAll('.select-sub-ingrediente');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar Sub receta...</option>';
        subRecetas.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.nombre + ' (S/. ' + sub.costoTotal.toFixed(2) + ')';
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

function actualizarSelectoresrecetas() {
    const selectCostos = document.getElementById('select-receta-costos');
    const selectedValue = selectCostos.value;
    selectCostos.innerHTML = '<option value="">Seleccionar...</option>';
    recetas.forEach(receta => {
        const option = document.createElement('option');
        option.value = receta.id;
        option.textContent = receta.nombre;
        selectCostos.appendChild(option);
    });
    selectCostos.value = selectedValue;
}

function actualizarSelectoresInsumos() {
    const selects = document.querySelectorAll('.select-insumo');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar insumo...</option>';
        ingredientes.forEach(ing => {
            const option = document.createElement('option');
            option.value = ing.id;
            option.textContent = ing.nombre + ' (' + ing.unidad + ')';
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

function actualizarUnidadIngrediente(select) {
    const ingredienteId = parseInt(select.value);
    const ingrediente = ingredientes.find(i => i.id === ingredienteId);
    const row = select.parentElement;
    const unidadLabel = row.querySelector('.unidad-label') || row.querySelector('.stock-label');
    if (ingrediente) {
        if (unidadLabel) unidadLabel.textContent = 'Stock: ' + ingrediente.cantidad + ' ' + ingrediente.unidad;
        // Actualizar select de unidad de uso con opciones
        const unidadSelect = row.querySelector('.unidad-uso');
        if (unidadSelect) {
            unidadSelect.innerHTML = '<option value="">Medida de uso...</option>';
            // Agregar la unidad original del ingrediente
            const option1 = document.createElement('option');
            option1.value = ingrediente.unidad;
            option1.textContent = ingrediente.unidad;
            unidadSelect.appendChild(option1);
            // Agregar medidas registradas con la misma unidad base
            medidas.forEach(m => {
                if (m.unidadBase === getUnidadBase(ingrediente.unidad)) {
                    const option = document.createElement('option');
                    option.value = m.nombre;
                    option.textContent = m.nombre + ' (' + m.abreviatura + ')';
                    unidadSelect.appendChild(option);
                }
            });
            // Seleccionar la unidad original por defecto
            unidadSelect.value = ingrediente.unidad;
        }
    }
    calcularCostoreceta();
}

function getUnidadBase(unidad) {
    // Determinar la unidad base de una medida
    const conv = { 'kg': 'g', 'g': 'g', 'l': 'ml', 'ml': 'ml', 'unidad': 'unidad' };
    if (conv[unidad]) return conv[unidad];
    // Buscar en medidas registradas
    const medida = medidas.find(m => m.abreviatura === unidad || m.nombre === unidad);
    return medida ? medida.unidadBase : unidad;
}

function actualizarUnidadSub(select) {
    const subId = parseInt(select.value);
    const sub = subRecetas.find(s => s.id === subId);
    const row = select.parentElement;
    const unidadLabel = row.querySelector('.unidad-label-sub');
    if (sub) {
        if (unidadLabel) unidadLabel.textContent = 'porción';
    }
    calcularCostoreceta();
}

function actualizarUnidadInsumo(select) {
    const insumoId = parseInt(select.value);
    const insumo = ingredientes.find(i => i.id === insumoId);
    const unidadLabel = select.parentElement.querySelector('.unidad-label');
    if (insumo) {
        unidadLabel.textContent = insumo.unidad;
    } else {
        unidadLabel.textContent = '-';
    }
    calcularCostoSub();
}

function calcularCostoSub() {
    let total = 0;
    document.querySelectorAll('#insumos-sub .ingrediente-row').forEach(row => {
        const select = row.querySelector('.select-insumo');
        const cantidadInput = row.querySelector('.cantidad-uso-insumo');
        const costoSpan = row.querySelector('.costo-insumo');
        const insumoId = parseInt(select.value);
        const cantidadUsada = parseFloat(cantidadInput.value);
        const insumo = ingredientes.find(i => i.id === insumoId);
        if (insumo && cantidadUsada) {
            const costo = cantidadUsada * insumo.precioUnitario;
            costoSpan.textContent = 'S/. ' + costo.toFixed(2);
            total += costo;
        } else {
            costoSpan.textContent = 'S/. 0.00';
        }
    });
    document.getElementById('costo-total-sub').textContent = total.toFixed(2);
}

function calcularCostoreceta() {
    let total = 0;
    // Sumar ingredientes
    document.querySelectorAll('#ingredientes-receta .ingrediente-row').forEach(row => {
        const select = row.querySelector('.select-ingrediente');
        const cantidadInput = row.querySelector('.cantidad-uso');
        const unidadSelect = row.querySelector('.unidad-uso');
        const costoSpan = row.querySelector('.costo-ingrediente');
        const ingredienteId = parseInt(select.value);
        const cantidadUsada = parseFloat(cantidadInput.value);
        const unidadUsada = unidadSelect ? unidadSelect.value : '';
        const ingrediente = ingredientes.find(i => i.id === ingredienteId);
        if (ingrediente && cantidadUsada) {
            const costo = calcularCostoConConversion(ingrediente, cantidadUsada, unidadUsada || ingrediente.unidad);
            costoSpan.textContent = 'S/. ' + costo.toFixed(2);
            total += costo;
        } else {
            costoSpan.textContent = 'S/. 0.00';
        }
    });
    // Sumar sub-recetas
    document.querySelectorAll('#sub-recetas-receta .sub-ingrediente-row').forEach(row => {
        const select = row.querySelector('.select-sub-ingrediente');
        const cantidadInput = row.querySelector('.cantidad-uso-sub');
        const costoSpan = row.querySelector('.costo-sub-ingrediente');
        const subId = parseInt(select.value);
        const cantidad = parseFloat(cantidadInput.value);
        const sub = subRecetas.find(s => s.id === subId);
        if (sub && cantidad > 0) {
            const costo = cantidad * sub.costoTotal;
            costoSpan.textContent = 'S/. ' + costo.toFixed(2);
            total += costo;
        } else {
            costoSpan.textContent = 'S/. 0.00';
        }
    });
    // Sumar costos fijos asignados
    let totalCostosFijos = 0;
    costosFijosreceta.forEach(cf => {
        totalCostosFijos += cf.costoPorreceta;
    });
    total += totalCostosFijos;
    document.getElementById('costo-total-receta').textContent = total.toFixed(2);
}

function calcularCostos() {
    // Recargar datos del localStorage
    costosFijos = JSON.parse(localStorage.getItem('costosFijos')) || [];
    recetas = JSON.parse(localStorage.getItem('recetas')) || [];
    
    const recetaId = parseInt(document.getElementById('select-receta-costos').value);
    const margen = parseFloat(document.getElementById('margen-ganancia').value) || 0;
    
    if (!recetaId) {
        document.getElementById('detalle-costos').style.display = 'none';
        return;
    }
    
    const receta = recetas.find(p => p.id === recetaId);
    if (!receta) return;
    
    document.getElementById('detalle-costos').style.display = 'block';
    document.getElementById('porcentaje-margen').textContent = margen;
    
    const tbody = document.querySelector('#tabla-desglose tbody');
    tbody.innerHTML = '';
    
    // Mostrar ingredientes
    let totalIngredientes = 0;
    receta.ingredientes.forEach(ing => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ing.nombre}</td>
            <td>Ingrediente</td>
            <td>${ing.cantidadUsada} ${ing.unidadUsada}</td>
            <td>${ing.unidadOriginal}</td>
            <td>S/. ${ing.costoUnitario.toFixed(4)}</td>
            <td>S/. ${ing.subtotal.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
        totalIngredientes += ing.subtotal;
    });
    
    // Mostrar Sub Recetas
    if (receta.subRecetas) {
        receta.subRecetas.forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sub.nombre}</td>
                <td>Sub receta</td>
                <td>${sub.cantidad} ${sub.unidad}</td>
                <td>${sub.unidad}</td>
                <td>S/. ${sub.costoUnitario.toFixed(2)}</td>
                <td>S/. ${sub.subtotal.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
            totalIngredientes += sub.subtotal;
        });
    }
    
    // Mostrar costos fijos asociados al receta
    let totalCostosFijosreceta = 0;
    if (receta.costosFijos && receta.costosFijos.length > 0) {
        receta.costosFijos.forEach(cf => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cf.concepto}</td>
                <td>Costo Fijo</td>
                <td>-</td>
                <td>-</td>
                <td>S/. ${cf.costoPorreceta.toFixed(2)}</td>
                <td>S/. ${cf.costoPorreceta.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
            totalCostosFijosreceta += cf.costoPorreceta;
        });
    } else {
        // Si no tiene costos fijos asociados, mostrar mensaje
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align:center; color:#999;">No hay costos fijos asociados a este receta</td>`;
        tbody.appendChild(tr);
    }
    
    // Calcular totales
    document.getElementById('costo-ingredientes').textContent = 'S/. ' + totalIngredientes.toFixed(2);
    document.getElementById('costos-fijos-total').textContent = 'S/. ' + totalCostosFijosreceta.toFixed(2);
    
    const costoTotalFinal = totalIngredientes + totalCostosFijosreceta;
    document.getElementById('costo-total-final').textContent = 'S/. ' + costoTotalFinal.toFixed(2);
    
    const montoMargen = costoTotalFinal * (margen / 100);
    document.getElementById('monto-margen').textContent = 'S/. ' + montoMargen.toFixed(2);
    
    const precioFinal = costoTotalFinal + montoMargen;
    document.getElementById('precio-final').textContent = 'S/. ' + precioFinal.toFixed(2);
}

function descontarInventario() {
    const recetaId = parseInt(document.getElementById('select-receta-costos').value);
    if (!recetaId) return;
    const receta = recetas.find(p => p.id === recetaId);
    if (!receta) return;
    if (!confirm('¿Descontar ingredientes del inventario para este receta?')) return;
    let sinStock = false;
    receta.ingredientes.forEach(ing => {
        const ingrediente = ingredientes.find(i => i.id === ing.id);
        if (ingrediente) {
            if (ingrediente.cantidad >= ing.cantidadUsada) {
                ingrediente.cantidad -= ing.cantidadUsada;
            } else {
                sinStock = true;
                alert('Stock insuficiente para: ' + ingrediente.nombre);
            }
        }
    });
    if (!sinStock) {
        guardarDatos();
        cargarIngredientes();
        cargarStockTable();
        actualizarSelectores();
        cargarrecetas();
        calcularCostos();
        alert('Inventario actualizado correctamente');
    }
}

function guardarDatos() {
    try {
        localStorage.setItem('medidas', JSON.stringify(medidas));
        localStorage.setItem('ingredientes', JSON.stringify(ingredientes));
        localStorage.setItem('subRecetas', JSON.stringify(subRecetas));
        localStorage.setItem('recetas', JSON.stringify(recetas));
        localStorage.setItem('costosFijos', JSON.stringify(costosFijos));
        console.log('Datos guardados correctamente');
    } catch(e) {
        console.error('Error al guardar:', e);
        alert('Error al guardar datos: ' + e.message);
    }
}

// ==================== AGREGAR FILAS ====================
function agregarInsumo() {
    const div = document.createElement('div');
    div.className = 'ingrediente-row';
    div.innerHTML = `
        <select class="select-insumo" required onchange="actualizarUnidadInsumo(this)">
            <option value="">Seleccionar insumo...</option>
        </select>
        <input type="number" class="cantidad-uso-insumo" placeholder="Cantidad" step="0.01" required oninput="calcularCostoSub()">
        <span class="unidad-label">-</span>
        <span class="costo-insumo">S/. 0.00</span>
        <button type="button" class="btn-remove" onclick="eliminarInsumo(this)">X</button>
    `;
    document.getElementById('insumos-sub').appendChild(div);
    actualizarSelectoresInsumos();
}

function agregarIngrediente() {
    const div = document.createElement('div');
    div.className = 'ingrediente-row';
    div.innerHTML = `
        <select class="select-ingrediente" required onchange="actualizarUnidadIngrediente(this)">
            <option value="">Seleccionar ingrediente...</option>
        </select>
        <input type="number" class="cantidad-uso" placeholder="Cantidad" step="0.01" required oninput="calcularCostoreceta()">
        <select class="unidad-uso" onchange="calcularCostoreceta()">
            <option value="">Medida...</option>
        </select>
        <span class="stock-label">Stock: -</span>
        <span class="costo-ingrediente">S/. 0.00</span>
        <button type="button" class="btn-remove" onclick="eliminarIngredienteRow(this)">X</button>
    `;
    document.getElementById('ingredientes-receta').appendChild(div);
    actualizarSelectoresIngredientes();
}

function agregarSubReceta() {
    const div = document.createElement('div');
    div.className = 'sub-ingrediente-row';
    div.innerHTML = `
        <select class="select-sub-ingrediente" onchange="actualizarUnidadSub(this)">
            <option value="">Seleccionar Sub receta...</option>
        </select>
        <input type="number" class="cantidad-uso-sub" placeholder="Cantidad" step="0.01" oninput="calcularCostoreceta()">
        <span class="unidad-label-sub">-</span>
        <span class="costo-sub-ingrediente">S/. 0.00</span>
        <button type="button" class="btn-remove" onclick="eliminarSubRecetaRow(this)">X</button>
    `;
    document.getElementById('sub-recetas-receta').appendChild(div);
    actualizarSelectoressubRecetas();
}

function eliminarInsumo(btn) {
    btn.parentElement.remove();
    calcularCostoSub();
}

function eliminarIngredienteRow(btn) {
    btn.parentElement.remove();
    calcularCostoreceta();
}

function eliminarSubRecetaRow(btn) {
    btn.parentElement.remove();
    calcularCostoreceta();
}

// ==================== COSTOS FIJOS EN recetas ====================
let costosFijosreceta = [];

function actualizarSelectoresCostosFijos() {
    const select = document.getElementById('select-costo-fijo-receta');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar costo fijo...</option>';
    costosFijos.forEach(cf => {
        const option = document.createElement('option');
        option.value = cf.id;
        option.textContent = `${cf.concepto} (S/. ${cf.costoPorreceta.toFixed(2)}/receta)`;
        select.appendChild(option);
    });
}

function actualizarCostoFijoreceta() {
    const select = document.getElementById('select-costo-fijo-receta');
    const costoId = parseInt(select.value);
    if (!costoId) {
        document.getElementById('costo-fijo-asignado').textContent = 'S/. 0.00';
        return;
    }
    const costoFijo = costosFijos.find(c => c.id === costoId);
    if (costoFijo) {
        document.getElementById('costo-fijo-asignado').textContent = 'S/. ' + costoFijo.costoPorreceta.toFixed(2);
    }
}

function agregarCostoFijoAreceta() {
    const select = document.getElementById('select-costo-fijo-receta');
    const costoId = parseInt(select.value);
    if (!costoId) {
        alert('Seleccione un costo fijo');
        return;
    }
    const costoFijo = costosFijos.find(c => c.id === costoId);
    if (!costoFijo) return;
    
    // Verificar que no esté ya agregado
    if (costosFijosreceta.find(c => c.id === costoId)) {
        alert('Este costo fijo ya está agregado al receta');
        return;
    }
    
    costosFijosreceta.push({
        id: costoFijo.id,
        concepto: costoFijo.concepto,
        costoPorreceta: costoFijo.costoPorreceta
    });
    
    renderizarCostosFijosreceta();
    calcularCostoreceta();
    select.value = '';
    document.getElementById('costo-fijo-asignado').textContent = 'S/. 0.00';
}

function renderizarCostosFijosreceta() {
    const container = document.getElementById('lista-costos-fijos-receta');
    container.innerHTML = '';
    costosFijosreceta.forEach((cf, index) => {
        const div = document.createElement('div');
        div.className = 'costo-fijo-receta-item';
        div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px; margin:5px 0; background:#f5f5f5; border-radius:4px;';
        div.innerHTML = `
            <span>${cf.concepto}</span>
            <span>S/. ${cf.costoPorreceta.toFixed(2)}</span>
            <button type="button" class="btn-remove" onclick="eliminarCostoFijoDereceta(${index})">X</button>
        `;
        container.appendChild(div);
    });
}

function eliminarCostoFijoDereceta(index) {
    costosFijosreceta.splice(index, 1);
    renderizarCostosFijosreceta();
    calcularCostoreceta();
}

// ==================== FUNCIONES PARA SUB RECETAS EN RECETAS ====================
function agregarSubReceta() {
    const div = document.createElement('div');
    div.className = 'sub-receta-row';
    div.innerHTML = `
        <select class="select-sub-receta" onchange="actualizarSubRecetaSelect(this)">
            <option value="">Seleccionar sub receta...</option>
        </select>
        <input type="number" class="cantidad-uso-sub-receta" placeholder="Cantidad a usar" step="0.01" oninput="calcularCostoReceta()">
        <span class="unidad-label-sub-receta">porción</span>
        <span class="costo-sub-receta">S/. 0.00</span>
        <button type="button" class="btn-remove" onclick="eliminarSubRecetaRow(this)">X</button>
    `;
    document.getElementById('sub-recetas-plato').appendChild(div);
    actualizarSelectoresSubRecetas();
}

function actualizarSubRecetaSelect(select) {
    const subRecetaId = parseInt(select.value);
    const subReceta = subRecetas.find(s => s.id === subRecetaId);
    const row = select.parentElement;
    const costoSpan = row.querySelector('.costo-sub-receta');
    if (subReceta && costoSpan) {
        // Al elegir la sub receta, calcular costo basado en cantidad
        const cantidadInput = row.querySelector('.cantidad-uso-sub-receta');
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const costo = cantidad * subReceta.costoTotal;
        costoSpan.textContent = 'S/. ' + costo.toFixed(2);
    } else {
        if (costoSpan) costoSpan.textContent = 'S/. 0.00';
    }
    calcularCostoReceta();
}

function calcularCostoReceta() {
    let total = 0;
    // Sumar ingredientes
    document.querySelectorAll('#ingredientes-plato .ingrediente-row').forEach(row => {
        const costoSpan = row.querySelector('.costo-ingrediente');
        if (costoSpan) {
            const costo = parseFloat(costoSpan.textContent.replace('S/. ', '')) || 0;
            total += costo;
        }
    });
    // Sumar sub-recetas
    document.querySelectorAll('#sub-recetas-plato .sub-receta-row').forEach(row => {
        const costoSpan = row.querySelector('.costo-sub-receta');
        if (costoSpan) {
            const costo = parseFloat(costoSpan.textContent.replace('S/. ', '')) || 0;
            total += costo;
        }
    });
    // Sumar costos fijos
    let totalCostosFijos = 0;
    costosFijosPlato.forEach(cf => {
        totalCostosFijos += cf.costoPorPlato;
    });
    total += totalCostosFijos;
    document.getElementById('costo-total-plato').textContent = total.toFixed(2);
}

function eliminarSubRecetaRow(btn) {
    btn.parentElement.remove();
    calcularCostoReceta();
}

function actualizarSelectoresSubRecetas() {
    const selects = document.querySelectorAll('.select-sub-receta');
    selects.forEach(select => {
        if (select.options.length <= 1) { // Solo si no se han cargado
            subRecetas.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.id;
                option.textContent = sub.nombre + ' (S/. ' + sub.costoTotal.toFixed(2) + ')';
                select.appendChild(option);
            });
        }
    });
}
