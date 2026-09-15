# Comprobación del formulario adaptable

Revisión del 15 de septiembre de 2026 sobre la demo publicada, con un iframe del mismo origen. Se probaron anchos de marco de 320, 390, 768 y 1024 px. Chrome reservó 15 px para el desplazamiento vertical: anchos útiles 305, 375, 753 y 1009 px.

## Correcciones

- En el ancho de 320 px, el contenido intrínseco de la portada ensanchaba el documento hasta 314 px frente a 305 disponibles. Se corrigió la columna del grid con `minmax(0,1fr)` y el mínimo del contenido.
- Se ajustó el espacio y tamaño del campo numérico en pantallas de hasta 360 px para acomodar cantidades largas.
- Se limitaron la firma y la separación de la tarjeta de cobertura en ese tamaño.

## Resultados observados

| Prueba | Resultado |
| --- | --- |
| Anchos 320 / 390 / 768 / 1024 | El ancho desplazable del documento coincide con el disponible: sin desbordamiento horizontal. |
| Domiciliado $300,001 | Rechazado con mensaje del rango. |
| Domiciliado $300,000 | Resumen correcto y copia confirmada. |
| Nómina $750,000 | Resumen correcto. |
| Cambiar nómina a domiciliado | Invalida el resumen anterior y rechaza el monto que excede el nuevo límite. |
| Cambiar a ingreso neto $7,000 | Resumen lo identifica como ingreso, no como préstamo autorizado. |
| Botones más / menos | $7,000 → $7,500 → $7,000 en modo ingreso. |
| Deslizador con Home / End | $3,000 y $300,000 en domiciliado. |
| Activación por teclado | Funcionan modos, revisión y copia mediante Enter. |
| Pruebas automáticas y build | 12 grupos aprobados y compilación correcta. |

La página temporal de revisión se retira de producción al cerrar la prueba. El marco de revisión permanece en el script de build exclusivamente para despliegues preview.

## Alcance

Esto comprueba diseño adaptable e interacción en Chrome de escritorio con anchos reducidos. No es una prueba física en Android/iPhone, teclado táctil, Safari, lector de pantalla ni WhatsApp real. No se enviaron solicitudes. Las cotizaciones y el contacto siguen pendientes de las confirmaciones comerciales ya documentadas.
