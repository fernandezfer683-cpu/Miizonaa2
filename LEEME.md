# Mi Zona — guía paso a paso

## Configuración pendiente antes de usar

Antes de que todo funcione al 100%, completá esto directamente en el código:

1. **`src/App.jsx`**, cerca del principio: reemplazá `OWNER_WHATSAPP = "PEGA_TU_WHATSAPP_ACA"` por tu número real (código de país + área + número, sin espacios ni el signo +). Ejemplo: `"5493865551234"`
2. **`src/App.jsx`**, en las constantes `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET`: pegá los datos de tu cuenta gratuita de Cloudinary (ver más abajo)

## Paso 1: Firebase (base de datos gratis, para los negocios)

1. Andá a console.firebase.google.com
2. Creá un proyecto nuevo
3. Menú izquierdo → Firestore Database → Crear base de datos → Modo de producción
4. Volvé al inicio → ícono `</>` (Web) → registrá una app
5. Copiá la configuración que te muestra y pegala en `src/firebase.js`
6. En Firestore, pestaña "Reglas", pegá esto y **tocá Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Paso 2: Cloudinary (gratis, para las fotos — no pide tarjeta)

Firebase Storage ahora exige una tarjeta de crédito, así que las fotos se suben con Cloudinary en su lugar.

1. Andá a cloudinary.com → creá una cuenta gratis
2. En el Dashboard, copiá el **"Cloud name"**
3. Settings → Upload → Upload presets → "Add upload preset" → Signing Mode: **Unsigned** → Guardar
4. Copiá el nombre del preset
5. Pegá ambos datos en `src/App.jsx`

## Paso 3: Publicar (GitHub + Netlify)

1. Subí todo el contenido de esta carpeta a un repositorio en GitHub (los archivos de `src/` van dentro de una carpeta `src`, el resto en la raíz)
2. En Netlify: "Add new project" → "Import an existing project" → GitHub → elegí el repositorio
3. Confirmá Build command: `npm run build` y Publish directory: `dist` → Deploy

Cada vez que se actualice el código, hay que volver a subirlo a GitHub — Netlify lo reconstruye solo.

## Cómo funciona lo nuevo

- **30 categorías**: ya cargadas, con ícono y color propio cada una.
- **Ordenar por Descuentos**: muestra solo negocios con al menos un descuento vigente hoy.
- **Ordenar por Más cercanos**: pide permiso de ubicación al navegador, calcula la distancia real (fórmula de Haversine) usando la dirección de cada negocio convertida a coordenadas automáticamente (no hay que cargar lat/long a mano). Si el usuario rechaza el permiso, la página sigue funcionando normal con un aviso.
- **Descuentos por dueño**: cada negocio tiene un "Código de dueño" único (se genera solo, y lo ves en el formulario de edición del panel admin). El dueño entra por el botón "Mi negocio" en la página pública, ingresa su código, y solo puede crear/editar/activar/desactivar/eliminar sus propios descuentos — no puede tocar otros negocios ni tiene contraseña compartida con nadie más.
- **"Agregar mi local"**: botón flotante abajo a la derecha en toda la página pública. Abre una ventana con el texto exacto pedido y un botón de WhatsApp con el mensaje ya escrito.

## Importante

- La contraseña del panel de administrador general sigue siendo "padre" — cambiala en `src/App.jsx` antes de usar la página en serio.
- El sistema de "código de dueño" es una autenticación simple (no es un login con usuario/contraseña real), pensada para que cada negocio administre solo sus descuentos sin necesitar contraseñas compartidas. Si más adelante querés algo más robusto (con email y contraseña propia por dueño), se puede agregar Firebase Authentication.

