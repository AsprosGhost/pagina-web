# Operación y publicación

## Identidad

Repositorio: AsprosGhost/pagina-web. Rama existente: master. Demo prevista: jubilcredit-web-demo.vercel.app. No conectar este proyecto al dominio comercial hasta terminar validación. Verificar el equipo y proyecto exactos en Vercel; la conexión del asistente no ha mostrado este proyecto y no confirma sus ajustes.

## Configuración requerida en Vercel

Vincular este repositorio, raíz del repositorio (no site), framework Other, comando `npm run build`, salida `dist`, Node 22. vercel.json versiona construcción y encabezados. Confirmar la rama de producción master si se conserva. Probar primero una rama y su URL de preview. No crear otro proyecto para reemplazar uno que no aparece en una conexión.

## Flujo de cambios

Crear rama desde master, editar, ejecutar npm ci y npm run build, revisar escritorio y móvil y abrir pull request. GitHub Actions ejecuta la comprobación. Revisar la publicación preview de Vercel antes de integrar. Confirmar que corresponde al mismo commit; no editar manualmente archivos publicados.

Activar en GitHub una regla para master que requiera pull request y el check validate si el plan/permisos lo permiten. Esta regla NO se considera activada por incluir el workflow. La publicación de Vercel ejecuta la comprobación dentro del build; no depende de que Actions haya terminado.

## Antes de publicar el sitio comercial

Confirmar número de WhatsApp y probar conversación desde móvil y escritorio; configurar site/config.js. El sitio no captura ni almacena formularios. Obtener y publicar el aviso de privacidad antes de agregar recolección de datos. Validar textos, productos, identidad, fotos autorizadas y contactos. Recibir Excel y validar casos de cotización antes de agregar calculadora. Resolver la página separada de promotores. Mantener fuera Multiva y Modalidad 40.

Retirar noindex de HTML, encabezados y comprobación SOLO en un cambio dedicado al lanzamiento comercial aprobado; mantenerlo en demo/preview. No convertir reglas verbales del 30% en fórmulas sin validar.

## Recuperación

Git conserva cada versión. Preferir revertir el commit problemático mediante una rama y revisión y volver a publicar, en lugar de borrar historial o forzar ramas. En una incidencia inmediata, usar el rollback del proyecto correcto de Vercel a una publicación verificada, después reconciliar Git con esa versión. No restaurar públicamente una versión con contenido comercial retirado.

Conservar copia externa periódica del repositorio mediante git clone --mirror o exportación de GitHub. Revisar acceso de la empresa y recuperación de cuentas; Git no respalda ajustes privados de Vercel. Ningún secreto se guarda en este repositorio. No se ha automatizado un respaldo externo ni configurado protección de rama desde esta sesión.
