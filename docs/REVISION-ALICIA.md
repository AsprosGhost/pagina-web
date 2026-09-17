# Cotizador Jubilcredit: revisión con Alicia

Actualización al 17 de septiembre de 2026. La página prepara consultas. Aún no determina cuánto puede recibir un cliente ni envía resúmenes automáticamente. El contacto general abre WhatsApp al 55 8771 1739. Este documento no es una aprobación comercial.

## Avance comprobado

| Trabajo | Resultado |
| --- | --- |
| Reproducción de fórmulas | Cuatro calculadoras disponibles para pruebas técnicas. |
| Comparación con archivos | Coinciden los cuatro ejemplos principales y 16 escenarios adicionales guardados en las hojas Sugerencias de GEM y SIPRE. |
| Comprobaciones adicionales | 205 combinaciones matemáticas de montos y plazos: recuperación del capital, cierre de saldos, intereses, IVA y redondeos según el caso. Son escenarios de prueba, no productos autorizados. |
| Macros de SIPRE | Se extrajeron seis módulos. Dos procedimientos guardan registros y limpian datos; los otros módulos contienen atributos. No se encontró conversión de ingreso a capacidad de pago en el código fuente extraído. |
| Herramienta de revisión | Selección explícita de calculadora, monto, plazo y frecuencia mediante comando. Entrega parámetros y resultados; no asigna financiera a un cliente. |
| Formulario | Rangos por producto, resumen copiable, invalidación al editar, indicación del campo incorrecto y controles táctiles ampliados. |
| Contacto | Enlace de WhatsApp preparado y probado con datos ficticios. No se habilita sin número y URL de privacidad válidos. No hay recepción en CRM ni almacenamiento de solicitudes. |

Las comparaciones usan valores guardados en los archivos. No equivalen a ejecutar nuevos escenarios en Microsoft Excel ni a validar las condiciones vigentes. Las macros no se ejecutaron y su código compilado no se auditó.

## Preguntas necesarias para activar cotizaciones

| Prioridad | Pregunta concreta | Para qué se necesita |
| --- | --- | --- |
| 1 | Capacidad aclarada: se recibe como dato mensual aproximado del cliente y la verifica el asesor. No se necesita una fórmula de ingreso a capacidad para esta ruta. | No confundir ingreso con capacidad disponible. |
| 2 | ¿Qué productos y financieras sí pueden utilizarse en el cotizador público? Mantenemos excluidas Multiva y Bancrea. | Los archivos recibidos incluyen productos excluidos de la web; necesitamos identificar la oferta que sí se puede publicar. |
| 3 | Para cada producto permitido: ¿qué instituciones, perfiles, montos, plazos y edades aplican? ¿La edad se mide al inicio o al finalizar? | Construir la selección correcta sin ampliar convenios por suposición. |
| 4 | En Exitus, ¿son correctos la tasa ajustada de B11, apertura 5%, IVA de apertura y seguro mensual $123.31? ¿El seguro quincenal se cobra $61.655 o se redondea? | La fórmula y los títulos del archivo no coinciden. Confirmar el cargo real y sus redondeos. |
| 5 | ¿Cuáles son los plazos vigentes de Exitus? El archivo tiene tablas de 48 meses, mientras en el audio se mencionan 60 meses como práctica general. | No aplicar 60 meses automáticamente a todos. |
| 6 | ¿El monto escrito por el cliente representa el préstamo antes de comisiones o el dinero neto que quiere recibir? ¿Cómo se descuentan saldos en renovación y compra? | Diferenciar importe financiado, cargos y depósito recibido. |
| 7 | Número confirmado: 55 8771 1739. Confirmar responsable de atención y adecuación del aviso publicado al formulario de crédito. | Completar la recepción y comprobar a dónde llega la consulta. |

Para SIPRE, si se mantiene únicamente para revisión interna: confirmar además si el límite es 83 años o 83 años y un mes, el máximo de monto aplicable y el alcance exacto de instituciones. No hace falta reactivar su publicación para revisar estas reglas.

## Ejemplos para comprobar juntos

Sin nombres, teléfonos, NSS ni estados de cuenta. Las cantidades siguientes son resultados técnicos de los archivos, no ofertas para clientes.

| Archivo | Entrada | Resultado reproducido que hay que contrastar |
| --- | --- | --- |
| GEM | $67,000, 96 quincenas | Pago regular $1,320.64; último pago $1,321.32; total $126,782.12. |
| Exitus | $30,000, 36 meses | Neto $28,260; pago mensual $2,625.856711 antes de definir redondeo de cobro. |
| Exitus | Mismo escenario, cobro quincenal | 72 pagos; $1,308.490253 por quincena antes de redondeo. No es la mitad exacta del mensual. |
| Bancrea | $50,000, 12 meses, tasa anual 35.2408% | Pago $5,004.152547. Confirmar vigencia y cargos. |
| SIPRE | $600,000, 60 meses | Pago $17,999.819576. El ejemplo guardado muestra advertencia de edad, por lo que el resultado no prueba elegibilidad. |

Pedir un caso ficticio completo por cada producto que sí pueda publicarse: perfil, institución, ingreso neto, capacidad disponible, monto bruto, monto neto, plazo, descuento, frecuencia y cargos. Conservar la explicación de cómo se pasa de cada dato al siguiente.

## Cierre pendiente

Después de recibir respuestas: actualizar únicamente reglas confirmadas, comparar los casos ficticios, revisar con Alicia los resultados y probar el contacto de extremo a extremo. Si un producto sigue ambiguo, conservarlo fuera del cotizador público y permitir orientación con asesor.


## Ruta de capacidad implementada

Se reprodujo SIPRE Sugerencias O4, N6:S14 y los rangos M_12 a M_60. La capacidad declarada se trunca a pesos enteros; se selecciona la tasa por el umbral de pago del plazo, se calcula el valor presente, se redondea hacia abajo a centenas, se limita a $700,000 y se vuelve a calcular la tasa y el pago para el monto resultante. Si la capacidad queda debajo del primer umbral, se devuelve sin referencia y sin oferta.

Las nueve filas de la captura de Alicia para capacidad $7,000 coinciden en monto y pago a centavos. Ejemplo: 60 meses, $233,300 y $6,998.93 mensuales. También coinciden las nueve filas guardadas con capacidad $3,000. No se recalculó en Excel ni se ejecutaron macros. Los cuatro archivos recuperados coinciden por SHA-256 con las fuentes de las pruebas previas.

Comando interno: `node scripts/review-calculator.mjs --calculator sipre --capacity 7000 --periods 60`.

Este cálculo no aplica validación de edad ni acredita elegibilidad. El ejemplo de Alicia incluye una advertencia de edad: no debe transformarse en una oferta aprobada. El tope de esta hoja no sustituye el rango general de nómina de la web. Se conserva fuera de los archivos servidos al navegador.

## Aviso recibido

David proporcionó https://www.jubilcredit.com/aviso-de-privacidad. Se enlaza el documento publicado, sin afirmar validación jurídica. Su responsable es Colocación en Acción y sus finalidades descritas son comentarios del portal y publicidad; falta confirmar su correspondencia con los datos y finalidades de la consulta de crédito. La configuración separa el enlace público de la habilitación del resumen. El WhatsApp general sigue funcionando.
