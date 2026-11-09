# Luis Pañuni · portafolio

Sitio personal estático bilingüe para mostrar proyectos de software, tecnologías confirmadas en conversación y una identidad visual personal.

## Tecnologías y estructura

- HTML semántico (`index.html`) con contenido principal disponible sin JavaScript, metadatos SEO y Open Graph.
- CSS responsivo (`styles.css`), sin framework de componentes ni dependencias de ejecución.
- JavaScript nativo (`app.js` y `mini-lab.js`) para cambiar entre español e inglés, filtrar tecnologías, alternar tres apariencias, cambiar capturas y abrirlas en una vista ampliada. El escritorio all-in-one de la portada incluye un menú Start, proyectos, tecnologías, enlaces confirmados a GitHub y correo, una paleta con copia de colores, Snake y una consola educativa que acepta un pequeño subconjunto de comandos con sintaxis Python. No interpreta Python general ni ejecuta código arbitrario. Una capa fija de canvas 2D extiende la red neuronal y la esfera de partículas por toda la página; responde al puntero y se detiene con reducción de movimiento.
- Imagen de perfil y recortes optimizados de la identidad gráfica en `assets/`.
- Capturas de Oruro Digital, Zona Comercial y un prototipo de Unity en `assets/projects/`.
- Fuentes Manrope y DM Mono desde Google Fonts, con alternativas del sistema si no se pueden cargar.

## Ejecutar localmente

Abre `index.html` en un navegador o sirve la carpeta con cualquier servidor estático. Por ejemplo, si tienes Python instalado:

```powershell
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Publicar

Al ser un sitio estático puede publicarse en GitHub Pages, Cloudflare Pages, Netlify o Vercel sin pasos de compilación. En GitHub Pages, selecciona la rama del repositorio y la carpeta raíz como fuente.

## Diseño y decisiones técnicas

- La navegación separa proyectos, perfil y tecnologías para presentar primero la evidencia profesional. El escritorio interactivo presenta rutas destacadas y pequeños experimentos; el retrato personal permanece en la sección de perfil. El fondo oscuro y la animación se comparten entre todas las secciones, con superficies translúcidas para mantener la lectura.
- Los casos de estudio muestran contexto, plataforma y tecnologías confirmadas. No inventan métricas, persistencia, backend ni resultados.
- El cuestionario de autoevaluación se realiza en la conversación; sus resultados se integrarán en el perfil después de responderlo. No se muestra un test a visitantes.
- La cuadrícula de tecnologías usa columnas adaptables para conservar el contenido en pantallas estrechas.
- Controles nativos, enlaces descriptivos, foco visible, atajo para saltar al contenido, texto legible en móvil y respeto a `prefers-reduced-motion`.
- Ilustraciones hechas con SVG/CSS; no hay imágenes externas pesadas ni dependencias de JavaScript.

## Referencias de estructura

La organización por evidencia de proyecto toma como referencia estos sitios reales, sin copiar su identidad visual:

- [Aftab Rehan — Work](https://www.aftabrehan.com/work): lista de proyectos con problemas, contexto, stack y tipos de entrega.
- [Jeremy Hayes — Portfolio Website](https://www.jeremymhayes.com/projects/portfolio-website): explica la decisión de priorizar casos de estudio, metadatos y rutas claras para una audiencia profesional.
- [Rishit Tandon — How This Interactive Portfolio Website Is Built](https://portfolio.rishit.site/how-its-built): caso técnico detallado y la observación de que una experiencia muy interactiva debe seguir ofreciendo contenido rastreable a buscadores.
- [Keita Yamada — p5aholic.me](https://p5aholic.me/): referencia de navegación simple, selector de apariencia (clara, oscura y monoespaciada), tipografía expresiva y presencia de experimentación visual.

## Contenido por confirmar

El CV, las capturas que compartiste y tus próximas respuestas son las fuentes del contenido. Para completar los casos de estudio conviene añadir enlaces de demostración/repositorio, fechas, decisiones de arquitectura, persistencia, responsabilidades individuales y resultados comprobables. No están inventados ni rellenados con placeholders en el sitio.
