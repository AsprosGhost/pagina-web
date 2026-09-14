# Jubilcredit web

Fuente del sitio de demostración de Jubilcredit. Proyecto estático sin dependencias de terceros de JavaScript ni servidor de datos. El repositorio es la fuente de verdad; Vercel publica su resultado.

## Uso

Node.js 22 o posterior y npm. Ejecutar `npm ci`, `npm run build` y `npm start`. Abrir http://127.0.0.1:4173. `npm run check` valida recursos, enlaces internos, JavaScript y restricciones de contenido.

- `site/`: únicos archivos destinados a publicación.
- `scripts/`: comprobación, construcción y servidor local.
- `docs/`: decisiones y procedimiento de entrega; no se publican.
- `dist/`: generado por build; no se versiona.
- `site/config.js`: configuración pública de contacto, sin secretos.

## Estado

Vista previa, no sitio comercial terminado. No recopila datos ni finge registrar solicitudes. WhatsApp permanece inactivo hasta confirmar el número oficial. No calcula cotizaciones: falta Excel autorizado. Fotografías y testimonios pendientes de materiales aprobados; se han retirado los provisionales. No se modificó jubilcredit.com ni se conectó el CRM.

El commit de recuperación conserva la demo anterior con sus recursos publicados. Es una copia del contenido público, no de configuraciones privadas. El logotipo recuperado está embebido localmente en logo.js. El diseño actual no depende de imágenes alojadas en Wix.

Consultar `docs/OPERACION.md` antes de publicar. Los controles automatizados ayudan a detectar errores; no sustituyen revisión visual ni aprobación comercial.
