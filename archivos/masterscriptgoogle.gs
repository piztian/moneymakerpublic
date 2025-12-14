// ============================================
// TASK MONEY MAKER - GOOGLE APPS SCRIPT MASTER
// Sistema Multi-Cliente con Tabla Centralizada
// EnseñandoLuke por Luke Alexander
// ✅ VERSIÓN 2 - DÍA SE CALCULA CON FÓRMULA EN SHEETS
// ACTUALIZADO: Envío automático de emails al registrarse
// ============================================

// CONFIGURACIÓN: Spreadsheet ID de la plantilla maestra (donde está la tabla de clientes)
const MASTER_SPREADSHEET_ID = '1VFxMN-HQIQAA-sWBjaPNo8h53fjDqbxd8zLVhh61rXw';
const CLIENTES_SHEET_NAME = 'Clientes';
const TIMEZONE = 'America/Mexico_City'; // Guadalajara, Jalisco

// Cachear clientes para evitar leer la hoja cada vez
let clientesCache = null;
let clientesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ============================================
// FUNCIÓN: Crear menú en Google Sheets
// ============================================
function onOpen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const menu = ss.addMenu('⚙️ Task Money Maker', [
    { name: ' 📧 Enviar URLs a Nuevo Cliente', functionName: 'abrirDialogoEnvioEmail' },
    { name: ' 🔄 Limpiar Cache de Clientes', functionName: 'limpiarCacheClientes' },
    { name: ' 🔧 Actualizar Todas las Fórmulas', functionName: 'actualizarFormulas' },
    null, // Separador
    { name: '❓ Ayuda', functionName: 'mostrarAyuda' }
  ]);
}

// ============================================
// TRIGGER AUTOMÁTICO: Notificar al admin cuando se registra cliente
// ============================================
function onFormSubmit(e) {
  try {
    Logger.log('=== NUEVO CLIENTE REGISTRADO ===');
    
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log('❌ No existe hoja Clientes');
      return;
    }
    
    // Obtener última fila (el nuevo cliente registrado)
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(lastRow, 1, 1, 10).getValues()[0];
    
    // Estructura: A=Marca temporal, B=ID Cliente, C=Nombre, D=Sheet ID, E=Email, F=Teléfono
    const marca = data[0];          // A
    const idCliente = data[1];      // B
    const nombre = data[2];         // C
    const sheetId = data[3];        // D
    const email = data[4];          // E
    const telefono = data[5];       // F
    
    Logger.log('Cliente: ' + nombre);
    Logger.log('Email: ' + email);
    Logger.log('ID: ' + idCliente);
    
    if (!email || !nombre) {
      Logger.log('❌ Falta email o nombre');
      return;
    }
    
    // ENVIAR NOTIFICACIÓN AL ADMIN (piztian@gmail.com)
    const adminEmail = 'piztian@gmail.com';
    const asunto = '📋 [TAREA] Nuevo cliente registrado: ' + nombre;
    
    const cuerpo = `¡Hola Cris! 👋

Un nuevo cliente acaba de registrarse en Task Money Maker:

📋 DATOS DEL CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
Marca temporal: ${marca}
ID Cliente: ${idCliente}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 PRÓXIMOS PASOS:
1️⃣ Copiar plantilla de Google Sheet
2️⃣ Renombrar: "TaskMoneyMaker - ${nombre}"
3️⃣ Copiar el Sheet ID
4️⃣ Pegar en columna D de la pestaña "Clientes"
5️⃣ Ir a ⚙️ Task Money Maker → 📧 Enviar URLs a Nuevo Cliente
6️⃣ Seleccionar cliente y enviar email

🔗 Link a pestaña Clientes:
https://docs.google.com/spreadsheets/d/${MASTER_SPREADSHEET_ID}/edit#gid=0

¡A trabajar! 💪
    `.trim();
    
    // Enviar email al admin
    MailApp.sendEmail(adminEmail, asunto, cuerpo);
    
    Logger.log('✅ Notificación enviada a admin: ' + adminEmail);
    Logger.log('=== FIN REGISTRO ===');
    
  } catch (error) {
    Logger.log('❌ Error en onFormSubmit: ' + error.toString());
    Logger.log(error.stack);
  }
}

// ============================================
// FUNCIÓN: Diálogo para enviar emails
// ============================================
function abrirDialogoEnvioEmail() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background: #f5f5f5;
      }
      .container {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h2 {
        color: #667eea;
        margin-top: 0;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      input, select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        font-size: 14px;
      }
      input:focus, select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      }
      .btn-enviar {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      .btn-enviar:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }
      .btn-cancelar {
        background: #e0e0e0;
        color: #333;
      }
      .btn-cancelar:hover {
        background: #d0d0d0;
      }
      .info {
        background: #e7f3ff;
        padding: 10px;
        border-radius: 4px;
        border-left: 4px solid #667eea;
        margin-bottom: 15px;
        font-size: 13px;
        color: #555;
      }
      .loading {
        display: none;
        text-align: center;
        padding: 10px;
      }
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    
    <div class="container">
      <h2>📧 Enviar URLs a Nuevo Cliente</h2>
      
      <div class="info">
        ✨ Selecciona un cliente de la tabla "Clientes" y se enviará un email con sus URLs personalizadas.
      </div>
      
      <div class="form-group">
        <label for="clienteSelect">Selecciona el Cliente:</label>
        <select id="clienteSelect">
          <option value="">-- Cargando clientes --</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="emailDestino">Email de Destino:</label>
        <input type="email" id="emailDestino" placeholder="email@ejemplo.com">
      </div>
      
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Enviando email...</p>
      </div>
      
      <div class="button-group">
        <button class="btn-enviar" onclick="enviarEmail()">📧 Enviar Email</button>
        <button class="btn-cancelar" onclick="google.script.host.close()">Cancelar</button>
      </div>
    </div>
    
    <script>
      // Cargar clientes al abrir
      google.script.run.withSuccessHandler(function(clientes) {
        const select = document.getElementById('clienteSelect');
        select.innerHTML = '<option value="">-- Selecciona un cliente --</option>';
        
        clientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = JSON.stringify(cliente);
          option.textContent = cliente.Nombre + ' (' + cliente['ID Cliente'] + ')';
          select.appendChild(option);
        });
      }).obtenerClientesParaEmail();
      
      // Actualizar email cuando selecciona cliente
      document.getElementById('clienteSelect').addEventListener('change', function() {
        if (this.value) {
          const cliente = JSON.parse(this.value);
          document.getElementById('emailDestino').value = cliente.Email || '';
        }
      });
      
      function enviarEmail() {
        const select = document.getElementById('clienteSelect');
        const email = document.getElementById('emailDestino').value;
        
        if (!select.value || !email) {
          alert('⚠️ Por favor completa todos los campos');
          return;
        }
        
        const cliente = JSON.parse(select.value);
        
        document.getElementById('loading').style.display = 'block';
        
        google.script.run.withSuccessHandler(function(resultado) {
          document.getElementById('loading').style.display = 'none';
          if (resultado.success) {
            alert('✅ Email enviado correctamente a ' + email);
            google.script.host.close();
          } else {
            alert('❌ Error: ' + resultado.message);
          }
        }).enviarEmailCliente(cliente, email);
      }
    </script>
  `);
  
  SpreadsheetApp.getUi().showModelessDialog(html, '📧 Enviar URLs');
}

// ============================================
// FUNCIÓN: Obtener clientes para el diálogo
// ============================================
function obtenerClientesParaEmail() {
  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const clientes = [];
    
    // Saltar encabezado (fila 0)
    // Estructura: A=Marca temporal, B=ID Cliente, C=Nombre, D=Sheet ID, E=Email, F=Teléfono, G=Dashboard, H=Reportes, I=Config, J=Resumen
    for (let i = 1; i < data.length; i++) {
      if (data[i][1]) { // Si existe ID Cliente (columna B, índice 1)
        clientes.push({
          'ID Cliente': data[i][1],      // B
          'Nombre': data[i][2],          // C
          'Sheet ID': data[i][3],        // D
          'Email': data[i][4],           // E
          'Teléfono': data[i][5],        // F
          'Dashboard': data[i][6],       // G
          'Reportes': data[i][7],        // H
          'Config': data[i][8],          // I
          'Resumen': data[i][9]          // J
        });
      }
    }
    
    return clientes;
  } catch (error) {
    Logger.log('Error: ' + error);
    return [];
  }
}

// ============================================
// FUNCIÓN: Enviar email con URLs
// ============================================
function enviarEmailCliente(cliente, emailDestino) {
  try {
    const idCliente = cliente['ID Cliente'];
    const nombreCliente = cliente['Nombre'];
    
    // Generar URLs directamente
    const baseUrl = 'https://capinimx.bitrix24.site/ensenandoluke';
    const dashboard = baseUrl + '/dashboardmoneytareas/?cliente=' + idCliente;
    const reportes = baseUrl + '/reportes/?cliente=' + idCliente;
    const config = baseUrl + '/config/?cliente=' + idCliente;
    const resumen = baseUrl + '/resumensemanal/?cliente=' + idCliente;
    
    const asunto = '🎉 ¡Tu acceso a Task Money Maker está listo!';
    
    const cuerpo = `¡Hola ${nombreCliente}! 👋

Tu acceso a Task Money Maker ya está configurado y listo para usar. 🚀

📊 ACCESO RÁPIDO:

1️⃣ Dashboard (Marca tus tareas diarias):
${dashboard}

2️⃣ Configuración (Personaliza tus tareas):
${config}

3️⃣ Reportes (Ve tu progreso):
${reportes}

4️⃣ Resumen Semanal (Analítica semanal):
${resumen}

---

💡 TIPS PARA EMPEZAR:
✅ Marca las tareas que completes cada día
✅ Configura las tareas según tus necesidades
✅ Revisa tus reportes para ver tu progreso
✅ Mantén una racha constante 🔥

---

¿Dudas o necesitas ayuda? 
📞 Contacta con nuestro equipo

¡A disfrutar! 💰

---
Task Money Maker
EnseñandoLuke por Luke Alexander
    `.trim();
    
    MailApp.sendEmail(emailDestino, asunto, cuerpo);
    
    Logger.log('✅ Email enviado a ' + emailDestino);
    Logger.log('URLs generadas para: ' + idCliente);
    
    return {
      success: true,
      message: 'Email enviado correctamente'
    };
    
  } catch (error) {
    Logger.log('Error enviando email: ' + error);
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ============================================
// FUNCIÓN: Actualizar fórmulas
// ============================================
function actualizarFormulas() {
  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ No existe la hoja "Clientes"');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Actualizar fórmulas para cada cliente
    for (let i = 1; i < data.length; i++) {
      const idCliente = data[i][0];
      
      if (idCliente) {
        // Dashboard
        sheet.getRange(i + 1, 6).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/dashboardmoneytareas/?cliente=",B${i + 1}))`);
        
        // Reportes
        sheet.getRange(i + 1, 7).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/reportes/?cliente=",B${i + 1}))`);
        
        // Config
        sheet.getRange(i + 1, 8).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/config/?cliente=",B${i + 1}))`);
        
        // Resumen
        sheet.getRange(i + 1, 9).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/resumensemanal/?cliente=",B${i + 1}))`);
      }
    }
    
    SpreadsheetApp.getUi().alert('✅ Fórmulas actualizadas correctamente');
    Logger.log('✅ Fórmulas actualizadas');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
  }
}

// ============================================
// FUNCIÓN: Mostrar Ayuda
// ============================================
function mostrarAyuda() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background: #f5f5f5;
      }
      .container {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h2 {
        color: #667eea;
        margin-top: 0;
      }
      .section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 4px;
        border-left: 4px solid #667eea;
      }
      .section h3 {
        margin-top: 0;
        color: #333;
      }
      .section p {
        margin: 5px 0;
        color: #666;
        line-height: 1.6;
      }
      code {
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
        color: #d63384;
      }
    </style>
    
    <div class="container">
      <h2>❓ Ayuda - Task Money Maker</h2>
      
      <div class="section">
        <h3>📧 Enviar URLs a Nuevo Cliente</h3>
        <p>Selecciona un cliente de la tabla "Clientes" y automáticamente se enviará un email con sus URLs personalizadas.</p>
        <p><strong>¿Cuándo usarlo?</strong> Después de que el cliente se registre en el formulario.</p>
      </div>
      
      <div class="section">
        <h3>🔄 Limpiar Cache de Clientes</h3>
        <p>Limpia el cache interno para que se recarguen todos los clientes. Útil si acabas de agregar nuevos clientes.</p>
        <p><strong>¿Cuándo usarlo?</strong> Si los nuevos clientes no aparecen inmediatamente.</p>
      </div>
      
      <div class="section">
        <h3>🔧 Actualizar Todas las Fórmulas</h3>
        <p>Regenera todas las fórmulas de URLs en la tabla "Clientes".</p>
        <p><strong>¿Cuándo usarlo?</strong> Si las URLs no se generan correctamente.</p>
      </div>
      
      <div class="section">
        <h3>📋 Estructura de la Tabla "Clientes"</h3>
        <p>Las columnas deben ser:</p>
        <code>ID Cliente | Nombre | Sheet ID | Email | Teléfono | Dashboard | Reportes | Config | Resumen</code>
      </div>
      
      <div class="section">
        <h3>✅ Checklist para Nuevo Cliente</h3>
        <p>1. Cliente llena el formulario de Google</p>
        <p>2. Se registra automáticamente en la tabla "Clientes"</p>
        <p>3. Las fórmulas generan los URLs automáticamente</p>
        <p>4. El email se envía AUTOMÁTICAMENTE ✨</p>
        <p>5. ¡Listo! El cliente puede usar</p>
      </div>
    </div>
  `);
  
  SpreadsheetApp.getUi().showModelessDialog(html, '❓ Ayuda');
}

// ============================================
// FUNCIÓN: Cargar clientes desde tabla centralizada
// ============================================
function cargarClientes() {
  const ahora = Date.now();
  
  // Si el cache está fresco, usarlo
  if (clientesCache && (ahora - clientesCacheTime) < CACHE_DURATION) {
    Logger.log('✅ Usando cache de clientes');
    return clientesCache;
  }
  
  Logger.log('🔥 Leyendo tabla de clientes...');
  
  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log('❌ No existe hoja "Clientes"');
      return {};
    }
    
    const data = sheet.getDataRange().getValues();
    const clientes = {};
    
    // Estructura: A=Marca temporal, B=ID Cliente, C=Nombre, D=Sheet ID, E=Email, F=Teléfono
    // Saltar encabezado (fila 1)
    for (let i = 1; i < data.length; i++) {
      const id = data[i][1];        // Columna B
      const nombre = data[i][2];    // Columna C
      const sheetId = data[i][3];   // Columna D
      const email = data[i][4];     // Columna E
      const telefono = data[i][5];  // Columna F
      
      if (id && sheetId) {
        clientes[id] = {
          nombre: nombre,
          sheetId: sheetId,
          email: email,
          telefono: telefono
        };
        Logger.log('✅ Cliente cargado: ' + id);
      }
    }
    
    // Guardar en cache
    clientesCache = clientes;
    clientesCacheTime = ahora;
    
    Logger.log('✅ Total de clientes cargados: ' + Object.keys(clientes).length);
    return clientes;
    
  } catch (error) {
    Logger.log('❌ Error cargando clientes: ' + error.toString());
    return {};
  }
}

// ============================================
// FUNCIÓN PRINCIPAL - Recibe datos del dashboard
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const clienteId = data.clienteId || 'luke-alexander';
    
    Logger.log('=== INICIO doPost ===');
    Logger.log('Cliente: ' + clienteId);
    Logger.log('Tipo de dato: ' + data.tipo);
    
    // Cargar clientes
    const clientes = cargarClientes();
    
    // Verificar que el cliente existe
    if (!clientes[clienteId]) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Cliente no encontrado: ' + clienteId
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtener el spreadsheet del cliente
    const spreadsheetId = clientes[clienteId].sheetId;
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // ============================================
    // GUARDAR CONFIGURACIÓN DE TAREAS
    // ============================================
    if (data.tipo === 'CONFIGURACION_TAREAS') {
      Logger.log('↑ Guardando configuración de tareas');
      let configSheet = ss.getSheetByName('ConfiguracionTareas');
      
      if (!configSheet) {
        configSheet = ss.insertSheet('ConfiguracionTareas');
        configSheet.appendRow(['Cliente', 'Fecha', 'Configuración']);
        var headerRange = configSheet.getRange(1, 1, 1, 3);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#667eea');
        headerRange.setFontColor('#ffffff');
      }
      
      // Buscar si ya existe configuración para este cliente
      var ultimaFila = configSheet.getLastRow();
      var filaActualizacion = -1;
      
      for (var i = 2; i <= ultimaFila; i++) {
        if (configSheet.getRange(i, 1).getValue() === clienteId) {
          filaActualizacion = i;
        }
      }
      
      if (filaActualizacion > 0) {
        // Actualizar configuración existente
        configSheet.getRange(filaActualizacion, 2).setValue(data.fecha);
        configSheet.getRange(filaActualizacion, 3).setValue(data.configuracion);
        Logger.log('✅ Configuración actualizada en fila ' + filaActualizacion);
      } else {
        // Agregar nueva configuración
        configSheet.appendRow([clienteId, data.fecha, data.configuracion]);
        Logger.log('✅ Nueva configuración agregada');
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Configuración guardada correctamente',
        cliente: clienteId
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ============================================
    // GUARDAR DATOS DIARIOS DE TAREAS
    // ============================================
    var sheetDatos = ss.getSheetByName('Datos Diarios');
    
    // Crear hoja si no existe
    if (!sheetDatos) {
      sheetDatos = ss.insertSheet('Datos Diarios');
      inicializarHojaDatos(sheetDatos);
    }
    
    Logger.log('Fecha recibida: ' + data.fecha);
    
    // Calcular datos adicionales
    const numTareasCompletadas = data.tareasCompletadas ? data.tareasCompletadas.split(',').filter(t => t.trim()).length : 0;
    const totalTareasPosibles = 10;
    const porcentajeCumplimiento = (numTareasCompletadas / totalTareasPosibles) * 100;
    const semanaDelAnio = obtenerNumeroSemana(new Date(data.fecha));
    
    // Calcular racha
    const racha = calcularRacha(sheetDatos, data.fecha);
    
    Logger.log('Datos calculados:');
    Logger.log('  Tareas: ' + numTareasCompletadas + '/' + totalTareasPosibles);
    Logger.log('  %: ' + porcentajeCumplimiento.toFixed(1));
    Logger.log('  Racha: ' + racha);
    
    // Verificar si ya existe un registro para esta fecha
    const filaExistente = buscarFila(sheetDatos, data.fecha);
    
    Logger.log('Fila existente: ' + filaExistente);
    
    // ✅ CAMBIO: No incluir diaSemana - se calcula con fórmula en Sheets
    var datosParaGuardar = {
      fecha: data.fecha,
      // diaSemana: OMITIDO - se calcula con fórmula =TEXT(A2,"dddd") en Google Sheets
      semana: semanaDelAnio,
      totalGanado: data.total,
      tareasCompletadas: data.tareasCompletadas,
      numTareas: numTareasCompletadas,
      porcentaje: porcentajeCumplimiento,
      racha: racha,
      detalles: data.detalles
    };
    
    if (filaExistente > 0) {
      // ACTUALIZAR fila existente
      Logger.log('↑ ACTUALIZANDO fila ' + filaExistente);
      actualizarFila(sheetDatos, filaExistente, datosParaGuardar);
    } else {
      // CREAR nueva fila
      Logger.log('↑ CREANDO nueva fila');
      agregarNuevaFila(sheetDatos, datosParaGuardar);
    }
    
    // Formatear y ajustar columnas
    formatearHoja(sheetDatos);
    
    // Actualizar resumen automáticamente
    actualizarResumenSemanal(ss);
    crearTablaAnalisisSemana(ss);
    actualizarEstadisticas(ss);
    
    Logger.log('=== FIN doPost ===');
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Datos guardados correctamente',
      'cliente': clienteId,
      'racha': racha,
      'semana': semanaDelAnio,
      'accion': filaExistente > 0 ? 'actualizado' : 'creado'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    Logger.log(error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNCIÓN GET - Lee datos para reportes
// ============================================
function doGet(e) {
  try {
    const clienteId = e.parameter.cliente || 'luke-alexander';
    
    // Cargar clientes
    const clientes = cargarClientes();
    
    // Verificar que el cliente existe
    if (!clientes[clienteId]) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Cliente no encontrado'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheetId = clientes[clienteId].sheetId;
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheetDatos = ss.getSheetByName('Datos Diarios');
    const sheetResumen = ss.getSheetByName('Resumen Semanal');
    const sheetStats = ss.getSheetByName('Estadísticas');
    const sheetConfig = ss.getSheetByName('ConfiguracionTareas');
    
    // Buscar configuración del cliente
    let configuracion = null;
    if (sheetConfig) {
      var configData = sheetConfig.getDataRange().getValues();
      for (var i = 1; i < configData.length; i++) {
        if (configData[i][0] === clienteId) {
          configuracion = configData[i][2];
          break;
        }
      }
    }
    
    const resultado = {
      status: 'success',
      cliente: clienteId,
      datosDiarios: sheetDatos ? sheetDatos.getDataRange().getValues() : [],
      resumenSemanal: sheetResumen ? sheetResumen.getDataRange().getValues() : [],
      estadisticas: sheetStats ? sheetStats.getDataRange().getValues() : [],
      configuracion: configuracion
    };
    
    return ContentService.createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function inicializarHojaDatos(sheet) {
  var encabezados = [
    'Fecha', 'Día', 'Semana', 'Total Ganado', 'Tareas Completadas',
    '# Tareas', '% Cumplimiento', 'Racha', 'Detalles'
  ];
  
  sheet.appendRow(encabezados);
  
  var headerRange = sheet.getRange(1, 1, 1, encabezados.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#667eea');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  
  // ✅ CAMBIO 1: Agregar fórmula en B2 para que calcule el día automáticamente
  sheet.getRange('B2').setFormula('=TEXT(A2,"dddd")');
  
  Logger.log('✅ Hoja inicializada con fórmula para día de la semana');
}

function buscarFila(sheet, fecha) {
  var lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    return -1; // No hay datos
  }
  
  // Convertir fecha a string simple YYYY-MM-DD
  var fechaBusqueda;
  if (typeof fecha === 'string') {
    fechaBusqueda = fecha.split('T')[0]; // Tomar solo la parte de fecha
  } else {
    fechaBusqueda = Utilities.formatDate(new Date(fecha), TIMEZONE, 'yyyy-MM-dd');
  }
  
  Logger.log('Buscando fecha: ' + fechaBusqueda);
  
  // Recorrer todas las filas
  for (var i = 2; i <= lastRow; i++) {
    var celdaFecha = sheet.getRange(i, 1);
    var valorCelda = celdaFecha.getValue();
    
    // Convertir el valor de la celda a string YYYY-MM-DD
    var fechaEnFila;
    if (valorCelda instanceof Date) {
      fechaEnFila = Utilities.formatDate(valorCelda, TIMEZONE, 'yyyy-MM-dd');
    } else if (typeof valorCelda === 'string') {
      fechaEnFila = valorCelda.split('T')[0];
    } else {
      continue; // Saltar si no es fecha válida
    }
    
    Logger.log('Fila ' + i + ': ' + fechaEnFila);
    
    // Comparar strings
    if (fechaEnFila === fechaBusqueda) {
      Logger.log('✅ Encontrada en fila ' + i);
      return i;
    }
  }
  
  Logger.log('❌ No encontrada, crear nueva');
  return -1;
}

// ✅ CAMBIO 2: Agregar nueva fila sin diaSemana - la fórmula la llenará
function agregarNuevaFila(sheet, datos) {
  sheet.appendRow([
    datos.fecha,
    '', // ✅ Columna B vacía - la fórmula la llenará automáticamente
    datos.semana,
    '$' + datos.totalGanado.toFixed(2),
    datos.tareasCompletadas,
    datos.numTareas,
    datos.porcentaje.toFixed(1) + '%',
    datos.racha + ' días',
    datos.detalles
  ]);
  
  // ✅ Copiar la fórmula de B2 a la nueva fila
  var lastRow = sheet.getLastRow();
  sheet.getRange('B' + lastRow).setFormula('=TEXT(A' + lastRow + ',"dddd")');
  
  Logger.log('✅ Nueva fila agregada. Fórmula de día copiada a B' + lastRow);
}

// ✅ CAMBIO 3: Actualizar fila sin tocar columna B - la fórmula se mantiene
function actualizarFila(sheet, fila, datos) {
  sheet.getRange(fila, 1).setValue(datos.fecha);
  // ✅ NO modificar columna B - la fórmula se mantiene y recalcula automáticamente
  sheet.getRange(fila, 3).setValue(datos.semana);
  sheet.getRange(fila, 4).setValue('$' + datos.totalGanado.toFixed(2));
  sheet.getRange(fila, 5).setValue(datos.tareasCompletadas);
  sheet.getRange(fila, 6).setValue(datos.numTareas);
  sheet.getRange(fila, 7).setValue(datos.porcentaje.toFixed(1) + '%');
  sheet.getRange(fila, 8).setValue(datos.racha + ' días');
  sheet.getRange(fila, 9).setValue(datos.detalles);
  
  // ✅ Asegurarse que la fórmula está en la columna B
  if (!sheet.getRange(fila, 2).getFormula().includes('TEXT')) {
    sheet.getRange(fila, 2).setFormula('=TEXT(A' + fila + ',"dddd")');
    Logger.log('✅ Fórmula restaurada en B' + fila);
  }
}

function formatearHoja(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  sheet.getRange(2, 2, lastRow - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 3, lastRow - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 4, lastRow - 1, 1).setHorizontalAlignment('right');
  sheet.getRange(2, 6, lastRow - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 7, lastRow - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 8, lastRow - 1, 1).setHorizontalAlignment('center');
  
  for (var i = 2; i <= lastRow; i++) {
    var color = (i % 2 === 0) ? '#f5f7fa' : '#ffffff';
    sheet.getRange(i, 1, 1, 9).setBackground(color);
  }
  
  sheet.autoResizeColumns(1, 9);
}

function calcularRacha(sheet, fechaActual) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  
  var racha = 1;
  var fecha = new Date(fechaActual);
  
  for (var i = lastRow; i >= 2; i--) {
    var fechaFila = new Date(sheet.getRange(i, 1).getValue());
    var porcentajeStr = sheet.getRange(i, 7).getValue().toString();
    var porcentaje = parseFloat(porcentajeStr.replace('%', ''));
    
    if (porcentaje >= 50) {
      var diferenciaDias = Math.floor((fecha - fechaFila) / (1000 * 60 * 60 * 24));
      
      if (diferenciaDias === 1) {
        racha++;
        fecha = fechaFila;
      } else if (diferenciaDias > 1) {
        break;
      }
    } else {
      break;
    }
  }
  
  return racha;
}

// ============================================
// FUNCIÓN MEJORADA: actualizarResumenSemanal
// Lee de "Datos Diarios" y agrupa por semana
// ============================================

function actualizarResumenSemanal(ss) {
  var sheetDatos = ss.getSheetByName('Datos Diarios');
  var sheetResumen = ss.getSheetByName('Resumen Semanal');
  
  if (!sheetResumen) {
    sheetResumen = ss.insertSheet('Resumen Semanal');
  }
  
  sheetResumen.clear();
  
  // Si no hay datos diarios, no hacer nada
  if (!sheetDatos || sheetDatos.getLastRow() < 2) {
    Logger.log('❌ No hay datos en "Datos Diarios"');
    return;
  }
  
  // Encabezados mejorados
  var encabezados = ['Año-Semana', 'Total Ganado', 'Días Activos', 'Promedio Diario', 'Tareas Totales', '% Promedio', 'Mejor Día'];
  sheetResumen.appendRow(encabezados);
  
  var headerRange = sheetResumen.getRange(1, 1, 1, encabezados.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#764ba2');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheetResumen.setRowHeight(1, 40);
  sheetResumen.setFrozenRows(1);
  
  // LEER DATOS DE "DATOS DIARIOS"
  var data = sheetDatos.getDataRange().getValues();
  var semanas = {};
  
  // Estructura de Datos Diarios:
  // [0] Fecha, [1] Día, [2] Semana, [3] Total Ganado, [4] Tareas Completadas, 
  // [5] # Tareas, [6] % Cumplimiento, [7] Racha, [8] Detalles
  
  Logger.log('🔥 Procesando ' + (data.length - 1) + ' filas de Datos Diarios');
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][2]) continue; // Si no hay número de semana, saltar
    
    var fecha = data[i][0];
    var dia = data[i][1];
    var numeroSemana = data[i][2];
    var anio = new Date(fecha).getFullYear();
    var key = anio + '-S' + numeroSemana;
    var total = parseFloat(data[i][3].toString().replace('$', '')) || 0;
    var numTareas = data[i][5];
    
    // Leer porcentaje: puede venir como "80.5%" o "0.805"
    var porcentajeStr = data[i][6].toString().replace('%', '').trim();
    var porcentaje = parseFloat(porcentajeStr);
    
    // Si es muy pequeño (< 1), probablemente es decimal (0.805)
    // Si es normal (> 1), es porcentaje (80.5)
    if (porcentaje < 1 && porcentaje > 0) {
      porcentaje = porcentaje; // Ya es decimal, dejarlo así
    }
    
    Logger.log('Fila ' + i + ': ' + key + ' | ' + dia + ' | ' + numTareas + ' tareas | ' + porcentaje);
    
    if (!semanas[key]) {
      semanas[key] = {
        total: 0,
        dias: [],
        diasActivos: 0,
        tareas: 0,
        porcentajes: [],
        mejorDia: { fecha: fecha, total: total },
        diasDetalle: {}  // Para ver qué días fueron
      };
    }
    
    // Agregar información del día
    semanas[key].dias.push({
      fecha: fecha,
      dia: dia,
      total: total,
      tareas: numTareas,
      porcentaje: porcentaje
    });
    
    semanas[key].total += total;
    semanas[key].tareas += numTareas;
    semanas[key].porcentajes.push(porcentaje);
    
    // Contar días activos (donde hay ganancias)
    if (total > 0) {
      semanas[key].diasActivos++;
    }
    
    // Guardar detalle del día
    semanas[key].diasDetalle[dia] = {
      total: total,
      tareas: numTareas,
      porcentaje: porcentaje
    };
    
    if (total > semanas[key].mejorDia.total) {
      semanas[key].mejorDia = { fecha: fecha, total: total };
    }
  }
  
  // CREAR FILAS DEL RESUMEN
  var semanasOrdenadas = Object.keys(semanas).sort().reverse();
  
  Logger.log('📊 Total de semanas: ' + semanasOrdenadas.length);
  
  for (var j = 0; j < semanasOrdenadas.length; j++) {
    var key = semanasOrdenadas[j];
    var s = semanas[key];
    var promedioDiario = s.diasActivos > 0 ? s.total / s.diasActivos : 0;
    var promedioPorcentaje = s.porcentajes.length > 0 
      ? s.porcentajes.reduce((a, b) => a + b, 0) / s.porcentajes.length 
      : 0;
    var mejorDia = Utilities.formatDate(new Date(s.mejorDia.fecha), TIMEZONE, 'dd/MM');
    
    // Determinar formato del porcentaje promedio
    var porcentajeGuardar;
    if (promedioPorcentaje < 1) {
      // Es decimal (0.7398) - dejar como está para que el frontend lo interprete
      porcentajeGuardar = promedioPorcentaje * 100;
    } else {
      // Es porcentaje (73.98) - guardar como está
      porcentajeGuardar = promedioPorcentaje;
    }
    
    Logger.log('Semana ' + key + ': ' + s.diasActivos + ' días activos, ' + porcentajeGuardar + '% promedio');
    
    sheetResumen.appendRow([
      key,
      '$' + s.total.toFixed(2),
      s.diasActivos,  // Días ACTIVOS (con ganancias)
      '$' + promedioDiario.toFixed(2),
      s.tareas,
      porcentajeGuardar,  // Número puro (73.98)
      mejorDia + ' ($' + s.mejorDia.total.toFixed(2) + ')'
    ]);
  }
  
  // FORMATEAR TABLA
  var lastRow = sheetResumen.getLastRow();
  if (lastRow > 1) {
    for (var i = 2; i <= lastRow; i++) {
      var color = (i % 2 === 0) ? '#f5f7fa' : '#ffffff';
      sheetResumen.getRange(i, 1, 1, 7).setBackground(color);
    }
  }
  
  sheetResumen.autoResizeColumns(1, 7);
  
  Logger.log('✅ Resumen Semanal actualizado correctamente');
}

// ============================================
// NUEVA FUNCIÓN: Crear tabla de análisis por semana
// Muestra qué días fueron y cuáles no
// ============================================

function crearTablaAnalisisSemana(ss) {
  var sheetDatos = ss.getSheetByName('Datos Diarios');
  var sheetAnalisis = ss.getSheetByName('Análisis Semanal');
  
  if (!sheetAnalisis) {
    sheetAnalisis = ss.insertSheet('Análisis Semanal');
  }
  
  sheetAnalisis.clear();
  
  if (!sheetDatos || sheetDatos.getLastRow() < 2) {
    Logger.log('❌ No hay datos en "Datos Diarios"');
    return;
  }
  
  var data = sheetDatos.getDataRange().getValues();
  var semanas = {};
  
  // Agrupar por semana
  for (var i = 1; i < data.length; i++) {
    if (!data[i][2]) continue;
    
    var fecha = data[i][0];
    var dia = data[i][1];
    var numeroSemana = data[i][2];
    var anio = new Date(fecha).getFullYear();
    var key = anio + '-S' + numeroSemana;
    var total = parseFloat(data[i][3].toString().replace('$', '')) || 0;
    var porcentajeStr = data[i][6].toString().replace('%', '').trim();
    var porcentaje = parseFloat(porcentajeStr);
    
    if (!semanas[key]) {
      semanas[key] = {
        dias: {}
      };
    }
    
    semanas[key].dias[dia] = {
      total: total,
      porcentaje: porcentaje
    };
  }
  
  // CREAR TABLA DE ANÁLISIS
  var diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Primera fila: Semanas
  var semanasOrdenadas = Object.keys(semanas).sort().reverse();
  var encabezados = ['Día'];
  semanasOrdenadas.forEach(semana => {
    encabezados.push(semana);
  });
  
  sheetAnalisis.appendRow(encabezados);
  
  var headerRange = sheetAnalisis.getRange(1, 1, 1, encabezados.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#667eea');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheetAnalisis.setRowHeight(1, 30);
  
  // Filas de días
  diasOrden.forEach(dia => {
    var fila = [dia];
    semanasOrdenadas.forEach(semana => {
      var datos = semanas[semana].dias[dia];
      if (datos) {
        fila.push('✅ ' + (datos.porcentaje * 100).toFixed(0) + '%');
      } else {
        fila.push('❌');
      }
    });
    sheetAnalisis.appendRow(fila);
  });
  
  // Formatear
  sheetAnalisis.autoResizeColumns(1, encabezados.length);
  
  // Aplicar colores
  var lastRow = sheetAnalisis.getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    for (var j = 2; j <= encabezados.length; j++) {
      var cell = sheetAnalisis.getRange(i, j);
      var value = cell.getValue();
      
      if (value.toString().includes('✅')) {
        cell.setBackground('#e6f7f0');
        cell.setFontColor('#4ECDC4');
      } else if (value.toString().includes('❌')) {
        cell.setBackground('#ffe6e6');
        cell.setFontColor('#FF6B9D');
      }
    }
  }
  
  Logger.log('✅ Tabla de Análisis Semanal creada');
}

function actualizarEstadisticas(ss) {
  var sheetDatos = ss.getSheetByName('Datos Diarios');
  var sheetStats = ss.getSheetByName('Estadísticas');
  
  if (!sheetStats) {
    sheetStats = ss.insertSheet('Estadísticas');
  }
  
  sheetStats.clear();
  
  sheetStats.getRange('A1').setValue('📊 ESTADÍSTICAS - TASK MONEY MAKER');
  sheetStats.getRange('A1').setFontSize(16);
  sheetStats.getRange('A1').setFontWeight('bold');
  sheetStats.getRange('A1:D1').merge();
  sheetStats.getRange('A1').setBackground('#667eea');
  sheetStats.getRange('A1').setFontColor('#ffffff');
  sheetStats.setRowHeight(1, 50);
  
  var data = sheetDatos.getDataRange().getValues();
  
  if (data.length < 2) {
    sheetStats.getRange('A3').setValue('No hay datos todavía');
    return;
  }
  
  var totalDias = data.length - 1;
  var totalGanado = 0;
  var totalTareas = 0;
  var mejorDia = { fecha: null, total: 0 };
  var mayorRacha = 0;
  
  for (var i = 1; i < data.length; i++) {
    var total = parseFloat(data[i][3].toString().replace('$', ''));
    var tareas = data[i][5];
    var rachaStr = data[i][7].toString().replace(' días', '');
    var racha = parseInt(rachaStr);
    
    totalGanado += total;
    totalTareas += tareas;
    
    if (total > mejorDia.total) {
      mejorDia = { fecha: data[i][0], total: total };
    }
    
    if (racha > mayorRacha) {
      mayorRacha = racha;
    }
  }
  
  var promedioDiario = totalGanado / totalDias;
  var promedioTareas = totalTareas / totalDias;
  
  var stats = [
    ['', ''],
    ['📅 Total de Días', totalDias],
    ['💰 Total Ganado', '$' + totalGanado.toFixed(2)],
    ['📊 Promedio Diario', '$' + promedioDiario.toFixed(2)],
    ['✅ Total de Tareas', totalTareas],
    ['🎯 Promedio de Tareas/Día', promedioTareas.toFixed(1)],
    ['🏆 Mejor Día', Utilities.formatDate(new Date(mejorDia.fecha), TIMEZONE, 'dd/MM/yyyy') + ' - $' + mejorDia.total.toFixed(2)],
    ['🔥 Mayor Racha', mayorRacha + ' días'],
    ['', ''],
    ['📈 Proyección Mensual', '$' + (promedioDiario * 30).toFixed(2)],
    ['📈 Proyección Anual', '$' + (promedioDiario * 365).toFixed(2)]
  ];
  
  for (var i = 0; i < stats.length; i++) {
    sheetStats.getRange(i + 3, 1).setValue(stats[i][0]);
    sheetStats.getRange(i + 3, 2).setValue(stats[i][1]);
    
    if (stats[i][0]) {
      sheetStats.getRange(i + 3, 1).setFontWeight('bold');
      sheetStats.getRange(i + 3, 2).setFontWeight('normal');
    }
  }
  
  sheetStats.getRange('A3:B' + (stats.length + 2)).setVerticalAlignment('middle');
  sheetStats.setColumnWidth(1, 250);
  sheetStats.setColumnWidth(2, 200);
  
  for (var i = 3; i <= stats.length + 2; i++) {
    if ((i - 3) % 2 === 0 && stats[i - 3][0]) {
      sheetStats.getRange(i, 1, 1, 2).setBackground('#f5f7fa');
    }
  }
}

function obtenerNumeroSemana(fecha) {
  var inicioAnio = new Date(fecha.getFullYear(), 0, 1);
  var dias = Math.floor((fecha - inicioAnio) / (24 * 60 * 60 * 1000));
  return Math.ceil((dias + inicioAnio.getDay() + 1) / 7);
}

// ✅ CAMBIO 5: ELIMINADA la función obtenerDiaSemana
// La función se elimina completamente porque el día se calcula con la fórmula =TEXT(A2,"dddd")

// ============================================
// FUNCIÓN: Limpiar cache de clientes
// ============================================
function limpiarCacheClientes() {
  clientesCache = null;
  clientesCacheTime = 0;
  SpreadsheetApp.getUi().alert('✅ Cache de clientes limpiado');
  Logger.log('✅ Cache de clientes limpiado');
}

// Función de prueba - para verificar que todo funciona
function pruebaResumenSemanal() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    Logger.log('🧪 INICIANDO PRUEBA DE RESUMEN SEMANAL');
    Logger.log('═══════════════════════════════════════');
    
    // Ejecutar la función mejorada
    actualizarResumenSemanal(ss);
    
    Logger.log('═══════════════════════════════════════');
    Logger.log('✅ PRUEBA COMPLETADA');
    
    // Mostrar resultado
    SpreadsheetApp.getUi().alert('✅ Función ejecutada. Revisa los LOGS (Ctrl+Enter)');
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log(error.stack);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
  }
}
