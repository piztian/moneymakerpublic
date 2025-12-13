// ============================================
// TASK MONEY MAKER - GOOGLE APPS SCRIPT MASTER
// Sistema Multi-Cliente con Tabla Centralizada
// EnseÃ±andoLuke por Luke Alexander
// ACTUALIZADO: EnvÃ­o automÃ¡tico de emails al registrarse
// ============================================

// CONFIGURACIÃ“N: Spreadsheet ID de la plantilla maestra (donde estÃ¡ la tabla de clientes)
const MASTER_SPREADSHEET_ID = '1VFxMN-HQIQAA-sWBjaPNo8h53fjDqbxd8zLVhh61rXw';
const CLIENTES_SHEET_NAME = 'Clientes';
const TIMEZONE = 'America/Mexico_City'; // Guadalajara, Jalisco

// Cachear clientes para evitar leer la hoja cada vez
let clientesCache = null;
let clientesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ============================================
// FUNCIÃ“N: Crear menÃº en Google Sheets
// ============================================
function onOpen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const menu = ss.addMenu('âš™ï¸ Task Money Maker', [
    { name: 'ðŸ“§ Enviar URLs a Nuevo Cliente', functionName: 'abrirDialogoEnvioEmail' },
    { name: 'ðŸ”„ Limpiar Cache de Clientes', functionName: 'limpiarCacheClientes' },
    { name: 'ðŸ“ Actualizar Todas las FÃ³rmulas', functionName: 'actualizarFormulas' },
    null, // Separador
    { name: 'â“ Ayuda', functionName: 'mostrarAyuda' }
  ]);
}

// ============================================
// TRIGGER AUTOMÃTICO: Notificar al admin cuando se registra cliente
// ============================================
function onFormSubmit(e) {
  try {
    Logger.log('=== NUEVO CLIENTE REGISTRADO ===');
    
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log('âŒ No existe hoja Clientes');
      return;
    }
    
    // Obtener Ãºltima fila (el nuevo cliente registrado)
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(lastRow, 1, 1, 10).getValues()[0];
    
    // Estructura: A=Marca temporal, B=ID Cliente, C=Nombre, D=Sheet ID, E=Email, F=TelÃ©fono
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
      Logger.log('âŒ Falta email o nombre');
      return;
    }
    
    // ENVIAR NOTIFICACIÃ“N AL ADMIN (piztian@gmail.com)
    const adminEmail = 'piztian@gmail.com';
    const asunto = 'ðŸ”” [TAREA] Nuevo cliente registrado: ' + nombre;
    
    const cuerpo = `Â¡Hola Cris! ðŸ‘‹

Un nuevo cliente acaba de registrarse en Task Money Maker:

ðŸ“‹ DATOS DEL CLIENTE:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Nombre: ${nombre}
Email: ${email}
TelÃ©fono: ${telefono}
Marca temporal: ${marca}
ID Cliente: ${idCliente}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ðŸ“ PRÃ“XIMOS PASOS:
1ï¸âƒ£ Copiar plantilla de Google Sheet
2ï¸âƒ£ Renombrar: "TaskMoneyMaker - ${nombre}"
3ï¸âƒ£ Copiar el Sheet ID
4ï¸âƒ£ Pegar en columna D de la pestaÃ±a "Clientes"
5ï¸âƒ£ Ir a âš™ï¸ Task Money Maker â†’ ðŸ“§ Enviar URLs a Nuevo Cliente
6ï¸âƒ£ Seleccionar cliente y enviar email

ðŸ”— Link a pestaÃ±a Clientes:
https://docs.google.com/spreadsheets/d/${MASTER_SPREADSHEET_ID}/edit#gid=0

Â¡A trabajar! ðŸ’ª
    `.trim();
    
    // Enviar email al admin
    MailApp.sendEmail(adminEmail, asunto, cuerpo);
    
    Logger.log('âœ… NotificaciÃ³n enviada a admin: ' + adminEmail);
    Logger.log('=== FIN REGISTRO ===');
    
  } catch (error) {
    Logger.log('âŒ Error en onFormSubmit: ' + error.toString());
    Logger.log(error.stack);
  }
}

// ============================================
// FUNCIÃ“N: DiÃ¡logo para enviar emails
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
      <h2>ðŸ“§ Enviar URLs a Nuevo Cliente</h2>
      
      <div class="info">
        âœ¨ Selecciona un cliente de la tabla "Clientes" y se enviarÃ¡ un email con sus URLs personalizadas.
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
        <button class="btn-enviar" onclick="enviarEmail()">ðŸ“§ Enviar Email</button>
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
          alert('âš ï¸ Por favor completa todos los campos');
          return;
        }
        
        const cliente = JSON.parse(select.value);
        
        document.getElementById('loading').style.display = 'block';
        
        google.script.run.withSuccessHandler(function(resultado) {
          document.getElementById('loading').style.display = 'none';
          if (resultado.success) {
            alert('âœ… Email enviado correctamente a ' + email);
            google.script.host.close();
          } else {
            alert('âŒ Error: ' + resultado.message);
          }
        }).enviarEmailCliente(cliente, email);
      }
    </script>
  `);
  
  SpreadsheetApp.getUi().showModelessDialog(html, 'ðŸ“§ Enviar URLs');
}

// ============================================
// FUNCIÃ“N: Obtener clientes para el diÃ¡logo
// ============================================
function obtenerClientesParaEmail() {
  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const clientes = [];
    
    // Saltar encabezado (fila 0)
    // Estructura: A=Marca temporal, B=ID Cliente, C=Nombre, D=Sheet ID, E=Email, F=TelÃ©fono, G=Dashboard, H=Reportes, I=Config, J=Resumen
    for (let i = 1; i < data.length; i++) {
      if (data[i][1]) { // Si existe ID Cliente (columna B, Ã­ndice 1)
        clientes.push({
          'ID Cliente': data[i][1],      // B
          'Nombre': data[i][2],          // C
          'Sheet ID': data[i][3],        // D
          'Email': data[i][4],           // E
          'TelÃ©fono': data[i][5],        // F
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
// FUNCIÃ“N: Enviar email con URLs
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
    
    const asunto = 'ðŸŽ‰ Â¡Tu acceso a Task Money Maker estÃ¡ listo!';
    
    const cuerpo = `Â¡Hola ${nombreCliente}! ðŸ‘‹

Tu acceso a Task Money Maker ya estÃ¡ configurado y listo para usar. ðŸš€

ðŸ“Š ACCESO RÃPIDO:

1ï¸âƒ£ Dashboard (Marca tus tareas diarias):
${dashboard}

2ï¸âƒ£ ConfiguraciÃ³n (Personaliza tus tareas):
${config}

3ï¸âƒ£ Reportes (Ve tu progreso):
${reportes}

4ï¸âƒ£ Resumen Semanal (AnalÃ­tica semanal):
${resumen}

---

ðŸ’¡ TIPS PARA EMPEZAR:
âœ… Marca las tareas que completes cada dÃ­a
âœ… Configura las tareas segÃºn tus necesidades
âœ… Revisa tus reportes para ver tu progreso
âœ… MantÃ©n una racha constante ðŸ”¥

---

Â¿Dudas o necesitas ayuda? 
ðŸ“ž Contacta con nuestro equipo

Â¡A disfrutar! ðŸ’°

---
Task Money Maker
EnseÃ±andoLuke por Luke Alexander
    `.trim();
    
    MailApp.sendEmail(emailDestino, asunto, cuerpo);
    
    Logger.log('âœ… Email enviado a ' + emailDestino);
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
// FUNCIÃ“N: Actualizar fÃ³rmulas
// ============================================
function actualizarFormulas() {
  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('âŒ No existe la hoja "Clientes"');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Actualizar fÃ³rmulas para cada cliente
    for (let i = 1; i < data.length; i++) {
      const idCliente = data[i][0];
      
      if (idCliente) {
        // Dashboard
        sheet.getRange(i + 1, 6).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/dashboardmoneytareas/?cliente=",A${i + 1}))`);
        
        // Reportes
        sheet.getRange(i + 1, 7).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/reportes/?cliente=",A${i + 1}))`);
        
        // Config
        sheet.getRange(i + 1, 8).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/config/?cliente=",A${i + 1}))`);
        
        // Resumen
        sheet.getRange(i + 1, 9).setFormula(`=IF(A${i + 1}="","",CONCATENATE("https://capinimx.bitrix24.site/ensenandoluke/resumensemanal/?cliente=",A${i + 1}))`);
      }
    }
    
    SpreadsheetApp.getUi().alert('âœ… FÃ³rmulas actualizadas correctamente');
    Logger.log('âœ… FÃ³rmulas actualizadas');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('âŒ Error: ' + error.toString());
  }
}

// ============================================
// FUNCIÃ“N: Mostrar Ayuda
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
      <h2>â“ Ayuda - Task Money Maker</h2>
      
      <div class="section">
        <h3>ðŸ“§ Enviar URLs a Nuevo Cliente</h3>
        <p>Selecciona un cliente de la tabla "Clientes" y automÃ¡ticamente se enviarÃ¡ un email con sus URLs personalizadas.</p>
        <p><strong>Â¿CuÃ¡ndo usarlo?</strong> DespuÃ©s de que el cliente se registre en el formulario.</p>
      </div>
      
      <div class="section">
        <h3>ðŸ”„ Limpiar Cache de Clientes</h3>
        <p>Limpia el cache interno para que se recarguen todos los clientes. Ãštil si acabas de agregar nuevos clientes.</p>
        <p><strong>Â¿CuÃ¡ndo usarlo?</strong> Si los nuevos clientes no aparecen inmediatamente.</p>
      </div>
      
      <div class="section">
        <h3>ðŸ“ Actualizar Todas las FÃ³rmulas</h3>
        <p>Regenera todas las fÃ³rmulas de URLs en la tabla "Clientes".</p>
        <p><strong>Â¿CuÃ¡ndo usarlo?</strong> Si las URLs no se generan correctamente.</p>
      </div>
      
      <div class="section">
        <h3>ðŸ“‹ Estructura de la Tabla "Clientes"</h3>
        <p>Las columnas deben ser:</p>
        <code>ID Cliente | Nombre | Sheet ID | Email | TelÃ©fono | Dashboard | Reportes | Config | Resumen</code>
      </div>
      
      <div class="section">
        <h3>âœ… Checklist para Nuevo Cliente</h3>
        <p>1. Cliente llena el formulario de Google</p>
        <p>2. Se registra automÃ¡ticamente en la tabla "Clientes"</p>
        <p>3. Las fÃ³rmulas generan los URLs automÃ¡ticamente</p>
        <p>4. El email se envÃ­a AUTOMÃTICAMENTE âœ¨</p>
        <p>5. Â¡Listo! El cliente puede usar</p>
      </div>
    </div>
  `);
  
  SpreadsheetApp.getUi().showModelessDialog(html, 'â“ Ayuda');
}

// ============================================
// FUNCIÃ“N: Cargar clientes desde tabla centralizada
// ============================================
function cargarClientes() {
  const ahora = Date.now();
  
  // Si el cache estÃ¡ fresco, usarlo
  if (clientesCache && (ahora - clientesCacheTime) < CACHE_DURATION) {
    Logger.log('âœ… Usando cache de clientes');
    return clientesCache;
  }
  
  Logger.log('ðŸ“¥ Leyendo tabla de clientes...');
  
  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CLIENTES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log('âŒ No existe hoja "Clientes"');
      return {};
    }
    
    const data = sheet.getDataRange().getValues();
    const clientes = {};
    
    // Estructura: A=Marca temporal, B=ID Cliente, C=Nombre, D=Sheet ID, E=Email, F=TelÃ©fono
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
        Logger.log('âœ… Cliente cargado: ' + id);
      }
    }
    
    // Guardar en cache
    clientesCache = clientes;
    clientesCacheTime = ahora;
    
    Logger.log('âœ… Total de clientes cargados: ' + Object.keys(clientes).length);
    return clientes;
    
  } catch (error) {
    Logger.log('âŒ Error cargando clientes: ' + error.toString());
    return {};
  }
}

// ============================================
// FUNCIÃ“N PRINCIPAL - Recibe datos del dashboard
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
    // GUARDAR CONFIGURACIÃ“N DE TAREAS
    // ============================================
    if (data.tipo === 'CONFIGURACION_TAREAS') {
      Logger.log('â†’ Guardando configuraciÃ³n de tareas');
      let configSheet = ss.getSheetByName('ConfiguracionTareas');
      
      if (!configSheet) {
        configSheet = ss.insertSheet('ConfiguracionTareas');
        configSheet.appendRow(['Cliente', 'Fecha', 'ConfiguraciÃ³n']);
        var headerRange = configSheet.getRange(1, 1, 1, 3);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#667eea');
        headerRange.setFontColor('#ffffff');
      }
      
      // Buscar si ya existe configuraciÃ³n para este cliente
      var ultimaFila = configSheet.getLastRow();
      var filaActualizacion = -1;
      
      for (var i = 2; i <= ultimaFila; i++) {
        if (configSheet.getRange(i, 1).getValue() === clienteId) {
          filaActualizacion = i;
        }
      }
      
      if (filaActualizacion > 0) {
        // Actualizar configuraciÃ³n existente
        configSheet.getRange(filaActualizacion, 2).setValue(data.fecha);
        configSheet.getRange(filaActualizacion, 3).setValue(data.configuracion);
        Logger.log('âœ… ConfiguraciÃ³n actualizada en fila ' + filaActualizacion);
      } else {
        // Agregar nueva configuraciÃ³n
        configSheet.appendRow([clienteId, data.fecha, data.configuracion]);
        Logger.log('âœ… Nueva configuraciÃ³n agregada');
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'ConfiguraciÃ³n guardada correctamente',
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
    const totalTareasPosibles = 7;
    const porcentajeCumplimiento = (numTareasCompletadas / totalTareasPosibles) * 100;
    const semanaDelAnio = obtenerNumeroSemana(new Date(data.fecha));
    const diaSemana = obtenerDiaSemana(new Date(data.fecha));
    
    // Calcular racha
    const racha = calcularRacha(sheetDatos, data.fecha);
    
    Logger.log('Datos calculados:');
    Logger.log('  Tareas: ' + numTareasCompletadas + '/' + totalTareasPosibles);
    Logger.log('  %: ' + porcentajeCumplimiento.toFixed(1));
    Logger.log('  Racha: ' + racha);
    
    // Verificar si ya existe un registro para esta fecha
    const filaExistente = buscarFila(sheetDatos, data.fecha);
    
    Logger.log('Fila existente: ' + filaExistente);
    
    var datosParaGuardar = {
      fecha: data.fecha,
      diaSemana: diaSemana,
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
      Logger.log('â†’ ACTUALIZANDO fila ' + filaExistente);
      actualizarFila(sheetDatos, filaExistente, datosParaGuardar);
    } else {
      // CREAR nueva fila
      Logger.log('â†’ CREANDO nueva fila');
      agregarNuevaFila(sheetDatos, datosParaGuardar);
    }
    
    // Formatear y ajustar columnas
    formatearHoja(sheetDatos);
    
    // Actualizar resumen automÃ¡ticamente
    actualizarResumenSemanal(ss);
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
// FUNCIÃ“N GET - Lee datos para reportes
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
    const sheetStats = ss.getSheetByName('EstadÃ­sticas');
    const sheetConfig = ss.getSheetByName('ConfiguracionTareas');
    
    // Buscar configuraciÃ³n del cliente
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
    'Fecha', 'DÃ­a', 'Semana', 'Total Ganado', 'Tareas Completadas',
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
      continue; // Saltar si no es fecha vÃ¡lida
    }
    
    Logger.log('Fila ' + i + ': ' + fechaEnFila);
    
    // Comparar strings
    if (fechaEnFila === fechaBusqueda) {
      Logger.log('âœ… Encontrada en fila ' + i);
      return i;
    }
  }
  
  Logger.log('âŒ No encontrada, crear nueva');
  return -1;
}

function actualizarFila(sheet, fila, datos) {
  sheet.getRange(fila, 1).setValue(datos.fecha);
  sheet.getRange(fila, 2).setValue(datos.diaSemana);
  sheet.getRange(fila, 3).setValue(datos.semana);
  sheet.getRange(fila, 4).setValue('$' + datos.totalGanado.toFixed(2));
  sheet.getRange(fila, 5).setValue(datos.tareasCompletadas);
  sheet.getRange(fila, 6).setValue(datos.numTareas);
  sheet.getRange(fila, 7).setValue(datos.porcentaje.toFixed(1) + '%');
  sheet.getRange(fila, 8).setValue(datos.racha + ' dÃ­as');
  sheet.getRange(fila, 9).setValue(datos.detalles);
}

function agregarNuevaFila(sheet, datos) {
  sheet.appendRow([
    datos.fecha,
    datos.diaSemana,
    datos.semana,
    '$' + datos.totalGanado.toFixed(2),
    datos.tareasCompletadas,
    datos.numTareas,
    datos.porcentaje.toFixed(1) + '%',
    datos.racha + ' dÃ­as',
    datos.detalles
  ]);
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

function actualizarResumenSemanal(ss) {
  var sheetDatos = ss.getSheetByName('Datos Diarios');
  var sheetResumen = ss.getSheetByName('Resumen Semanal');
  
  if (!sheetResumen) {
    sheetResumen = ss.insertSheet('Resumen Semanal');
  }
  
  sheetResumen.clear();
  
  var encabezados = ['AÃ±o-Semana', 'Total Ganado', 'DÃ­as Activos', 'Promedio Diario', 'Tareas Totales', '% Promedio', 'Mejor DÃ­a'];
  sheetResumen.appendRow(encabezados);
  
  var headerRange = sheetResumen.getRange(1, 1, 1, encabezados.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#764ba2');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheetResumen.setRowHeight(1, 40);
  sheetResumen.setFrozenRows(1);
  
  var data = sheetDatos.getDataRange().getValues();
  var semanas = {};
  
  for (var i = 1; i < data.length; i++) {
    var fecha = new Date(data[i][0]);
    var anio = fecha.getFullYear();
    var semana = data[i][2];
    var key = anio + '-S' + semana;
    var total = parseFloat(data[i][3].toString().replace('$', ''));
    var numTareas = data[i][5];
    // Leer porcentaje: si viene como "80.5%" convertir a 0.805
    var porcentajeStr = data[i][6].toString().replace('%', '').trim();
    var porcentaje = parseFloat(porcentajeStr) / 100; // Convertir a decimal: 80.5 -> 0.805
    
    if (!semanas[key]) {
      semanas[key] = {
        total: 0,
        dias: 0,
        tareas: 0,
        porcentajes: [],
        mejorDia: { fecha: fecha, total: total }
      };
    }
    
    semanas[key].total += total;
    semanas[key].dias++;
    semanas[key].tareas += numTareas;
    semanas[key].porcentajes.push(porcentaje);
    
    if (total > semanas[key].mejorDia.total) {
      semanas[key].mejorDia = { fecha: fecha, total: total };
    }
  }
  
  var semanasOrdenadas = Object.keys(semanas).sort().reverse();
  
  for (var j = 0; j < semanasOrdenadas.length; j++) {
    var key = semanasOrdenadas[j];
    var s = semanas[key];
    var promedioDiario = s.total / s.dias;
    var promedioPorcentaje = s.porcentajes.reduce((a, b) => a + b, 0) / s.porcentajes.length;
    var mejorDia = Utilities.formatDate(s.mejorDia.fecha, TIMEZONE, 'dd/MM');
    
    // Guardar porcentaje como decimal (0.805) en lugar de porcentaje (80.5%)
    // Así el frontend puede controlarlo correctamente
    sheetResumen.appendRow([
      key,
      '$' + s.total.toFixed(2),
      s.dias,
      '$' + promedioDiario.toFixed(2),
      s.tareas,
      (promedioPorcentaje * 100), // Convertir a decimal: 80.5 -> 0.805
      mejorDia + ' ($' + s.mejorDia.total.toFixed(2) + ')'
    ]);
  }
  
  var lastRow = sheetResumen.getLastRow();
  if (lastRow > 1) {
    for (var i = 2; i <= lastRow; i++) {
      var color = (i % 2 === 0) ? '#f5f7fa' : '#ffffff';
      sheetResumen.getRange(i, 1, 1, 7).setBackground(color);
    }
  }
  
  sheetResumen.autoResizeColumns(1, 7);
}

function actualizarEstadisticas(ss) {
  var sheetDatos = ss.getSheetByName('Datos Diarios');
  var sheetStats = ss.getSheetByName('EstadÃ­sticas');
  
  if (!sheetStats) {
    sheetStats = ss.insertSheet('EstadÃ­sticas');
  }
  
  sheetStats.clear();
  
  sheetStats.getRange('A1').setValue('ðŸ“Š ESTADÃSTICAS - TASK MONEY MAKER');
  sheetStats.getRange('A1').setFontSize(16);
  sheetStats.getRange('A1').setFontWeight('bold');
  sheetStats.getRange('A1:D1').merge();
  sheetStats.getRange('A1').setBackground('#667eea');
  sheetStats.getRange('A1').setFontColor('#ffffff');
  sheetStats.setRowHeight(1, 50);
  
  var data = sheetDatos.getDataRange().getValues();
  
  if (data.length < 2) {
    sheetStats.getRange('A3').setValue('No hay datos todavÃ­a');
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
    var rachaStr = data[i][7].toString().replace(' dÃ­as', '');
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
    ['ðŸ“… Total de DÃ­as', totalDias],
    ['ðŸ’° Total Ganado', '$' + totalGanado.toFixed(2)],
    ['ðŸ“Š Promedio Diario', '$' + promedioDiario.toFixed(2)],
    ['âœ… Total de Tareas', totalTareas],
    ['ðŸŽ¯ Promedio de Tareas/DÃ­a', promedioTareas.toFixed(1)],
    ['ðŸ† Mejor DÃ­a', Utilities.formatDate(new Date(mejorDia.fecha), TIMEZONE, 'dd/MM/yyyy') + ' - $' + mejorDia.total.toFixed(2)],
    ['ðŸ”¥ Mayor Racha', mayorRacha + ' dÃ­as'],
    ['', ''],
    ['ðŸ“ˆ ProyecciÃ³n Mensual', '$' + (promedioDiario * 30).toFixed(2)],
    ['ðŸ“ˆ ProyecciÃ³n Anual', '$' + (promedioDiario * 365).toFixed(2)]
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

function obtenerDiaSemana(fecha) {
  var dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var dayNumber = parseInt(Utilities.formatDate(fecha, TIMEZONE, 'u'));
  return dias[dayNumber + 1 % 7];  // 👈 Sin restar -1, directamente con el +1 implícito
}

// ============================================
// FUNCIÃ“N: Limpiar cache de clientes
// ============================================
function limpiarCacheClientes() {
  clientesCache = null;
  clientesCacheTime = 0;
  SpreadsheetApp.getUi().alert('âœ… Cache de clientes limpiado');
  Logger.log('âœ… Cache de clientes limpiado');
}
