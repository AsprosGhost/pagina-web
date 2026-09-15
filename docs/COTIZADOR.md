# Cotizador: integración parcial al 15 de septiembre de 2026

## Estado de la página

Se preparan consultas de nómina o domiciliado, con ingreso neto mensual o monto deseado. Los rangos comerciales son $3,000–$750,000 y $3,000–$300,000 respectivamente (cuestionario de Alicia). No son límites universales de los convenios ni aprobación de crédito. Se conserva la cantidad escrita al cambiar de producto y se valida contra el nuevo límite. El resumen puede copiarse, se invalida al cambiar los datos y no se almacena ni envía automáticamente.

No se ofrecen plazos ni pagos calculados al público. La opción de continuar en WhatsApp queda preparada y oculta hasta configurar número oficial y aviso de privacidad. La apertura del enlace tampoco equivale a enviar el mensaje: el visitante debe enviarlo en WhatsApp.

## Fuentes y correspondencia

Archivos en la carpeta de Drive `calculadoras web jubilcredit`, recibidos el 14 de septiembre. Explicación: transcripción de Alicia compartida por David. Los originales no se modifican ni se incluyen en el sitio o repositorio. Las pruebas contienen exclusivamente parámetros y resultados numéricos de ejemplo, no datos de prospectos.

| Archivo | Correspondencia | Evidencia |
| --- | --- | --- |
| CALCULADORA QUINCENAL_GEM_VF.xlsx | Multiva, nómina para trabajadores del Gobierno del Estado de México | Alicia 00:00:35–00:00:54. Confirma vigencia de este archivo. |
| Calculadora_Credito_7882_EXACTO.xlsx | Exitus, estimador interno de domiciliado, no oficial | Alicia 00:01:01–00:01:22 y 00:01:48. |
| Calculadora Bancrea.xlsx | Bancrea, nómina IMSS pensionados y jubilados | Alicia 00:01:22. |
| Calculadora_Pensionados SIPRE_202602 (1).xlsm | Multiva, pensionados y jubilados | Correspondencia inferida de la última calculadora mencionada por Alicia. Instituciones y alcance exacto pendientes. |

La lista de instituciones del domiciliado quedó mal transcrita. No se utiliza para asignar una financiera automáticamente. Multiva y Bancrea siguen excluidas de la oferta pública según instrucciones previas. La recepción de archivos no revoca esa exclusión.

## Revisión técnica y reproducción interna

`internal/calculators.js` no se copia a `dist/` y no es importado por el navegador. Es una reproducción técnica para pruebas, no un motor aprobado para originar créditos. El build ejecuta `tests/calculators.test.js`.

- GEM: `Calculadora!F6:F10`, `K14` y `K17`. Tasa anual 31%, IVA 16%, 24 periodos por año. Se reproducen cuota redondeada, interés e IVA redondeados por separado y último pago ajustado. Ejemplo: $67,000, 96 quincenas, cuota $1,320.64. `F11` es un valor fijo, no una fórmula: no se toma como prueba de actualización automática de toda la hoja. Sugerencias marca 9, 108 y 120 quincenas como no aplicables; se admiten internamente 24–96 en los pasos observados. Hay nombres externos heredados; no se importan.
- Exitus: `Calculadora y Matriz Tasas!B5:B21`. El cálculo usa B11=0.07779542 mensual, no la tasa promocional B6=6.3. Apertura 5%, IVA de apertura 16%, seguro mensual $123.31. Para $30,000 a 36 meses: neto $28,260; mensual $2,625.856711; quincenal $1,308.490253, calculado independientemente con tasa/2 y periodos×2. No se divide simplemente el pago mensual entre dos. Los títulos $7,882.31 y $3,941.16 son textos estáticos incompatibles con el escenario guardado. Las tablas originales continúan hasta 48 meses/96 quincenas y dan saldos negativos al seleccionar 36 meses. La reproducción corregida termina en el plazo seleccionado y capitaliza exactamente el principal; no cambia tasas ni cargos. El tope técnico de 48 meses de esta reproducción representa el tamaño de tabla original, NO una condición comercial aprobada. No se presupone que Exitus ofrezca 60 meses.
- SIPRE: nombre `Monthly_Payment` aplica tasa anual×1.16/12. `Tasas!C14` selecciona por monto y plazo mediante INDEX/MATCH. Se reproduce el ejemplo $600,000 a 60 meses, anual 22.5%, pago $17,999.819576. Esto no valida elegibilidad: el propio ejemplo muestra `Revisa su edad`. `Hoja1!K3` calcula 83×12 meses, mientras J3 dice “83 años 1 meses”. Hay referencias discrepantes de límites de monto en listas y etiquetas. No se convierte ninguna de ellas en regla pública. El archivo descargado conserva `xl/vbaProject.bin` pese a que el conector lo etiqueta xlsx. Las macros no se ejecutaron. Su revisión estática posterior se detalla en la ampliación de este documento. No se exponen los registros históricos de la hoja Base de Datos.
- Bancrea: `Calculadora!E4:E7`, `I4` y nombre LOCAL `Pago_Mensual` usan tasa anual/12. Para $50,000 a 12 meses y 35.2408%: $5,004.152547. `E12` muestra tasa con IVA pero el pago usa E5. Los nombres globales con #REF! no prueban que falle esta fórmula: los nombres locales vigentes prevalecen. Hay fechas fijas de 2014 mezcladas con el calendario; el calendario no se reproduce ni se valida como comercial.

Se comparan resultados JS con valores guardados en los libros y fórmulas inspeccionadas. No se ha realizado recálculo en Excel ni certificación financiera. El CAT no se publica ni se aproxima como si fuera el valor autorizado de cada producto.

## Pendientes concretos

1. Regla por financiera para pasar del ingreso neto a capacidad de pago. Ingreso $7,000 no implica pago disponible de $7,000. El método `capacityFromIncome` rechaza cualquier intento sin esa regla.
2. Confirmación de instituciones, vigencia, montos, plazos, cargos y restricciones por producto; resolver tasa ajustada y títulos de Exitus.
3. Resolver límite de edad y rangos de SIPRE. La revisión estática de macros ya se realizó (ver ampliación); no se ha verificado equivalencia de todo el archivo ejecutándolo en Excel.
4. Decisión comercial explícita si se quisiera usar públicamente alguno de los productos actualmente excluidos.
5. Número oficial, aviso de privacidad y responsable de atención para activar el contacto.

Los 60 meses mencionados por Alicia describen su práctica de estimación cuando procede, no sustituyen los plazos de cada convenio.

## Ampliación de revisión

Se extrajo el VBA de SIPRE sin ejecutarlo. `Módulo1.Traspaso_a_Base_de_Datos` copia A2:M2 de Base de Datos al desplazamiento indicado por N2, pega valores y formato e incrementa el contador. `Módulo2.Borrar_Datos` limpia L5:L14 de la hoja activa. Hoja1, Hoja2, Hoja3 y ThisWorkbook contienen atributos sin procedimientos en el fuente extraído. No se encontró una regla de capacidad de pago en esas macros. Esta inspección no audita el código compilado ni demuestra ejecución segura o equivalencia completa.

Se añadieron 16 fixtures de Sugerencias (GEM filas 6–12 y SIPRE 6–14), con referencias de celda y huellas del archivo, y 205 escenarios sintéticos de reconciliación: 90 SIPRE, 80 Exitus y 35 GEM. No se afirman como recálculos de Excel ni como cobertura comercial de esos montos. Los 12 grupos de pruebas pasan. Se corrigió la aceptación accidental de tasas Bancrea como texto o nulas por conversión implícita.

La herramienta de revisión se ejecuta con `node scripts/review-calculator.mjs --calculator=exitus --principal=30000 --periods=36 --frequency=fortnightly`. Acepta gem, exitus, sipre y bancrea. GEM interpreta periods en quincenas; el resto en meses. Bancrea exige `--annual` explícito. `--schedule` incluye toda la amortización cuando existe. Los resultados incluyen estado de revisión y publicación deshabilitada. No hay interfaz gráfica interna ni asignación automática por institución.

La carpeta internal y las pruebas no se distribuyen en la web. El repositorio sí es público: “interno” describe el uso técnico, no una restricción de acceso. No se suben libros originales, código VBA original ni registros de prospectos.

El formulario incorpora indicación accesible de errores y controles táctiles de al menos 44 px para ajustar/importar cantidades. La función de contacto exige una URL HTTPS bien formada sin credenciales. Estas validaciones no certifican que el número pertenezca a Jubilcredit o que el aviso sea el aprobado; esa confirmación sigue pendiente.

Preguntas y ejemplos para la sesión: [REVISION-ALICIA.md](REVISION-ALICIA.md).
