# 🛡️ Portfolio de Adrián · Ciberseguridad

Web portfolio con dos modos:

- **Web clásica** (`index.html`): sobre mí, proyectos con filtro, skills, formación y contacto.
- **Oficina SOC** (`juego.html`): videojuego 2D donde el visitante crea su avatar y mi avatar le presenta el CV con bocadillos (y voz opcional). Incluye una terminal interactiva con comandos secretos.

Hecho a mano con HTML, CSS y JavaScript. Sin frameworks ni dependencias.

## 📁 Estructura

```
index.html        → web clásica
juego.html        → oficina virtual
assets/
  data.js         → ⭐ TODO tu contenido (lo único que tienes que editar)
  avatar.js       → dibujo de avatares (retrato y sprite)
  ui.js           → bloques compartidos (tarjetas, skills, contacto…)
  web.js          → lógica de la web clásica
  juego.js        → motor del juego, tour, terminal
  style.css       → estilos
  cv.pdf          → (súbelo tú) tu CV en PDF
.nojekyll         → para que GitHub Pages sirva los archivos tal cual
```

## ✏️ Cómo personalizarlo

1. Abre `assets/data.js` y busca `✏️`: ahí está lo que falta por rellenar.
2. Sube tu CV como `assets/cv.pdf`.
3. Para diseñar **tu** avatar de guía: entra en la oficina, pulsa **🎨 Avatar**, diséñalo, pulsa **📋 Copiar código** y pégalo en `avatarGuia` dentro de `data.js`.

Mientras haya `✏️` en el texto, la web lo resalta en amarillo para que no se te escape ninguno.

## 🚀 Publicarlo en GitHub Pages

1. Crea un repositorio en GitHub. Si lo llamas `TU_USUARIO.github.io`, la web quedará en `https://TU_USUARIO.github.io`.
2. Sube todos los archivos (botón **Add file → Upload files**, arrastra la carpeta entera).
3. Ve a **Settings → Pages**, en *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarda.
4. En uno o dos minutos la web estará online.

Con git desde terminal:

```bash
git init
git add .
git commit -m "Portfolio inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_USUARIO.github.io.git
git push -u origin main
```

## 🎮 Controles de la oficina

| Acción | Teclado | Móvil |
|---|---|---|
| Moverse | Flechas o WASD | Cruceta o tocar el suelo |
| Interactuar | E | Botón E |
| Avanzar el tour | Enter o botón *Siguiente* | Botón *Siguiente* |
| Cerrar ventanas | Esc | ✕ |

Comandos de la terminal: `help`, `whoami`, `ls`, `cat caldesberry`, `proyectos`, `skills`, `contacto`, `nmap adrian`, `sudo contratar`…
