# saluxly.com — Diseño y especificación de la landing page

Diseño del 17 de octubre de 2026. Sustituye por completo la página actual de `saluxly-landing`. La referencia visual son los tableros "Landing page, desktop", "Landing page, phone", "Legal page template", "Support and delete account", "Share image" y "Hero after launch" del lienzo de diseño; aquí van en `reference/` como HTML y en `screenshots/` como PNG.

El sitio es estático (GitHub Pages), sin frameworks, sin analítica, sin cookies, en tres idiomas. Debe sentirse como la app: mismo sistema de color, tipografía y motivos.

## 1. Objetivo

Antes del lanzamiento: explicar Saluxly en cinco segundos, generar confianza (procedencia de los artículos, licencias, sin anuncios, sin rastreo) y captar correos para la lista de espera. Después del lanzamiento: lo mismo, con los botones de las tiendas en lugar del formulario. Siempre: cumplir lo que Apple y Google exigen (privacidad, términos, soporte, borrar cuenta).

## 2. Principios de diseño

1. **El papel es el material.** Páginas color crema con la maqueta real de una revista, con sombra, sobre el fondo oscuro cálido. Todo lo demás retrocede.
2. **La fibra conecta.** El motivo de conducción de la marca (nodo → fibras → nodos) une el titular con el producto en el hero y recorre los tres pasos. No es decoración: significa que la señal llega al lugar correcto.
3. **Contención editorial.** Titulares en serif con frases completas, en sentence case. Sin etiquetas en mayúsculas, sin tarjetas idénticas, sin iconos genéricos. Jerarquía por tamaño, medida de línea y líneas finas.
4. **Verdad específica.** Cifras y hechos reales. Lo que no hacemos, dicho claro. Honestidad sobre la IA.
5. **Una sola audacia.** La composición del hero. El resto, disciplinado.

## 3. Sistema

### Color
| Nombre | Valor | Uso |
|---|---|---|
| Fondo | `#17100C` | fondo de página, `theme-color` |
| Superficie | `#221712` | campos, paneles, columna destacada de precios |
| Línea | `#37271F` | todas las líneas de 1 px |
| Texto | `#F6ECE3` | titulares y texto principal |
| Texto 2 | `#BFAEA2` | párrafos |
| Texto 3 | `#9A877B` | notas, pies, metadatos |
| Ámbar | `#D76821` | botones, fibras, borde de la columna destacada |
| Ámbar claro | `#FB9338` | nodos, números de paso, iconos de acción, enlaces |
| Ámbar oscuro | `#AB3402` | solo dentro del gradiente del nodo |
| Tinta | `#1E0E05` | texto sobre botones ámbar |
| Papel | `#F8F6F2` | páginas de PDF |
| Resaltado | `#FFD3A3` | subrayado en la página de PDF |

Sin otros colores. Las "cabeceras" de revista en las miniaturas usan `#1F4E79`, `#1E6B52`, `#7A1F2B`, `#4B3A8C`, `#8A5A12`, como en la app.

### Tipografía
- **Newsreader** (serif, con eje óptico): titulares, títulos de artículo, nombres de revista en cursiva, cifras de precio, cita del fundador. Peso 500 para titulares, 400 para la cita.
- **Hanken Grotesk** (sans): todo lo demás. 400 texto, 500 navegación, 600 énfasis, 700 botones.
- Autoalojar ambas como woff2 con subconjunto latino, con `font-display: swap` y `preload` de los dos archivos principales. Nada de Google Fonts en producción (evita una conexión a terceros y coincide con la política de privacidad).

Escala de escritorio (px / line-height):
- H1 hero 86 / 0.98, letter-spacing −1.5
- H2 sección 46 / 1.1 (la declaración de PubMed, 52)
- H3 bloque de producto 38 / 1.1; paso 28 / 1.15; fila 22–24 / 1.2
- Entradilla 21 / 32 (hero), 18 / 28 (secciones), 17.5 / 27 (bloques)
- Texto 16 / 24; notas 13.5–14 / 20
- Cita del fundador 32 / 1.3

Escala móvil: H1 50 / 0.98; H2 32 / 1.1; H3 28 / 1.1 (producto), 24 (pasos); texto 15–15.5 / 22–23; cita 23 / 1.32.

Medida: párrafos de 440 a 640 px en escritorio, nunca más de 72 caracteres por línea.

### Retícula y espacio
- Escritorio: contenido de 1200 px centrado, márgenes mínimos de 120 px a 1440. A partir de 1600 el contenido no crece; a menos de 1200 los márgenes bajan a 48 px; tableta (≤ 1024) una columna con el móvil como guía; móvil márgenes de 20 px.
- Secciones separadas por una línea de 1 px y 88 px de relleno vertical (44 en móvil).
- Radios: botones y campos 27 px (pastilla); paneles de producto 30 px; teléfono 46 px; chips 17–19 px; columna destacada de precios 16 px.

### Componentes
- **Botón primario:** pastilla ámbar, texto tinta 700. Alturas 44 (nav), 54 (formularios). Hover: ámbar claro. Foco: anillo de 2 px `#FB9338` con 3 px de separación. Sin flechas.
- **Campo de correo:** pastilla de superficie con borde línea; placeholder `you@hospital.org` en Texto 3; foco con borde ámbar.
- **Chips:** 34–38 px, borde línea, texto Texto 2; activo: fondo ámbar y texto tinta.
- **Filas de datos:** sin tarjetas; cada fila con línea superior de 1 px, dos columnas (título serif a la izquierda, texto a la derecha).
- **Teléfono:** marco de 10 px `#0B0705`, radio 46, sombra `0 40px 90px rgba(0,0,0,.6)`. En producción contiene capturas reales de la app; mientras no existan, las imágenes de `screens/`.
- **Página de PDF:** ver `reference/`; en producción es una imagen (PNG 2x o SVG) exportada del tablero, con rotación −7° y sombra `0 30px 60px rgba(0,0,0,.55)`.
- **Hoja en contorno:** la de `design/icons/external-sheet-dark.svg` de la app.
- **Marca de conducción:** SVG vectorial de la app; versión grande al 13 % de opacidad detrás del hero.

## 4. Estructura y texto (inglés)

Las traducciones al español (de México) y portugués (de Brasil) se hacen en el repositorio a partir de este texto y se entregan a Gus en una tabla de tres columnas para revisión antes de publicar. Mantener los mismos nombres de acción en todo el sitio: "Join the waitlist" es el único verbo del formulario.

### Barra
- Marca (SVG + "Saluxly", con "ly" en ámbar) a la izquierda.
- Enlaces: How it works · Product · Pricing · Questions (anclas).
- Derecha: selector EN / ES / PT y botón "Join the waitlist".
- Al desplazarse 80 px: la barra pasa a 64 px de alto, fondo `#17100C` al 85 % con desenfoque, línea inferior.
- Móvil: marca, selector y botón de menú. El menú es una hoja a pantalla completa con los cuatro enlaces en serif de 30 px y el botón.

### Hero
- H1: **Let the papers find you.**
- Entradilla: Saluxly reads PubMed for you and builds a daily feed of review articles for your specialty, with the original PDF inside the app.
- Formulario: campo de correo + "Join the waitlist".
- Nota: Launching first on iPhone and iPad. Free for your first 7 days, no card needed. One email when we launch, nothing else.
- Visual: teléfono con el feed; página de PDF inclinada que llega desde el titular por la fibra; marca de conducción grande y tenue detrás. En móvil, el teléfono queda centrado con la página sobre su lado izquierdo y un degradado al final.

### Declaración
- H2 (52 px): PubMed adds more than a million new records a year. You need five.
- Tres filas:
  - **Review articles only, from the last five years.** Systematic reviews, meta-analyses, guidelines and narrative reviews. No primary studies to sift through.
  - **Journals that meet a quality bar.** Indexed in MEDLINE or with an established citation record, ranked by impact within each specialty.
  - **Chosen for your specialty and profession.** Forty-plus specialties and six professions, in English, Spanish or Portuguese.

### How it works
- H2: Three steps, then it runs on its own.
- Fibra horizontal con tres nodos sobre las columnas. Numerales 1, 2, 3 en serif ámbar claro (es una secuencia real).
  1. **Choose your specialties.** One or several. Physicians, residents, students, dentists, nurses and dietitians each get a feed of their own. Visual: chips Obstetrics y Neonatology activos, Cardiology y All medicine inactivos.
  2. **Open the feed.** New review articles every day, ranked for you. Heart the ones you want to keep. Visual: una fila del feed con el corazón activo.
  3. **Read the paper.** The original PDF opens inside the app, with highlights, notes and a plain-language summary one tap away. Visual: página de PDF pequeña y "Aa".

### Product
- H2: Built for how doctors read. Entradilla: Short on time and long on standards. Saluxly brings you the paper, not a link farm.
- Cuatro bloques alternando visual y texto (visual izquierda en el 1.º y 3.º). Cada visual es un panel de 620 px de alto con degradado de superficie a fondo, línea de 1 px, radio 30, con el teléfono al 90 % y un degradado al pie.
  1. **Chosen for you, not for advertisers.** Every paper in your feed is there because of your specialties and what you read, never because someone paid for the spot. No ads, no sponsors, no pharma. (pantalla: feed)
  2. **The original paper, as the journal published it.** Open-license papers (CC BY and CC0) open inside Saluxly in a native reader. Highlight, take notes and keep them offline. Everything else opens at PubMed Central or the journal's site, clearly marked. (pantalla: lector)
  3. **Understand it in two minutes.** Aa gives you a plain-language summary built from the paper itself. Ask AI answers your questions about what you are reading. Both can make mistakes, so the paper is always one tap away. (pantalla: resumen)
  4. **Search that speaks medicine.** Type in English, Spanish or Portuguese, with abbreviations or typos. Saluxly maps your words to medical subject headings and returns the reviews that are about your topic, not the ones that merely mention it. (pantalla: buscador con "aspirina preeclampsia prevención")

### Where every paper comes from
- H2: Where every paper comes from. Entradilla: The whole pipeline, with nothing hidden. Article data courtesy of the U.S. National Library of Medicine.
- Debajo, a la izquierda: página sólida y hoja en contorno con la nota: A solid page means the PDF is in the app. An outlined page means it opens at its source.
- Derecha, cuatro pasos unidos por una fibra vertical con nodos:
  - **Indexed in PubMed.** Review articles, systematic reviews, meta-analyses and guidelines published in the last five years.
  - **Through a quality bar.** Journals indexed in MEDLINE or with an established citation record, ranked by impact within their specialty.
  - **Checked for its license.** Papers with an open license (CC BY or CC0) are hosted and open inside the app. The rest open at PubMed Central or the journal's own site.
  - **Credited, always.** Every paper carries its authors, journal, year and license, with a link to the PubMed record.

### Made for the way you practice
- H2: Made for the way you practice. Entradilla: Six professions, forty-plus specialties, one app. Pick yours in the first minute and change it whenever you like.
- Filas: **Physicians and residents** — Your specialties, plus the reviews from all of medicine that everyone should know. **Medical students** — The core topics of the clinical years, at the level of a rotation. **Dentists, nurses and dietitians** — A feed built from your own profession's journals, not a filtered copy of the medical one.
- Chips con las especialidades (la lista real de la app, en orden alfabético) y "and more" / "and 26 more" en móvil.

### Founder
- Cita (serif 32, comillas tipográficas): "I built Saluxly because the papers I needed kept reaching me too late, or not at all. I wanted the review that changes practice to show up on its own, in full, the week it comes out, without ads and without a hospital login."
- Firma: **Gustavo González, MD**, fetal medicine specialist and founder of Saluxly. *(Nombre, cargo y texto pendientes de aprobación de Gus; si prefiere no aparecer, la sección se quita entera.)*

### Pricing
- H2: Free for your first 7 days. No card needed. Entradilla: Then keep the free plan or subscribe. Billing through the App Store; cancel any time.
- Tabla de cuatro columnas (concepto, Free, Yearly, Monthly). La columna Yearly lleva fondo de superficie, borde superior ámbar de 2 px, radio 16 arriba y abajo y la nota "Best value" en ámbar claro. Cabeceras: Free "After the first 7 days"; Yearly "$2.92 a month, billed once a year"; Monthly "Billed every month".
- Filas: Daily feed — 30 papers a day / Endless / Endless. Articles you can open — 3 a day / Unlimited / Unlimited. New searches — 3 a day / Unlimited / Unlimited. Summary and Ask AI — With every article you open / Included / Included. Save and read offline — Included / Included / Included. Price — $0 / $34.99 a year / $4.99 a month (serif 22).
- Nota: Prices in US dollars; local prices and taxes may vary. Subscriptions renew automatically until cancelled in your App Store settings.
- Móvil: tres paneles apilados en el orden Yearly (destacado), Monthly, Free, cada uno con sus filas.
- Cuando exista Android, la nota dice "App Store or Google Play".

### Questions
- H2: Questions, answered. Acordeón con `<details>`/`<summary>`, el primero abierto, icono "+" en ámbar claro que gira 45° al abrir.
  1. **Is Saluxly a textbook or a clinical reference?** No. Saluxly is a reading feed of review articles from the medical literature. It helps you keep up with what is being published in your field; it does not replace a clinical reference, a guideline or your own judgment.
  2. **Where do the articles come from?** From PubMed, the database of the U.S. National Library of Medicine. Saluxly keeps review articles, systematic reviews, meta-analyses and guidelines from the last five years, published in journals that pass its quality bar.
  3. **Can I read the full paper?** Yes. Papers with an open license (CC BY or CC0) open inside the app as the original PDF. Other papers open at PubMed Central or on the journal's website in a browser view, where many are free to read.
  4. **Is it legal to read the PDFs in the app?** Yes. Saluxly only hosts papers whose license allows it, credits every paper to its authors and journal, and links the rest to their source instead of copying them.
  5. **Which languages does it work in?** The app runs in English, Spanish and Portuguese. Articles are in English, with titles translated automatically. You can search in any of the three languages.
  6. **Do I need a hospital or university login?** No. Everything in Saluxly is either openly licensed or free to read at its source. You only need an email address.
  7. **Which devices can I use?** iPhone and iPad first, including an iPad layout and a home-screen widget. Android follows, and a web version is planned.
  8. **What do you do with my data?** Your email signs you in. What you read and save personalizes your feed. Saluxly shows no ads, uses no advertising trackers and does not sell your data. You can delete your account from the app at any time.

### Final
- Marca de conducción centrada (110 px), H2 (56): Be the first to read. Entradilla: One email when Saluxly launches on iPhone and iPad. Nothing else. Formulario.

### Footer
- Marca; texto: Saluxly is a reading tool for health professionals. It is not a medical device and does not provide medical advice. Article data courtesy of the U.S. National Library of Medicine. Saluxly is not affiliated with or endorsed by the NLM, NIH or HHS. © 2026 Saluxly, Inc.
- Enlaces: Privacy policy · Terms of service · Support · Delete your account. Correo contact@saluxly.com. Selector de idioma.

## 5. Comportamiento

### Formulario de lista de espera
- `POST` a `WAITLIST_ENDPOINT` (constante en un solo archivo de configuración) con `email`, `lang` y `page`. Campo trampa oculto `website` que, si viene lleno, se descarta en silencio.
- Validación en el cliente: formato de correo; mensaje bajo el campo: "Enter an email address like name@hospital.org."
- Estados, en el mismo lugar del formulario y sin cambiar de página: enviando (botón con "Joining…" y deshabilitado); éxito, el formulario se sustituye por "You're on the waitlist. We'll email you once, when Saluxly launches." con un nodo ámbar; error: "We couldn't save your email. Try again in a moment, or write to contact@saluxly.com."
- Los dos formularios de la página (hero y final) comparten lógica; el éxito en uno se refleja en el otro.
- Destino: `/v1/waitlist` del backend de la v2 cuando esté desplegado. Mientras tanto, si Gus elige un servicio externo de formularios, se configura solo en `WAITLIST_ENDPOINT` y se nombra en la política de privacidad. Nunca Railway ni ninguna dirección vieja.
- Sin doble confirmación. Se guardan solo correo, idioma y fecha.

### Idiomas
- Tres páginas estáticas generadas desde una plantilla y tres diccionarios JSON: `/` (en), `/es/` y `/pt/`. `hreflang` cruzado y `x-default` en las tres, `lang` correcto en `<html>`, `canonical` por idioma.
- Sin redirección automática. Si el idioma del navegador es español o portugués y el visitante está en `/`, una franja discreta bajo la barra ofrece "Ver en español" / "Ver em português"; se recuerda la elección (localStorage) y no vuelve a aparecer.
- El selector conserva la sección (ancla) al cambiar de idioma.

### Movimiento
- Una sola secuencia al cargar el hero, en CSS: la fibra se dibuja (stroke-dashoffset, 900 ms) y la página de PDF entra deslizándose 24 px con un fundido (500 ms, retraso 500 ms). Nada más se anima al desplazarse.
- Movimiento que responde al usuario: apertura del acordeón, hoja del menú, cambio de estado del formulario, desplazamiento suave a las anclas.
- `prefers-reduced-motion: reduce` desactiva todo lo anterior salvo los cambios de estado.

### Móvil
- Barra fija de 64 px. Cuando el formulario del hero sale de pantalla aparece una barra inferior fija con "Join the waitlist" (lleva al formulario final); se oculta cuando cualquiera de los dos formularios está visible y después del envío.
- Objetivos táctiles mínimos de 44 px. Sin desplazamiento horizontal a 360 px.

### Después del lanzamiento
- Un indicador en la configuración (`LAUNCHED = true`) cambia los dos formularios por los botones de tienda: "Download on the App Store" (y "Get it on Google Play" cuando Android esté publicado), con los recursos oficiales de Apple y Google sin redibujar, y un código QR al enlace de la App Store solo en escritorio. Ver el tablero "Hero after launch".
- La nota del hero pasa a "Free for your first 7 days, no card needed."
- Después, con reseñas reales en las tiendas, se puede añadir una franja de citas con permiso; nunca testimonios inventados.

## 6. Páginas

| Ruta | Contenido | Idiomas |
|---|---|---|
| `/`, `/es/`, `/pt/` | landing | 3 |
| `/privacy.html` | política de privacidad, plantilla "Legal page" | inglés |
| `/terms.html` | términos de servicio, misma plantilla | inglés |
| `/support.html` (+ `/es/`, `/pt/`) | soporte y borrar cuenta, tablero "Support" | 3 |
| `/delete-account.html` | redirección permanente a `/support.html#delete` (Google Play pide una dirección estable; conservar la actual) | — |
| `/404.html` | marca, "This page isn't here." y enlace a la portada | inglés |

Las páginas legales se publican con el texto final de los documentos "Saluxly Privacy Policy" y "Saluxly Terms of Service"; hasta entonces, la plantilla con el texto actual de esos documentos marcado como borrador no se publica (la página vieja de Termly se queda hasta tener el texto final). Las páginas legales llevan índice lateral fijo, "At a glance" en un panel, tablas con el estilo de filas del sitio y fecha de vigencia.

## 7. Metadatos y SEO
- `<title>`: "Saluxly — Let the papers find you" (en); "Saluxly — Que los artículos te encuentren" (es, revisar con Gus); "Saluxly — Deixe os artigos encontrarem você" (pt, revisar).
- `<meta name="description">` por idioma, 150–160 caracteres, a partir de la entradilla del hero.
- Open Graph y Twitter Card con `og/og-image.png` (1200 × 630, exportado del tablero "Share image"); `theme-color` `#17100C`.
- JSON-LD: `Organization` (Saluxly, Inc., contact@saluxly.com) y `SoftwareApplication` (categoría MedicalApplication, sistemas iOS, precio desde 0 USD).
- `sitemap.xml`, `robots.txt`, favicon SVG + PNG 32/180/512 a partir de la marca de conducción, `manifest.webmanifest` mínimo.

## 8. Rendimiento y accesibilidad
- Presupuesto: HTML + CSS + JS < 120 KB; imágenes del hero < 400 KB en total (WebP con PNG de respaldo, 2x solo donde se ve). Sin librerías externas. Lighthouse ≥ 95 en las cuatro categorías, en móvil.
- Contraste AA en todo: Texto 2 sobre fondo ≈ 9:1, Texto 3 ≈ 5.6:1, tinta sobre ámbar ≈ 7:1.
- Enlace "Skip to content", landmarks (`header`, `main`, `nav`, `footer`), encabezados en orden, foco visible, acordeón accesible por teclado, formulario con `label`, errores anunciados con `aria-live`.
- Sin analítica, sin cookies, sin fuentes ni scripts de terceros. Por eso no hay banner de cookies.

## 9. Lo que no debe aparecer
- Logotipos o marca denominativa de PubMed Central, NLM o NIH. Solo texto, y siempre la frase de cortesía y el deslinde del pie.
- Testimonios, cifras de usuarios o reseñas inventadas.
- Botones de tienda antes de que la app esté publicada.
- Promesas que el producto no cumple hoy (web app, Android) sin la palabra "next" o "planned".
- Precios distintos de $4.99 al mes y $34.99 al año.

## 10. Archivos de este paquete
- `reference/*.html`: los seis tableros, listos para abrir en un navegador.
- `screenshots/*.png`: los tableros renderizados.
- `screens/screen-*@2x.png`: las cuatro pantallas de la app (feed, lector, resumen, buscador) a 780 × 1600, para usar dentro del marco de teléfono hasta tener capturas reales.
- `og/og-image.png`: imagen para compartir, 1200 × 630.

## 11. Repositorio
- Se eliminan: `paywall*.html`, `fix_heart.sh`, `heart_anatomy.png`, `.DS_Store`, las capturas que se cargaban de Google Play y el formulario antiguo. `heart_saluxly.png` se sustituye por el SVG de la marca.
- Se conservan: `CNAME`, `saluxly-logo.svg` (si coincide con la marca de la app; si no, se exporta de nuevo), la ruta `/delete-account.html`.
- Estructura sugerida: `src/` (plantilla, diccionarios, estilos, scripts), `build.py` o `build.mjs` que genera la raíz publicable, `assets/`. GitHub Pages sigue sirviendo la raíz del repositorio.
