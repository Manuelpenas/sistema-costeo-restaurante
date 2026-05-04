// SISTEMA DE COSTEO - VERSIÓN FINAL FUNCIONAL COMPLETA
console.log('Iniciando Sistema de Costeo...');

// Variables globales
let medidas = JSON.parse(localStorage.getItem('medidas')) || [
    { id: 1, nombre: 'gramo', abreviatura: 'g', equivalencia: 1, unidadBase: 'g' },
    { id: 2, nombre: 'kilogramo', abreviatura: 'kg', equivalencia: 1000, unidadBase: 'g' },
    { id: 3, nombre: 'mililitro', abreviatura: 'ml', equivalencia: 1, unidadBase: 'ml' },
    { id: 4, nombre: 'litro', abreviatura: 'l', equivalencia: 1000, unidadBase: 'ml' },
    { id: 5, nombre: 'unidad', abreviatura: 'unidad', equivalencia: 1, unidadBase: 'unidad' }
];
let insumos = JSON.parse(localStorage.getItem('insumos')) || [];
let subRecetas = JSON.parse(localStorage.getItem('subRecetas')) || [];
let recetas = JSON.parse(localStorage.getItem('recetas')) || [];
let costosFijos = JSON.parse(localStorage.getItem('costosFijos')) || [];
let config = JSON.parse(localStorage.getItem('config')) || {
    colorPrincipal: '#1abc9c',
    colorSecundario: '#3498db',
    colorFondo: '#667eea',
    logo: '',
    favicon: ''
};

// Variables de edición
let editingMedidaId = null;
let editingInsumoId = null;
let editingSubRecetaId = null;
let editingRecetaId = null;
let editingCostoFijoId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando...');
    initTabs();
    initFormMedida();
    initFormInsumo();
    initFormSubReceta();
    initFormReceta();
    initFormCostoFijo();
    initFormConfig();
    cargarMedidas();
    cargarInsumos();
    cargarSubRecetas();
    cargarRecetas();
    cargarCostosFijos();
    actualizarSelectores();
    aplicarConfig();
    console.log('Inicialización completa');
});

// ==================== NAVEGACIÓN ====================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            const tabElement = document.getElementById(tab);
            if (tabElement) tabElement.classList.add('active');
        });
    });
}

// ==================== MEDIDAS ====================
function initFormMedida() {
    const form = document.getElementById('form-medida');
    if (!form) return;
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
            const medida = medidas.find(m => m.id === editingMedidaId);
            if (medida) {
                medida.nombre = nombre;
                medida.abreviatura = abreviatura;
                medida.equivalencia = equivalencia;
                medida.unidadBase = unidadBase;
            }
            editingMedidaId = null;
            form.querySelector('button[type="submit"]').textContent = 'Guardar Medida';
        } else {
            if (medidas.some(m => m.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert('Esta medida ya existe');
                return;
            }
            medidas.push({ id: Date.now(), nombre, abreviatura, equivalencia, unidadBase });
        }
        guardarDatos();
        form.reset();
        cargarMedidas();
        actualizarSelectores();
    });
}

function cargarMedidas() {
    const tbody = document.querySelector('#tabla-medidas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    medidas.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.nombre}</td>
            <td>${m.abreviatura}</td>
            <td>${m.equivalencia}</td>
            <td>${m.unidadBase}</td>
            <td><button class="btn-remove" onclick="eliminarMedida(${m.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarMedida(id) {
    if (confirm('¿Eliminar medida?')) {
        medidas = medidas.filter(m => m.id !== id);
        guardarDatos();
        cargarMedidas();
    }
}

// ==================== INSUMOS ====================
function initFormInsumo() {
    const form = document.getElementById('form-insumo');
    if (!form) return;
    const cantidadInput = document.getElementById('cantidad-insumo');
    const precioTotalInput = document.getElementById('precio-total-insumo');
    const precioUnitarioInput = document.getElementById('precio-unitario-insumo');
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
        const categoria = document.getElementById('categoria-insumo').value;
        const nombre = document.getElementById('nombre-insumo').value.trim();
        const unidad = document.getElementById('unidad-insumo').value;
        const cantidad = parseFloat(document.getElementById('cantidad-insumo').value);
        const precioTotal = parseFloat(document.getElementById('precio-total-insumo').value);
        const precioUnitario = cantidad > 0 ? precioTotal / cantidad : 0;
        if (!categoria || !nombre || !unidad || !cantidad || !precioTotal) {
            alert('Complete todos los campos');
            return;
        }
        if (editingInsumoId) {
            const insumo = insumos.find(i => i.id === editingInsumoId);
            if (insumo) {
                insumo.categoria = categoria;
                insumo.nombre = nombre;
                insumo.unidad = unidad;
                insumo.cantidad = cantidad;
                insumo.precioTotal = precioTotal;
                insumo.precioUnitario = precioUnitario;
            }
            editingInsumoId = null;
            form.querySelector('button[type="submit"]').textContent = 'Guardar Insumo';
        } else {
            if (insumos.some(i => i.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert('Este insumo ya está registrado');
                return;
            }
            insumos.push({ id: Date.now(), categoria, nombre, unidad, cantidad, precioTotal, precioUnitario });
        }
        guardarDatos();
        form.reset();
        cargarInsumos();
        actualizarSelectores();
    });
}

function cargarInsumos() {
    const tbody = document.querySelector('#tabla-insumos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (insumos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:#999;">No hay insumos registrados</td></tr>';
        return;
    }
    insumos.forEach(ing => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ing.categoria || '-'}</td>
            <td>${ing.nombre || '-'}</td>
            <td>${ing.unidad || '-'}</td>
            <td>${ing.cantidad || 0}</td>
            <td>S/. ${(ing.precioUnitario || 0).toFixed(4)}</td>
            <td>S/. ${(ing.precioTotal || 0).toFixed(2)}</td>
            <td>${ing.cantidad || 0}</td>
            <td><button class="btn-remove" onclick="eliminarInsumo(${ing.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarInsumo(id) {
    if (confirm('¿Eliminar insumo?')) {
        insumos = insumos.filter(i => i.id !== id);
        guardarDatos();
        cargarInsumos();
    }
}

// ==================== SUB RECETAS ====================
function initFormSubReceta() {
    const form = document.getElementById('form-sub-receta');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-sub-receta').value.trim();
        if (!nombre) return;
        if (editingSubRecetaId) {
            const sub = subRecetas.find(s => s.id === editingSubRecetaId);
            if (sub) sub.nombre = nombre;
            editingSubRecetaId = null;
            form.querySelector('button[type="submit"]').textContent = 'Guardar Sub Receta';
        } else {
            subRecetas.push({ id: Date.now(), nombre, insumos: [], costoTotal: 0 });
        }
        guardarDatos();
        form.reset();
        cargarSubRecetas();
        actualizarSelectores();
    });
}

function cargarSubRecetas() {
    const tbody = document.querySelector('#tabla-sub-recetas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (subRecetas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#999;">No hay sub recetas registradas</td></tr>';
        return;
    }
    subRecetas.forEach(sub => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sub.nombre}</td>
            <td>S/. ${(sub.costoTotal || 0).toFixed(2)}</td>
            <td><button class="btn-remove" onclick="eliminarSubReceta(${sub.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarSubReceta(id) {
    if (confirm('¿Eliminar sub receta?')) {
        subRecetas = subRecetas.filter(s => s.id !== id);
        guardarDatos();
        cargarSubRecetas();
    }
}

// ==================== RECETAS ====================
function initFormReceta() {
    const form = document.getElementById('form-receta');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-receta').value.trim();
        if (!nombre) return;
        if (editingRecetaId) {
            const receta = recetas.find(r => r.id === editingRecetaId);
            if (receta) receta.nombre = nombre;
            editingRecetaId = null;
            form.querySelector('button[type="submit"]').textContent = 'Guardar Receta';
        } else {
            recetas.push({ id: Date.now(), nombre, costoTotal: 0 });
        }
        guardarDatos();
        form.reset();
        cargarRecetas();
        actualizarSelectores();
    });
}

function cargarRecetas() {
    const tbody = document.querySelector('#tabla-recetas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (recetas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#999;">No hay recetas registradas</td></tr>';
        return;
    }
    recetas.forEach(rec => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rec.nombre}</td>
            <td>S/. ${(rec.costoTotal || 0).toFixed(2)}</td>
            <td><button class="btn-remove" onclick="eliminarReceta(${rec.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarReceta(id) {
    if (confirm('¿Eliminar receta?')) {
        recetas = recetas.filter(r => r.id !== id);
        guardarDatos();
        cargarRecetas();
    }
}

// ==================== COSTOS FIJOS ====================
function initFormCostoFijo() {
    const form = document.getElementById('form-costo-fijo');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const concepto = document.getElementById('concepto-costo-fijo').value;
        const monto = parseFloat(document.getElementById('monto-costo-fijo').value);
        const totalPlatos = parseInt(document.getElementById('total-platos-vendidos').value) || 1000;
        if (!concepto || !monto) {
            alert('Complete los campos');
            return;
        }
        const costoPorPlato = monto / totalPlatos;
        if (editingCostoFijoId) {
            const costo = costosFijos.find(c => c.id === editingCostoFijoId);
            if (costo) {
                costo.concepto = concepto;
                costo.monto = monto;
                costo.costoPorPlato = costoPorPlato;
            }
            editingCostoFijoId = null;
            form.querySelector('button[type="submit"]').textContent = 'Guardar Costo Fijo';
        } else {
            costosFijos.push({ id: Date.now(), concepto, monto, costoPorPlato });
        }
        guardarDatos();
        form.reset();
        cargarCostosFijos();
        alert('Costo fijo guardado');
    });
}

function cargarCostosFijos() {
    const tbody = document.querySelector('#tabla-costos-fijos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (costosFijos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">No hay costos fijos registrados</td></tr>';
        return;
    }
    let totalMensual = 0;
    costosFijos.forEach(cf => {
        totalMensual += cf.monto;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cf.concepto}</td>
            <td>S/. ${(cf.monto || 0).toFixed(2)}</td>
            <td>S/. ${(cf.costoPorPlato || 0).toFixed(2)}</td>
            <td><button class="btn-remove" onclick="eliminarCostoFijo(${cf.id})">X</button></td>
        `;
        tbody.appendChild(tr);
    });
    const totalElement = document.getElementById('total-costos-fijos');
    if (totalElement) totalElement.textContent = 'S/. ' + totalMensual.toFixed(2);
}

function eliminarCostoFijo(id) {
    if (confirm('¿Eliminar costo fijo?')) {
        costosFijos = costosFijos.filter(c => c.id !== id);
        guardarDatos();
        cargarCostosFijos();
    }
}

// ==================== ACTUALIZAR SELECTORES ====================
function actualizarSelectores() {
    actualizarSelectoresInsumos();
    actualizarSelectoresSubRecetas();
    actualizarSelectoresRecetas();
    actualizarSelectoresCostosFijos();
}

function actualizarSelectoresInsumos() {
    const selects = document.querySelectorAll('.select-insumo, #categoria-insumo');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar insumo...</option>';
        insumos.forEach(ing => {
            const option = document.createElement('option');
            option.value = ing.id;
            option.textContent = ing.nombre + ' (' + ing.unidad + ') - S/. ' + ing.precioUnitario.toFixed(4) + '/' + ing.unidad;
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

function actualizarSelectoresSubRecetas() {
    const selects = document.querySelectorAll('.select-sub-receta');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar sub receta...</option>';
        subRecetas.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.nombre + ' (S/. ' + sub.costoTotal.toFixed(2) + ')';
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

function actualizarSelectoresRecetas() {
    const selects = document.querySelectorAll('#select-receta-costos');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar receta...</option>';
        recetas.forEach(rec => {
            const option = document.createElement('option');
            option.value = rec.id;
            option.textContent = rec.nombre;
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

function actualizarSelectoresCostosFijos() {
    const selects = document.querySelectorAll('#select-costo-fijo-plato');
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Seleccionar costo fijo...</option>';
        costosFijos.forEach(cf => {
            const option = document.createElement('option');
            option.value = cf.id;
            option.textContent = cf.concepto + ' (S/. ' + cf.costoPorPlato.toFixed(2) + '/plato)';
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

// ==================== CALCULAR COSTOS ====================
function calcularCostoInsumo(select) {
    const row = select.parentElement;
    const insumoId = parseInt(select.value);
    const cantidadInput = row.querySelector('.cantidad-insumo-sub');
    const unidadSpan = row.querySelector('.unidad-insumo-sub');
    const costoSpan = row.querySelector('.costo-insumo-sub');
    const insumo = insumos.find(i => i.id === insumoId);
    if (insumo && cantidadInput && costoSpan) {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const costo = cantidad * insumo.precioUnitario;
        costoSpan.textContent = 'S/. ' + costo.toFixed(2);
        if (unidadSpan) unidadSpan.textContent = insumo.unidad;
    }
    calcularCostoSubReceta();
}

function calcularCostoSubReceta() {
    let total = 0;
    document.querySelectorAll('#insumos-sub-receta .insumo-row').forEach(row => {
        const costoSpan = row.querySelector('.costo-insumo-sub');
        if (costoSpan) {
            const costo = parseFloat(costoSpan.textContent.replace('S/. ', '')) || 0;
            total += costo;
        }
    });
    const totalSpan = document.getElementById('costo-total-sub-receta');
    if (totalSpan) totalSpan.textContent = total.toFixed(2);
}

function agregarInsumoSub() {
    const div = document.createElement('div');
    div.className = 'insumo-row';
    div.innerHTML = `
        <select class="select-insumo-sub" onchange="calcularCostoInsumo(this)">
            <option value="">Seleccionar insumo...</option>
        </select>
        <input type="number" class="cantidad-insumo-sub" placeholder="Cantidad" step="0.01" oninput="calcularCostoInsumo(this)">
        <span class="unidad-insumo-sub">-</span>
        <span class="costo-insumo-sub">S/. 0.00</span>
        <button type="button" class="btn-remove" onclick="eliminarInsumoSub(this)">X</button>
    `;
    document.getElementById('insumos-sub-receta').appendChild(div);
    actualizarSelectoresInsumos();
}

function eliminarInsumoSub(btn) {
    btn.parentElement.remove();
    calcularCostoSubReceta();
}

// ==================== CONFIGURACIÓN ====================
function initFormConfig() {
    const form = document.getElementById('form-config');
    if (!form) return;
    document.getElementById('color-principal').value = config.colorPrincipal;
    document.getElementById('color-secundario').value = config.colorSecundario;
    document.getElementById('color-fondo').value = config.colorFondo;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        config.colorPrincipal = document.getElementById('color-principal').value;
        config.colorSecundario = document.getElementById('color-secundario').value;
        config.colorFondo = document.getElementById('color-fondo').value;
        const logoFile = document.getElementById('logo-upload').files[0];
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                config.logo = e.target.result;
                guardarConfigYDatos();
            };
            reader.readAsDataURL(logoFile);
        } else {
            guardarConfigYDatos();
        }
        const faviconFile = document.getElementById('favicon-upload').files[0];
        if (faviconFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                config.favicon = e.target.result;
                const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = e.target.result;
                document.getElementsByTagName('head')[0].appendChild(link);
                guardarConfigYDatos();
            };
            reader.readAsDataURL(faviconFile);
        }
        aplicarConfig();
        alert('Configuración guardada');
    });
}

function guardarConfigYDatos() {
    localStorage.setItem('config', JSON.stringify(config));
    guardarDatos();
}

function aplicarConfig() {
    if (config.logo) {
        const logoImg = document.getElementById('logo-img');
        if (logoImg) {
            logoImg.src = config.logo;
            logoImg.style.display = 'block';
        }
    }
    const css = `
        .btn-primary { background: ${config.colorPrincipal} !important; }
        .tab-btn.active { background: ${config.colorPrincipal} !important; }
        body { background: linear-gradient(135deg, ${config.colorFondo} 0%, ${config.colorFondo}99 100%) !important; }
    `;
    let styleElement = document.getElementById('dynamic-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-styles';
        document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
}

// ==================== GUARDAR DATOS ====================
function guardarDatos() {
    try {
        localStorage.setItem('medidas', JSON.stringify(medidas));
        localStorage.setItem('insumos', JSON.stringify(insumos));
        localStorage.setItem('subRecetas', JSON.stringify(subRecetas));
        localStorage.setItem('recetas', JSON.stringify(recetas));
        localStorage.setItem('costosFijos', JSON.stringify(costosFijos));
    } catch(e) {
        console.error('Error al guardar:', e);
    }
}

console.log('Sistema de Costeo - Versión Final Cargada');
