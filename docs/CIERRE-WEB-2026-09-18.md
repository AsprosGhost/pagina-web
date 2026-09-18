# Ajustes de la junta del 17 de septiembre

Implementación del 18 de septiembre, sobre la demo existente.

- Formulario sin simulación: institución primero; IMSS y Gobierno del Estado de México orientan a nómina y las demás instituciones a revisión de domiciliado. No determina elegibilidad.
- Nombre y WhatsApp obligatorios; monto deseado o capacidad declarada opcionales; asesoría sin cantidad. Al cambiar modalidad se vacía la cantidad y al editar cualquier campo se invalida el resumen.
- Convenios visibles: solo IMSS y Gobierno del Estado de México. Las restantes instituciones siguen en el selector del formulario.
- Hasta $800,000 para nómina, sujeto a evaluación y autorización; domiciliado conserva $300,000.
- Horarios: lunes a viernes 08:00–19:00; sábados 09:00–12:00.
- Se retira «Tu experiencia también cuenta», se incorpora llamada de contacto verde y se conserva el diseño, FAQ y aviso local.
- Se muestra el contacto confirmado 55 8771 1739; se retira el número anterior del contenido público.
- Calculadoras internas sin cambios ni conexión al sitio público.

## Pendientes externos de lanzamiento
Validar aviso de privacidad y habilitar el resumen a WhatsApp; probar recepción con Alicia; fotografías y ubicación vigentes; visto bueno de la versión; dominio y sustitución del sitio anterior. Sin prometer aprobación, plazos de dispersión o tasas.

## Verificación
Compilación y 17 pruebas automáticas aprobadas. Referencias del DOM y separación de convenios/formulario verificadas.

Publicación autorizada por David y completada en la demo. Comprobadas en navegador de escritorio las rutas de monto, capacidad y asesoría; máximo de nómina $800,000; máximo domiciliado $300,000; normalización de +52; invalidación del resumen al editar; descarte de cantidades al cambiar modalidad; horarios y aviso local.

El contacto apunta al número confirmado y abre un saludo general sin datos del formulario. El navegador remoto no dispone de la aplicación WhatsApp: esto no confirma recepción de mensajes. Pendiente prueba con Alicia.

Mejora de teclado: Enter en nombre, teléfono o cantidad prepara el resumen local; no abre WhatsApp ni envía mensajes. Pendientes: revisión visual de anchos móviles y prueba en celular físico. El sitio anterior de Wix no se modifica.
