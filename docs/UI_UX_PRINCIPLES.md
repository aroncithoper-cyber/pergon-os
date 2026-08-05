# PerGon OS — UI/UX Principles

> Documento de reglas obligatorias.
> Toda pantalla, componente e interacción de PerGon OS debe cumplir este documento.
> Complementa `PERGON_DESIGN_BIBLE.md`. En conflicto, prevalece la decisión explícita del Design Bible + este archivo.
>
> Origen de pensamiento: principios de inteligencia de diseño (tokens primero, decisiones de estilo con costo real, anti-patrones, checklist de entrega). Adaptados a PerGon OS. No son plantillas ni copias visuales.

---

## 0. Cómo usar este documento

1. Leer antes de diseñar o implementar cualquier UI.
2. Elegir superficie: **Web**, **Admin**, **IA**, **Pasaporte/QR**, **Landing/Producto**.
3. Aplicar reglas generales + reglas de superficie.
4. Pasar el checklist de anti-patrones antes de considerar la UI lista.
5. No inventar estilos “porque se ven premium”. Cada efecto debe tener justificación funcional.

---

## 1. Filosofía de diseño

### 1.1 PerGon no es decoración

PerGon OS es un sistema operativo de producto: identidad digital, operación y confianza. La UI existe para **clarificar**, **acelerar** y **dignificar** — nunca para impresionar con ruido.

### 1.2 Tokens antes que componentes

Ninguna pantalla empieza con componentes sueltos. Orden obligatorio:

1. Intención de la pantalla
2. Tokens (color, tipo, espacio, motion)
3. Jerarquía y layout
4. Componentes del sistema (`@pergon/ui`)
5. Excepciones de dominio (solo si el sistema no alcanza)

Prohibido hardcodear valores visuales fuera de tokens salvo prototipo descartable.

### 1.3 Una intención por superficie

- **Web:** experiencia, comprensión, conversión, storytelling del producto.
- **Admin:** densidad, velocidad, control, auditoría.
- **IA PerGon Expert:** conversación útil, contexto visible, confianza.
- **Pasaporte / QR:** legibilidad, verificación, solemnidad operativa.

No mezclar lenguajes: una landing no se diseña como dashboard; un dashboard no se diseña como marketing.

### 1.4 Estilo = decisión de ingeniería

Glass, blur, 3D, gradients y motion tienen costo en contraste, performance y mantenimiento. Se eligen por **función**, no por moda.

### 1.5 Premium = precisión

Premium en PerGon significa: ritmo consistente, estados completos, tipografía disciplinado, cero elementos huérfanos. No significa más brillo, más capas ni más animación.

---

## 2. Principios UX

### 2.1 Claridad sobre cleverness

Si el usuario necesita descifrar la interfaz, la interfaz falló.

### 2.2 Una tarea primaria por vista

Cada vista declara una acción principal. Secundarias no compiten visualmente con la primaria.

### 2.3 Feedback inmediato

Toda acción del usuario produce respuesta perceptible en ≤ 100–150 ms percibidos (estado, motion sutil o confirmación). Nunca silencio.

### 2.4 Errores recuperables

Los errores explican qué pasó, qué hacer y cómo continuar. Sin culpa. Sin jerga interna en Web; en Admin se permite precisión técnica.

### 2.5 Progressive disclosure

Mostrar lo necesario ahora. Detalle avanzado bajo demanda. Especialmente crítico en Admin e IA.

### 2.6 Confianza como argumento

En Web y Pasaporte, el orden de secciones/pantallas construye confianza. No rellenar con “social proof” ficticio; usar estructura honesta del producto.

### 2.7 Persistencia de contexto

El usuario no debe perder el hilo al navegar, filtrar, abrir modales o hablar con la IA.

### 2.8 Estados primero

Diseñar siempre: default, hover/focus, active, loading, empty, error, success, disabled. Si falta un estado, la pantalla no está lista.

### 2.9 Velocidad percibida

Skeletons/estructura > spinners genéricos. Preferir contenido parcial útil antes que pantallas bloqueadas.

### 2.10 Accesibilidad no es opcional

Teclado, foco, contraste, semántica y `prefers-reduced-motion` son requisitos de producto.

---

## 3. Principios UI

### 3.1 Jerarquía tipográfica dominante

El ojo debe leer: título → acción → soporte → metadata. Si todo grita, nada habla.

### 3.2 Composición única en el primer viewport (Web / Landing)

El primer viewport es una composición, no un dashboard. Marca + un mensaje + un CTA group + ancla visual dominante.

### 3.3 Menos contenedores

Default: sin cards. Cards solo cuando contienen interacción o agrupación que se rompe sin contenedor. Nunca cards en el hero.

### 3.4 Superficies con propósito

Cada fondo, borde y elevación debe separar información. Decoración sin función se elimina.

### 3.5 Densidad según app

- **Web:** más aire, más narrativa.
- **Admin:** más densidad, menos teatro, más scanability.

### 3.6 Iconografía funcional

Iconos SVG del sistema (p. ej. Lucide). Nunca emoji como icono de UI. Icono sin label solo si el significado es inequívoco.

### 3.7 Alineación y rejilla

Todo se alinea a la escala de espaciado. Nada “casi alineado”.

### 3.8 Contraste de acción

CTA primario único por región. Secundarios y terciarios visualmente subordinados.

### 3.9 3D con disciplina

R3F se usa cuando aporta comprensión o presencia del producto. No como fondo decorativo permanente en Admin.

### 3.10 Consistencia de radio, borde y sombra

Radios, bordes y sombras salen del sistema. No inventar una “variante especial” por pantalla.

---

## 4. Sistema de espaciado

### 4.1 Base

Escala basada en **4**. Preferir múltiplos de **8** para layout.

### 4.2 Uso

- **4 / 8:** micro-ajuste interno (icon-gap, inline).
- **12 / 16:** componentes y grupos cercanos.
- **24 / 32:** secciones y bloques.
- **48 / 64+:** separación de capítulos visuales (Web).

### 4.3 Ritmo vertical

Secciones Web: ritmo generoso y predecible. Admin: ritmo compacto pero no asfixiado.

### 4.4 Contenedores

Anchos máximos definidos por tipo de página. El contenido no “flota” a ancho completo sin razón (tablas densas pueden ser excepción controlada).

### 4.5 Prohibido

Espaciados arbitrarios (13px, 27px, etc.), padding inconsistente entre hermanos, y apilar gaps que rompan la escala.

---

## 5. Uso del color

### 5.1 Color semántico primero

El color comunica estado y jerarquía: primary, secondary, muted, destructive, success, warning, info. No decorar con color aleatorio.

### 5.2 Un acento dominante

Por superficie, un acento principal. No competir con 3 acentos simultáneos.

### 5.3 Superficies

Fondos y superficies en capas claras (canvas → panel → elevated). Evitar flat único sin atmósfera en Web; evitar atmósfera teatral en Admin.

### 5.4 Contraste

Texto legible: mínimo WCAG AA (4.5:1 cuerpo, 3:1 grande). Glass y overlays no excusan texto ilegible.

### 5.5 Prohibiciones de color (PerGon)

- Temas púrpura-on-white / purple-to-indigo “AI default”.
- Cream genérico + terracotta “AI luxury default”.
- Neón sin función.
- Gradientes multicolor como identidad por defecto.
- Usar color solo para transmitir información crítica sin respaldo no cromático.

### 5.6 Dark mode

Si existe, es un sistema de tokens — no inversión automática. Contraste y superficies se diseñan explícitamente.

---

## 6. Tipografía

### 6.1 Expresiva con propósito

Fuentes con carácter definido por el Design Bible. Evitar stacks genéricos (Inter/Roboto/Arial/system) como identidad de marca en Web.

### 6.2 Escala cerrada

Tamaños solo de la escala tipográfica del sistema. No “un px más” por gusto.

### 6.3 Jerarquía

Display / H1–H3 / body / small / mono (datos, IDs, QR metadata).

### 6.4 Admin

Priorizar legibilidad y scan: menos display, más UI text consistente.

### 6.5 Longitud de línea

Cuerpo Web ~45–75 caracteres. Evitar paredes de texto a full-bleed.

### 6.6 Prohibido

Más de 2 familias en una vista sin justificación. All-caps largo. Tracking extremo. Texto sobre imagen sin tratamiento de contraste.

---

## 7. Motion Design

### 7.1 Propósito del motion

Crear presencia, jerarquía y continuidad — no entretenimiento vacío.

### 7.2 Presupuesto

En superficies visuales (Web/Landing/Producto): **2–3 motions intencionales** por composición fuerte. No animar todo.

### 7.3 Timing

Micro: ~150–250 ms. Transiciones de UI: ~200–350 ms. Narrativa/cinemática: más largas, pero raras y justificadas.

### 7.4 Easing

Natural y consistente en todo el producto. Misma familia de curvas para acciones similares.

### 7.5 Entradas

Preferir fade/slide sutiles ligados al scroll o a la aparición de contenido. Evitar bounce juguetón en Admin y Pasaporte.

### 7.6 `prefers-reduced-motion`

Obligatorio respetar. Alternativa estática equivalente.

### 7.7 Performance

Motion no debe degradar scroll ni input. Blur animado, sombras pesadas y 3D concurrente se limitan.

### 7.8 Framer Motion vs CSS

CSS para lo simple y barato. Framer Motion para orquestación, layout transitions y gestos. R3F solo para espacio 3D real.

---

## 8. Microinteracciones

### 8.1 Todo lo clickeable se siente clickeable

Cursor pointer, hover, focus-visible, active. Sin excepciones en controles reales.

### 8.2 Botones y controles

Hover y active con cambio claro (color, elevación o borde). Disabled sin engaño de interactividad.

### 8.3 Inputs

Focus ring visible del sistema. Validación inline sin saltos de layout agresivos.

### 8.4 Listas y filas (Admin)

Hover de fila sutil. Selección inequívoca. Acciones al hover no son el único camino (también visibles/accesibles).

### 8.5 Toasts / feedback

Breves, descartables, no bloqueantes salvo acción destructiva.

### 8.6 IA

Estados de “pensando / escribiendo / tool” claros. El usuario siempre sabe si el sistema trabaja.

### 8.7 Prohibido

Hover-only critical actions en mobile. Animaciones que retrasan la tarea. Microinteracciones que mueven el layout de forma desorientadora.

---

## 9. Glassmorphism (cuándo sí / cuándo no)

### 9.1 Definición operativa

Glass = superficie translúcida + blur + borde sutil para elevar contenido sobre un fondo con profundidad real.

### 9.2 Cuándo SÍ

- Overlays/modales sobre media rica en Web.
- Chrome flotante puntual (nav compacta, sheet) donde el fondo aporta contexto.
- Momentos de producto premium donde la profundidad ayuda a la jerarquía.
- Solo si el texto mantiene contraste AA y el blur no rompe performance.

### 9.3 Cuándo NO

- Admin operativo denso (tablas, forms largos, data grids).
- Texto largo o lectura sostenida.
- Fondos planos donde el glass no aporta nada.
- Mobile low-power como default (preferir sólido).
- Como “look de toda la app”.
- Apilado de múltiples glasses (ruido + costo).

### 9.4 Reglas técnicas de producto

- Siempre fallback sólido si blur no está disponible o reduce-transparency.
- No sustituir jerarquía tipográfica con blur.
- Glass no es marca por sí solo.

---

## 10. Scroll cinematográfico

### 10.1 Qué es en PerGon

Narrativa vertical donde el scroll revela historia del producto con pacing controlado — no parallax gratuito.

### 10.2 Dónde SÍ

Landings, páginas de producto, momentos de Pasaporte/presentación en Web.

### 10.3 Dónde NO

Admin, settings, tablas, formularios largos, flujos de verificación críticos.

### 10.4 Reglas

- Una idea por “beat” de scroll.
- El usuario nunca queda atrapado (scrolljacking prohibido).
- Contenido clave accesible sin motion.
- Performance: 60fps objetivo; degradar a estático si hace falta.
- CTA alcanzables sin completar toda la narrativa.

---

## 11. Storytelling visual

### 11.1 Historia = estructura

Orden de secciones = argumento. No collage de bloques marketing.

### 11.2 Ancla visual real

Imagery del producto, lugar, atmósfera o sistema real. Gradientes abstractos no cuentan como idea visual principal.

### 11.3 Marca primero (Web)

En el primer viewport, la marca/producto es señal hero. El headline no apaga la marca.

### 11.4 Presupuesto del hero

Marca, un headline, una frase de soporte, un CTA group, una imagen/plano dominante. Sin stats, schedules, chips, badges flotantes ni promos apiladas.

### 11.5 Sin overlays basura

No stickers, badges sueltos, chips promocionales ni callouts flotando sobre hero media.

### 11.6 Continuidad

Cada sección continúa la anterior. Si se puede reordenar al azar sin perder sentido, no hay historia.

---

## 12. Reglas para dashboards

### 12.1 Trabajo primero

El dashboard responde: qué necesita atención ahora. No es mural de widgets.

### 12.2 Jerarquía de widgets

Primario (acción/alerta) → secundario (tendencias) → terciario (referencia).

### 12.3 Densidad

Alta, pero escaneable. Alineación de columnas. Evitar tarjetas decorativas vacías.

### 12.4 Charts

Elegir el chart por pregunta de negocio, no por estética. Accesible (no solo color). Vacío y error definidos.

### 12.5 Personalización

Si hay widgets configurables, defaults excelentes primero.

### 12.6 Prohibido

KPI soup sin acción. 10 charts above the fold. Glass en cada card.

---

## 13. Reglas para formularios

### 13.1 Una columna por defecto

Multi-columna solo cuando campos son genuinamente paralelos y el scan no se rompe.

### 13.2 Labels visibles

Placeholder no reemplaza label.

### 13.3 Agrupar por significado

Fieldsets lógicos. No un formulario infinito sin secciones.

### 13.4 Validación

Al blur o submit según contexto. Mensajes específicos junto al campo. No solo toast genérico.

### 13.5 Acciones

Primaria a la derecha o al final del flujo (consistente en el producto). Destructivas claramente separadas.

### 13.6 Autosave / drafts (Admin)

Cuando el costo de pérdida es alto, indicar estado de guardado.

### 13.7 Accesibilidad

Asociar label-input, errores anunciables, orden de tab natural.

### 13.8 Prohibido

Reset accidental prominente. Campos requeridos sin marca. Validar solo al final en forms largos sin feedback intermedio cuando hay alto riesgo de error.

---

## 14. Reglas para tablas

### 14.1 Scan primero

Tipografía tabular para números. Alineación numérica a la derecha. Fechas en formato consistente.

### 14.2 Columnas

Solo columnas que ayudan a decidir. El resto en detalle/drawer.

### 14.3 Cabeceras sticky cuando hay scroll largo

Mantener contexto.

### 14.4 Filas

Altura consistente. Hover/selected claros. Acciones por fila accesibles.

### 14.5 Bulk actions

Visibles cuando hay selección. Confirmación en destructivas.

### 14.6 Empty / loading / error

Estados de tabla de primera clase.

### 14.7 Mobile

No fingir tabla densa en 375px: card-list o columnas prioritarias + más detalle.

### 14.8 Prohibido

Truncar datos críticos sin acceso al valor completo. Icon-only actions opacas. Zebra + hover + selected confusos.

---

## 15. Reglas para páginas de producto

### 15.1 Una promesa

La página explica un producto/capacidad con una promesa clara.

### 15.2 Demostración > adjetivos

Mostrar el sistema (UI real, flujo, 3D útil, QR/pasaporte) antes que claims vacíos.

### 15.3 Secciones con un trabajo

Una sección = un mensaje. Headline + soporte corto.

### 15.4 CTA contextual

CTA alineado al momento del argumento (conocer / empezar / verificar), no spam de botones.

### 15.5 Prueba sin ficción

No inventar testimonios, métricas o logos. Si no hay prueba real, no fingirla.

---

## 16. Reglas para landing pages

### 16.1 Primer viewport = composición

Ver §3.2 y §11.4.

### 16.2 Secuencia de confianza

Orden pensado para el nivel de confianza del visitante. No copiar plantilla “Hero → Features → Testimonials → Pricing” por defecto si no aplica.

### 16.3 Full-bleed hero

Imagen/plano dominante edge-to-edge cuando haya hero visual. No hero en card inset ni collage de thumbnails.

### 16.4 CTA group

Primario + opcional secundario. Sin cluster de pills.

### 16.5 Performance y SEO

LCP cuidado. Metadata real. Contenido indexable no atrapado solo en canvas/WebGL.

### 16.6 Prohibido

Stats inventados, schedules, address blocks, “this week”, metadata rows y marketing secundario en el primer viewport.

---

## 17. Reglas para panel administrador

### 17.1 El Admin es el corazón operativo

Prioridad: velocidad, claridad, control, auditoría. Belleza = precisión, no espectáculo.

### 17.2 Shell estable

Navegación predecible. El contenido cambia; el chrome no baila.

### 17.3 Densidad alta con respiro controlado

Compacto, no claustrofóbico. Separadores útiles.

### 17.4 Permisos visibles

Si el usuario no puede hacer algo, la UI no finge que sí (salvo diseño explícito de discovery).

### 17.5 Peligro evidente

Acciones destructivas con fricción adecuada (confirmación, typing, etc. según severidad).

### 17.6 Datos > decoración

Tablas, filtros, búsqueda y detalle ganan a ilustraciones.

### 17.7 Motion mínimo

Solo feedback y orientación. Sin scroll cinematográfico.

### 17.8 Glass / 3D

Por defecto no. Excepciones raras y locales.

### 17.9 Features de dominio

`auth`, `users`, `settings` y módulos futuros viven en `features/` con UI consistente del sistema.

---

## 18. Reglas para IA (PerGon Expert)

### 18.1 La IA es herramienta, no mascota

Sin personalidad infantil. Tono experto, claro, respetuoso.

### 18.2 Contexto visible

El usuario debe entender qué sabe la IA en esa sesión (alcance, límites).

### 18.3 Respuestas accionables

Cuando proponga acciones, deben ser ejecutables o claramente informativas.

### 18.4 Estados del sistema

Idle, listening/thinking, streaming, tool/running, error, limited — todos diseñados.

### 18.5 No bloquear el producto

La IA asiste; no secuestra flujos críticos (emisión, verificación, admin sensible) sin confirmación humana.

### 18.6 UI AI-native sin clichés

Evitar gradientes “AI purple”, orbs genéricos y sparklés decorativos como identidad.

### 18.7 Privacidad en la interfaz

Dejar claro qué se envía. No ocultar telemetría sensible detrás de copy vago.

### 18.8 Admin vs Web

En Admin: precisión y auditoría. En Web: guía y explicación. Misma IA, distinto contrato UX.

---

## 19. Reglas de consistencia

### 19.1 Una fuente de verdad visual

`@pergon/ui` + tokens. Apps no inventan sistemas paralelos.

### 19.2 Mismos patrones para mismos problemas

Filtros, tablas, forms, dialogs y empty states se reutilizan.

### 19.3 Naming alineado al dominio

Copy de UI usa lenguaje PerGon (Pasaporte, QR, Admin, Expert) de forma estable.

### 19.4 Breakpoints

Diseñar y verificar: 375, 768, 1024, 1440.

### 19.5 Interactividad predecible

Mismos gestos → mismos resultados en Web y Admin (dentro de su densidad).

### 19.6 Documentar excepciones

Toda excepción a este documento se anota en Design Bible o PR — no se improvisan silenciosamente.

---

## 20. Cosas prohibidas (anti-patrones)

### 20.1 Visual / marca

- Look “AI default” púrpura o cream/terracotta genérico
- Dark mode gratuito sin tokens
- Glow excesivo, multi-shadow stacked, rounded-full pill clusters
- Emojis como iconos de interfaz
- Cards en hero / cards por default
- Badges flotantes y stickers sobre media
- Gradientes abstractos como única idea visual
- Glassmorphism global
- Neumorphism en Admin o flujos críticos

### 20.2 UX

- Scrolljacking
- Acciones críticas solo en hover
- Estados faltantes (empty/loading/error)
- Placeholders eternos / contenido ficticio en producción
- Modales en cascada
- Navegación impredecible entre Web y Admin patterns mezclados

### 20.3 Motion

- Animar todo
- Motion que bloquea tareas
- Ignorar `prefers-reduced-motion`
- Parallax pesado en Admin

### 20.4 Contenido

- Testimonios, métricas o logos inventados
- Lorem como diseño final
- Copy que promete lo que el sistema no hace

### 20.5 Ingeniería de UI

- Hex/spacing/radius fuera de tokens en UI de producto
- Componentes one-off que duplican `@pergon/ui`
- Contraste insuficiente por estética
- Tablas no usables en el viewport objetivo
- 3D decorativo permanente sin función

### 20.6 IA

- Antropomorfismo excesivo
- Ocultar incertidumbre
- Ejecutar acciones sensibles sin confirmación
- Estética “chatbot púrpura” como identidad PerGon

---

## 21. Checklist rápido de entrega UI

Antes de mergear cualquier pantalla:

- [ ] Intención de la pantalla clara (una tarea primaria)
- [ ] App correcta (Web / Admin) y densidad correcta
- [ ] Tokens usados; sin valores mágicos injustificados
- [ ] Jerarquía tipográfica y de color correcta
- [ ] Espaciado en escala 4/8
- [ ] Estados: default, hover, focus, loading, empty, error, disabled
- [ ] Contraste AA en texto e iconos esenciales
- [ ] Teclado + focus-visible
- [ ] `prefers-reduced-motion` respetado
- [ ] Motion dentro de presupuesto (no ruido)
- [ ] Glass/3D justificados o ausentes
- [ ] Sin anti-patrones de la §20
- [ ] Sin contenido ficticio
- [ ] Consistente con `@pergon/ui` y este documento

---

## 22. Relación con otros docs

| Documento                        | Rol                                            |
| -------------------------------- | ---------------------------------------------- |
| `PERGON_DESIGN_BIBLE.md`         | Fuente maestra de producto, sistema y dominio  |
| `UI_UX_PRINCIPLES.md` (este)     | Reglas obligatorias de UI/UX en implementación |
| `architecture.md` / docs de apps | Estructura técnica                             |

Si una regla de este archivo choca con una decisión futura del Design Bible, se actualiza este archivo — no se “ignora en silencio”.
