# Revisión adaptable

Prueba en preview con el mismo código público, mediante iframe de ancho controlado. No es una prueba en teléfono físico.

Anchos exteriores: 320, 390, 768 y 1024 px. Anchos útiles observados por barras de desplazamiento: 305, 375, 753 y 1009 px. En los cuatro casos scrollWidth coincide con clientWidth: sin desbordamiento horizontal.

En 320 px: menú abre y cierra al seleccionar Convenios; consulta con Gobierno del Estado de México, teléfono +52 y asesoría sin cantidad genera resumen correcto, sin monto arrastrado ni desbordamiento. Aviso local legible en inspección visual.

Corrección: etiquetas breves en los selectores para evitar recortes. El valor interno y el resumen conservan Gobierno del Estado de México. Se mantienen todas las rutas y condiciones.

Pendiente de validación final en dispositivo físico y recepción con Alicia. La página de revisión solo se genera en previews; no se incorpora a la demo principal.
