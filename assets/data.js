/* ==================================================================
   📝 TODO TU CONTENIDO ESTÁ EN ESTE ARCHIVO
   La web clásica, la oficina virtual, la terminal y el tour guiado
   leen de aquí. Cambias algo aquí y se actualiza en todas partes.
   Si escribes "✏️" delante de un texto, la web lo marca en amarillo
   como pendiente.
   ================================================================== */
window.PORTFOLIO = {
  nombre: "Adrián",
  nombreCompleto: "Adrián Calderón Garrido",
  rol: "Ciberseguridad · Redes · Automatización",
  ubicacion: "Madrid, España",
  estado: "Abierto a prácticas y primer empleo en ciberseguridad",
  claim: "Monto, fortifico y ataco (en laboratorio) mis propios sistemas. Ahora quiero hacerlo dentro de un equipo de seguridad.",

  sobreMi: [
    "Estoy en el último año de Cyber Security & Digital Intelligence en MSMK University (con el Pearson Higher National Diploma in Computing en Cyber Security) y, a la vez, cursando el Máster Evolve en Ciberseguridad e Inteligencia Artificial. Lo que más me engancha es entender cómo funciona un sistema por dentro para poder defenderlo… o romperlo en un laboratorio.",
    "Vengo del mundo creativo: estudié Animación 3D, juegos y entornos interactivos, y trabajé en Antena 3 creando grafismo 3D para programas en directo. De ahí me viene trabajar bajo presión y cuidar cada detalle (y también esta oficina virtual).",
    "Fuera de clase tengo dos laboratorios propios: un servidor en una Raspberry Pi 5 que administro y fortifico yo mismo, y una red de máquinas virtuales con pfSense, Active Directory y Kali para practicar ataque y defensa. Además entreno en Hack The Box, TryHackMe y DockerLabs, y me interesan mucho la automatización y la IA."
  ],
  datos: [
    { k: "Ubicación", v: "Madrid" },
    { k: "Idiomas", v: "Castellano nativo · Inglés B2" },
    { k: "Estudios", v: "Último año de carrera + Máster en Ciberseguridad e IA" }
  ],
  softSkills: ["Liderazgo", "Autonomía", "Resiliencia", "Proactividad", "Adaptabilidad", "Comunicación efectiva"],

  /* Cifras que salen debajo del saludo de la web */
  destacados: [
    { n: "0", t: "puertos abiertos a Internet en mi servidor: acceso remoto solo por Tailscale" },
    { n: "5", t: "máquinas virtuales en mi laboratorio de ataque y defensa" },
    { n: "3", t: "plataformas de práctica: Hack The Box, TryHackMe y DockerLabs" },
    { n: "2", t: "formaciones a la vez: último año de carrera y Máster en Ciberseguridad e IA" }
  ],

  contacto: {
    email: "adriancalderongarrido@gmail.com",
    github: "https://github.com/Cld3r0n",
    linkedin: "https://www.linkedin.com/in/adriancalderon-cyber"
  },
  cvPdf: "assets/cv.pdf",

  /* zona = dónde aparece en la oficina:
       servidores | puesto | automatizacion | formacion
     estado = En producción | Publicado | Entregado | En curso | En desarrollo | En diseño
     roadmap = [texto, hecho] → se pinta como checklist */
  proyectos: [
    {
      id: "caldesberry",
      titulo: "CaldesBerry · Servidor doméstico fortificado",
      zona: "servidores",
      categoria: "Sistemas",
      estado: "En producción",
      resumen: "Proyecto personal: una Raspberry Pi 5 (8 GB) con disco de 1 TB que hace de servidor de casa, con servicios en Docker y bastionada paso a paso sin exponer nada a Internet.",
      puntos: [
        "Servicios en contenedores con Docker Compose: DNS con Pi-hole, proxy inverso con Nginx Proxy Manager, panel Homarr, gestión con Portainer y un servidor de Minecraft con mods en Crafty Controller.",
        "Acceso remoto sin abrir puertos en el router: todo pasa por Tailscale (VPN mesh).",
        "Bastionado del sistema: firewall UFW con SSH solo desde la red local y Tailscale, Fail2ban contra fuerza bruta, login de root por SSH bloqueado y parches automáticos con unattended-upgrades.",
        "Red de casa segmentada con un router propio, y reglas de firewall para que solo mis equipos lleguen a los paneles de administración.",
        "Diagnóstico de problemas reales: permisos entre contenedores, rutas de volúmenes, conectividad por la VPN y reglas de firewall que chocaban con Docker."
      ],
      roadmap: [
        ["Tailscale, UFW, Fail2ban y parches automáticos", true],
        ["Bloquear root por SSH y migrar Portainer a Compose", true],
        ["Tailscale como exit node para navegar cifrado fuera de casa", true],
        ["DNS locales con Pi-hole y HTTPS con Nginx Proxy Manager (candado verde)", true],
        ["Aislar contenedores en redes Docker separadas", true],
        ["Proxy delante de docker.sock para limitar el acceso a Docker", true],
        ["Escaneos propios con Nmap y OpenVAS", false],
        ["Monitorización con Uptime Kuma y Netdata, con avisos por Telegram", false],
        ["Copias de seguridad cifradas con Kopia o Duplicati", false]
      ],
      tech: ["Raspberry Pi 5", "Debian", "Docker Compose", "UFW", "Fail2ban", "Tailscale", "Pi-hole", "Nginx Proxy Manager"],
      enlaces: []
    },
    {
      id: "lab-ad",
      titulo: "Laboratorio virtual de ataque y defensa",
      zona: "puesto",
      categoria: "Ofensiva",
      estado: "En curso",
      resumen: "Red de máquinas virtuales que imita una pequeña empresa, para atacarla desde fuera y aprender a defenderla.",
      puntos: [
        "pfSense como firewall y router del perímetro de la red del laboratorio.",
        "Dominio de Active Directory sobre Windows Server, con un cliente Windows 11 y otro Ubuntu como máquinas objetivo.",
        "Kali Linux fuera de la red como equipo atacante, para practicar el camino completo: desde el exterior hasta el dominio.",
        "También lo uso para montar máquinas vulnerables por mi cuenta y repetir lo aprendido en las plataformas."
      ],
      tech: ["pfSense", "Windows Server", "Active Directory", "Windows 11", "Ubuntu", "Kali Linux"],
      enlaces: []
    },
    {
      id: "htb",
      titulo: "Hacking ético en plataformas",
      zona: "puesto",
      categoria: "Ofensiva",
      estado: "En curso",
      resumen: "Entreno con máquinas de Hack The Box (ahora mismo, Starting Point), TryHackMe y DockerLabs, con Kali Linux en WSL conectado por OpenVPN.",
      puntos: [
        "Metodología: reconocimiento, enumeración, explotación y escalada de privilegios.",
        "Herramientas: Nmap, Burp Suite, Wireshark, Hydra y Netcat.",
        "En la universidad también montamos páginas vulnerables para practicar la explotación de fallos web."
      ],
      tech: ["Kali Linux", "Nmap", "Burp Suite", "Wireshark", "Hydra", "Netcat", "OpenVPN"],
      enlaces: []
    },
    {
      id: "red-softet",
      titulo: "Diseño de red segura para una nueva sede",
      zona: "formacion",
      categoria: "Universidad",
      estado: "Entregado",
      resumen: "Trabajo de Network Security (HND, unidad 29): informe técnico para abrir una sucursal de 40 empleados de una empresa de software en Barcelona, conectada con la sede de Madrid.",
      puntos: [
        "Análisis de riesgos legales (RGPD), operativos y reputacionales de una red mal protegida.",
        "Comparativa de IPsec y SSL/TLS: túnel IPsec de sede a sede y VPN SSL para el teletrabajo.",
        "Defensa en profundidad con firewall de nueva generación, IDS/IPS y proxy, con sus ventajas e inconvenientes.",
        "Topología jerárquica con VLANs por departamento, DMZ para el servidor web, ACLs y plan de direccionamiento IP.",
        "Bastionado de switches y routers (SSH v2, Port Security, puertos apagados) y WiFi con WPA3-Enterprise, 802.1X y RADIUS."
      ],
      tech: ["Diseño de redes", "VLANs", "DMZ", "IPsec", "VPN SSL", "802.1X / RADIUS", "Cisco"],
      enlaces: []
    },
    {
      id: "sgsi-neobanco",
      titulo: "Análisis y tratamiento de riesgos de un neobanco",
      zona: "formacion",
      categoria: "Universidad",
      estado: "Entregado",
      resumen: "Trabajo de Information Security Management (HND, unidad 32): análisis de riesgos de un banco 100 % digital en la nube, siguiendo Magerit e ISO 27002.",
      puntos: [
        "Inventario de activos y clasificación de la información en cuatro niveles (de pública a estrictamente confidencial).",
        "Amenazas y vulnerabilidades: ransomware, DDoS, phishing y credential stuffing.",
        "Matriz de riesgo 5×5 y priorización según el umbral de tolerancia del banco.",
        "Decisiones de tratamiento (mitigar, transferir, aceptar y evitar) y plan de tratamiento con controles de ISO/IEC 27002:2022.",
        "Marco normativo: RGPD y PCI DSS."
      ],
      tech: ["ISO 27001", "ISO 27002", "Magerit", "RGPD", "PCI DSS", "Gestión de riesgos"],
      enlaces: []
    },
    {
      id: "bot",
      titulo: "Bot de Telegram para automatizar solicitudes web",
      zona: "automatizacion",
      categoria: "Automatización",
      estado: "En desarrollo",
      resumen: "Bot en Python que programa una solicitud en un portal web y la envía al segundo exacto, desde un contenedor aislado en mi Raspberry.",
      puntos: [
        "Tareas programadas con APScheduler y navegador sin interfaz con Playwright (Chromium).",
        "Desplegado en Docker sin puertos de entrada: se comunica con Telegram por long polling.",
        "Red Docker aislada y resolución DNS a través de Pi-hole.",
        "Al terminar, envía la confirmación por Telegram con una captura de pantalla."
      ],
      tech: ["Python", "python-telegram-bot", "APScheduler", "Playwright", "Docker"],
      enlaces: []
    },
    {
      id: "jarvis",
      titulo: "Jarvis · Asistente con IA para administrar el servidor",
      zona: "automatizacion",
      categoria: "Automatización",
      estado: "En diseño",
      resumen: "Asistente en Telegram que vigila y mantiene mi servidor 24/7, diseñado con mínimo privilegio desde el principio.",
      puntos: [
        "Un chat para hablar con él (también por notas de voz) y un canal aparte de solo lectura para logs y alertas.",
        "Modo «en uso»: si hay gente conectada, por ejemplo jugando en el servidor de Minecraft, nunca reinicia ni ralentiza ese servicio.",
        "Modo conversación: ante decisiones importantes me pregunta con contexto y opciones antes de actuar.",
        "Modo silencioso: resuelve solo el mantenimiento ligero y lo deja anotado sin hacer spam.",
        "Sin sudo global: solo diagnóstico y reinicios acotados de contenedores."
      ],
      tech: ["Python", "API de Claude", "Telegram", "Docker"],
      enlaces: []
    },
    {
      id: "ia-azure",
      titulo: "Bot con IA en Azure",
      zona: "automatizacion",
      categoria: "Automatización",
      estado: "Entregado",
      resumen: "Proyecto de la universidad: un pequeño bot con un modelo de lenguaje en la nube de Azure, para entender qué hay detrás de las IAs que usamos a diario.",
      puntos: [
        "Fundamentos de machine learning y de modelos de lenguaje (LLM).",
        "Despliegue en Azure y gestión del consumo de tokens.",
        "Usado después en trabajos y entregas de clase."
      ],
      tech: ["Azure", "IA / LLM", "Machine learning"],
      enlaces: []
    },
    {
      id: "portfolio",
      titulo: "Este portfolio y su oficina virtual",
      zona: "puesto",
      categoria: "Desarrollo",
      estado: "Publicado",
      resumen: "Web y videojuego 2D hechos a mano con HTML, CSS y JavaScript, sin frameworks, alojados en GitHub Pages.",
      puntos: [
        "Motor 2D en Canvas con colisiones, pathfinding A* y personajes animados.",
        "Editor de avatares y un guía que presenta el CV con voz y bocadillos.",
        "Todo el contenido sale de un único archivo de datos."
      ],
      tech: ["HTML", "CSS", "JavaScript", "Canvas", "GitHub Pages"],
      enlaces: [{ t: "Código en GitHub", u: "https://github.com/Cld3r0n" }]
    }
  ],

  /* Nivel: 3 = lo uso a diario · 2 = lo manejo · 1 = aprendiendo
     Son una estimación: ajústalos a tu realidad */
  skills: [
    { grupo: "Hacking ético", items: [["Kali Linux", 2], ["Nmap", 2], ["Burp Suite", 2], ["Wireshark", 2], ["Hydra y Netcat", 2], ["Metasploit y payloads", 1], ["SQLMap", 1], ["OSINT", 1], ["Pivoting", 1], ["Autopsy (forense)", 1]] },
    { grupo: "Redes y defensa", items: [["Firewall UFW y Fail2ban", 3], ["pfSense", 2], ["Diseño de redes y VLANs", 2], ["VPN (Tailscale, OpenVPN)", 2], ["Pi-hole y DNS", 2], ["TCP/IP y protocolos", 2], ["SIEM", 1], ["Cisco", 1]] },
    { grupo: "Sistemas", items: [["Linux (Debian / Ubuntu)", 3], ["Docker y Docker Compose", 3], ["Raspberry Pi", 3], ["Máquinas virtuales", 2], ["Windows Server y Active Directory", 2]] },
    { grupo: "Normativa y metodologías", items: [["ISO 27001 / 27002", 2], ["Magerit", 2], ["RGPD", 2], ["OWASP y PTES", 1], ["CVE / NVD", 1], ["NIS2 y ENS", 1]] },
    { grupo: "Programación y automatización", items: [["Python", 2], ["C#", 2], ["HTML y CSS", 2], ["MySQL", 2], ["Bots de Telegram", 2], ["LLMs e IA en Azure", 1], ["Machine learning", 1]] },
    { grupo: "3D y creatividad", items: [["Adobe (Photoshop, After Effects, Premiere)", 3], ["3ds Max y Maya", 2], ["Unity", 2], ["Substance Painter", 2]] }
  ],

  formacion: [
    { titulo: "Máster en Ciberseguridad e Inteligencia Artificial", centro: "Evolve", fechas: "Oct 2026 – actualidad", detalle: "Hacking ético y auditoría, OSINT, explotación con Metasploit, pivoting y movimiento lateral, Blue Team y SOC, normativa e IA aplicada a la ciberseguridad." },
    { titulo: "Cyber Security & Digital Intelligence + Pearson HND in Computing (Cyber Security)", centro: "MSMK University", fechas: "Oct 2024 – actualidad (último año)", detalle: "Seguridad de redes, gestión de la seguridad de la información (SGSI), hacking ético e IA." },
    { titulo: "Grado Superior en Animación 3D, Juegos y Entornos Interactivos", centro: "Escuela CES Imagen y Sonido", fechas: "Sep 2021 – Jun 2023", detalle: "" }
  ],
  experiencia: [
    { puesto: "Operador de Multidispositivos", empresa: "Antena 3", fechas: "Ago 2023 – Nov 2023", detalle: "Grafismo 3D en pantalla para programas de televisión: elementos, posición y superposición en directo." }
  ],
  certificaciones: [
  ],

  /* ---------- Oficina virtual ---------- */

  /* Avatar del guía (tú). Diseña el tuyo en la oficina con el botón
     "Avatar", pulsa "Copiar código" y pégalo aquí. */
  avatarGuia: { piel: "#efc6a3", peloEstilo: "corto", peloColor: "#3b2416", ojos: "#3b2416", ropa: "sudadera", ropaColor: "#1b2342", accesorio: "auriculares", barba: "ninguno" },

  /* Frases del avatar en la portada de la web */
  frasesHero: [
    "¡Hola! 👋 Soy el avatar de Adrián.",
    "Último año de carrera + Máster en Ciberseguridad e IA 🛡️",
    "Tengo un servidor fortificado y un laboratorio con AD 🖥️",
    "¿Entramos en mi oficina virtual? 🎮"
  ],

  /* El tour guiado. Cada paso: zona a la que camina el guía, la frase
     mientras camina (camino) y lo que cuenta al llegar (texto). */
  tour: [
    { zona: null, texto: "¡Hola! 👋 Bienvenidos al CV de Adrián. Soy su avatar y hoy hago de guía por su oficina virtual. ¿Te enseño lo más interesante?" },
    { zona: "sobre-mi", camino: "Empecemos por la zona chill 🛋️", texto: "Adrián está en el último año de Cyber Security & Digital Intelligence en MSMK University y, a la vez, cursa un Máster en Ciberseguridad e IA. Antes estudió animación 3D y trabajó en Antena 3 haciendo grafismo en directo… por eso su CV tiene forma de videojuego." },
    { zona: "servidores", camino: "Ahora la sala de servidores 🖥️", texto: "Esto es CaldesBerry, su servidor en una Raspberry Pi 5. Lo ha fortificado él mismo con UFW, Fail2ban y parches automáticos, y entra desde fuera por Tailscale sin abrir ni un solo puerto a Internet." },
    { zona: "puesto", camino: "Sígueme al puesto de hacking 🎯", texto: "Aquí tiene su laboratorio de ataque y defensa: pfSense, un dominio de Active Directory en Windows Server, clientes Windows 11 y Ubuntu… y Kali fuera para atacar. Además entrena en Hack The Box, TryHackMe y DockerLabs." },
    { zona: "automatizacion", camino: "Vamos al rincón de automatización 🤖", texto: "Le encanta que las máquinas trabajen por él: un bot de Telegram en Python que lanza tareas al segundo, un bot con IA en Azure, y está diseñando Jarvis, un asistente que administra su servidor con privilegios mínimos." },
    { zona: "skills", camino: "Mira la pantalla grande 📊", texto: "Sus skills: hacking ético con Nmap, Burp Suite, Metasploit o Wireshark, redes, Linux, Docker, normas como ISO 27001… y un extra poco común: 3D y diseño." },
    { zona: "formacion", camino: "Ahora la vitrina 🎓", texto: "En la vitrina están su formación (carrera y máster) y dos trabajos de la uni de los que está orgulloso: el diseño de una red segura para una nueva sede y el análisis de riesgos de un banco digital con Magerit e ISO 27002." },
    { zona: "terminal", camino: "Te enseño un secreto ⌨️", texto: "Si te van los comandos, esta terminal es para ti. Prueba a escribir help… o sudo contratar 😉" },
    { zona: "contacto", camino: "Y para terminar, la sala de reuniones 📡", texto: "Si buscas a alguien con ganas de aprender y que ya se pelea con sistemas reales, aquí tienes su contacto. ¡Gracias por la visita!" }
  ],

  /* Líneas que pasan por la pantalla gigante de la oficina */
  logs: [
    "[ OK ] ufw: activo · ssh solo LAN + tailscale",
    "[ OK ] fail2ban: jail sshd vigilando",
    "[INFO] tailscale: 0 puertos abiertos a internet",
    "[ OK ] pfsense: reglas del lab cargadas",
    "[WARN] kali: escaneo nmap sobre lab.local",
    "[ OK ] ad: dominio lab.local en línea",
    "[INFO] htb: starting point en progreso",
    "[ OK ] unattended-upgrades: parches al día",
    "[INFO] jarvis: diseño en curso"
  ]
};
