# PerGon — Brand System

> Guía oficial de identidad de marca.  
> Fuente de verdad junto a `PERGON_DESIGN_BIBLE.md`, `UI_UX_PRINCIPLES.md` y `ART_DIRECTION.md`.  
> No es un kit de marketing genérico: es la identidad de una **plataforma tecnológica** de confianza, trazabilidad e identidad digital.

---

## 1. Esencia de marca

### 1.1 Qué es PerGon

PerGon es el sistema operativo de producto: Pasaporte Digital, QR, verificación, operación y PerGon Expert.  
La marca vende **confianza tecnológica**, no commodities químicos.

### 1.2 Personalidad

| Atributo          | Significa                                           | No significa                             |
| ----------------- | --------------------------------------------------- | ---------------------------------------- |
| Precisión         | Alineación, estados claros, tipografía disciplinado | Frialdad inhumana                        |
| Confianza         | Verificable, solemne, honesto                       | Claims vacíos o “premium” decorativo     |
| Tecnología        | Plataforma, identidad digital, trazabilidad         | Gadgets, neón, “AI glow”                 |
| Industrial limpio | Materiales reales, orden, control                   | Suciedad estética o laboratorio de stock |
| Calma operativa   | Espacio, ritmo, claridad                            | Vacío sin jerarquía                      |

### 1.3 Promesa

Cada unidad física puede tener una identidad digital verificable.  
Lo que no se puede verificar no se exhibe como certeza.

### 1.4 Tono verbal (marca)

- Directo, técnico cuando hace falta, nunca jerga de ferretería genérica.
- Web: claridad + dignidad.
- Admin: precisión operativa.
- Verify: institucional, inequívoco.
- Expert: especialista, no chatbot.

---

## 2. Logo

### 2.1 Concepto

El logotipo PerGon es **tipográfico**: la palabra “PerGon” en la tipografía de marca, tracking cerrado, peso semibold.  
No depende de un símbolo ornamental para reconocerse.

### 2.2 Wordmark

- Lectura: **PerGon** (P y G mayúsculas; resto según casing oficial).
- No deformar, no estirar, no outline decorativo.
- Color preferente: **Ink** (`foreground` / negro casi puro) sobre claro; **Paper** sobre oscuro.
- Nunca degradados en el wordmark.

### 2.3 Isotipo / monograma

- Forma primaria del isotipo: **PG** en monograma tipográfico (misma familia que el wordmark), en caja o sin caja.
- Uso: favicon, app icon, sidebar colapsado, avatar de sistema, sello pequeño en packaging.
- El isotipo no sustituye al wordmark en firmas institucionales de primer contacto (hero Web, portadas, stands principales).

### 2.4 Zona de seguridad

- Mínimo: altura de la **“P”** del wordmark en todos los lados.
- Isotipo: mínimo = ¼ del diámetro/caja del monograma en todos los lados.
- Nada de texto, iconos, QR o fotografía invade esa zona.

### 2.5 Tamaños mínimos

| Soporte                    | Wordmark                   | Isotipo                                       |
| -------------------------- | -------------------------- | --------------------------------------------- |
| Digital UI                 | 80 px de ancho útil        | 16×16 px (favicon); 24×24 preferido en chrome |
| Impresión                  | 20 mm de ancho             | 8 mm de lado                                  |
| Bordado / vehículo (lejos) | Preferir wordmark ≥ 120 mm | Isotipo solo si distancia lo exige            |

### 2.6 Versiones oficiales

1. **Wordmark horizontal** — default.
2. **Wordmark + isotipo** — bloque de firma (isotipo a la izquierda, espacio = media altura de P).
3. **Isotipo solo** — espacios mínimos / iconos.
4. **Reversed** — ink invertido sobre fondos oscuros o fotografía controlada.
5. **Mono** — una tinta (negro o blanco) para grabado, bordado, flexografía limitada.

### 2.7 Uso correcto

- Contraste AA o superior sobre el fondo.
- Alineado a rejilla; baseline tipográfica estable.
- Junto a Pasaporte / QR: el artefacto de dominio puede liderar; el logo firma sin competir.
- En Admin: wordmark corto o “PerGon” en chrome; no hero de marketing.

### 2.8 Uso incorrecto (prohibido)

- Rotar, sesgar, extruir o aplicar 3D al logo.
- Glow, sombra multicapa, bevel, glass sobre el wordmark.
- Colores fuera de paleta (púrpura, neón, arcoíris).
- Contorno, stroke decorativo, relleno con foto.
- Wordmark dentro de shapes no oficiales (nube, hexágono “tech”, escudo genérico).
- Combinar con tipografías genéricas (Inter/Roboto/Arial) como si fueran marca.
- Reconstruir el logo “de memoria” con otra fuente.
- Animar el logo con bounce, pulse infinito o morphing.

### 2.9 Coexistencia con otras marcas

- En co-branding: PerGon a la izquierda o arriba; separador hairline; zona de seguridad intacta.
- Nunca fusionar monogramas.

---

## 3. Paleta de color

Alineada a tokens de `@pergon/ui` (`globals.css`). Los valores HSL son referencia de marca; en producto se usan tokens, no hex sueltos.

### 3.1 Primaria (marca / acción)

| Nombre      | Rol                         | Light (aprox.)        | Dark (aprox.)     |
| ----------- | --------------------------- | --------------------- | ----------------- |
| **Ink**     | Texto, logo, CTA primario   | `0 0% 4%` – `0 0% 9%` | Invertido a paper |
| **Paper**   | Fondo canvas, logo reversed | `0 0% 100%`           | —                 |
| **Primary** | Acción dominante            | Ink                   | Paper             |

Un acento cromático de marca **no** es necesario: la identidad es monocromática con semántica puntual.

### 3.2 Secundaria / superficies

| Nombre             | Token                     | Uso                                |
| ------------------ | ------------------------- | ---------------------------------- |
| Panel              | `--panel`                 | Capítulos, bandas, Verify solemn   |
| Elevated           | `--elevated`              | Capas sobre panel                  |
| Secondary / Accent | `--secondary`, `--accent` | Controles secundarios, hover sutil |
| Border             | `--border`                | Separación, rejilla stage          |
| Muted FG           | `--muted-foreground`      | Soporte, metadata                  |

### 3.3 Neutros (escala)

De paper → panel → border → muted → ink.  
Prohibido introducir grises azules “cool SaaS” o cremas terracotta.

### 3.4 Semánticos (solo estado)

| Token           | Uso                           |
| --------------- | ----------------------------- |
| `--destructive` | Error, peligro, revocación    |
| `--success`     | Válido, activo OK             |
| `--warning`     | Atención, vencimiento próximo |
| `--info`        | Información neutra de sistema |

Semántica **nunca** sustituye al logo ni pinta el hero.

### 3.5 Reglas de color

- Web: atmósfera con superficies y tipografía, no con saturación.
- Admin: color casi solo semántico + ink.
- Verify: monocromo + status badge.
- Fotografía/3D: materiales reales; color de producto controlado, no filtros Instagram.

### 3.6 Prohibido

- Purple-on-white / purple→indigo.
- Cream + terracotta “AI luxury”.
- Neón, duotonos moda, mesh gradients como identidad.
- Más de un acento cromático compitiendo en la misma vista.

---

## 4. Tipografía

### 4.1 Familias oficiales

| Rol                   | Familia                                                | Notas                                       |
| --------------------- | ------------------------------------------------------ | ------------------------------------------- |
| **Sans (UI + marca)** | Geist Sans (o equivalente geométrico-neutral aprobado) | Wordmark, headings, body                    |
| **Mono**              | Geist Mono                                             | IDs, QR metadata, timestamps, KPIs, códigos |

Máximo **dos familias** en una pieza. Sin Inter/Roboto/Arial como identidad.

### 4.2 Roles

| Rol            | Uso                                         | Tracking                        |
| -------------- | ------------------------------------------- | ------------------------------- |
| **Display**    | Marca en hero, nombre de producto dominante | Muy cerrado (`letter-brand`)    |
| **Headings**   | H1–H3, títulos de capítulo                  | Tight                           |
| **Body**       | Párrafos, soporte                           | Normal / leve negativo en ledes |
| **Small / UI** | Labels, nav, captions                       | Normal                          |
| **Mono**       | Datos, pasaporte publicId, escaneos         | Tabular nums cuando aplique     |

### 4.3 Escala (referencia producto)

xs → sm → base → lg → xl → 2xl → 3xl → 4xl → display  
(Ver tokens `--font-size-*`.)

### 4.4 Pesos

- Semibold (600) para marca y headings.
- Regular/medium para body y UI.
- Evitar black/900 en bloques largos.

### 4.5 Reglas

- Una línea de display no compite con el wordmark: en hero, **marca primero**.
- All-caps solo en labels cortos (tracking amplio, ≤ 3–4 palabras).
- Longitud de línea cuerpo Web ~45–75 caracteres.
- Admin: menos display, más UI consistente.

---

## 5. Forma, radio y elevación

- Radio de sistema: **pequeño** (tech precision), no “pill SaaS”.
- Bordes hairline preferibles a sombras pesadas.
- Sombras: solo overlay/modal; nunca identidad.
- Grid stage opcional en planos visuales Web (`surface-stage` conceptual).

---

## 6. Artefactos de dominio (parte de la marca)

Estos no son “decoración”; son **símbolos de confianza**:

| Artefacto                    | Rol de marca                      |
| ---------------------------- | --------------------------------- |
| **Pasaporte Digital**        | Identidad de unidad; solemnidad   |
| **QR PerGon**                | Puerta de verificación            |
| **Status / Passport badges** | Estado legible, no stickers promo |

Reglas: contraste alto, tipografía mono en IDs, sin glow, sin stickers flotantes sobre el artefacto.

---

## 7. Aplicaciones (mapa)

Detalle en documentos hijos:

| Documento               | Contenido                                         |
| ----------------------- | ------------------------------------------------- |
| `ART_DIRECTION.md`      | Look & feel, composición, anti-patrones           |
| `PHOTOGRAPHY.md`        | Fotografía de producto y entorno                  |
| `ICONOGRAPHY.md`        | Iconos UI y señalética                            |
| `3D_GUIDE.md`           | Renders y motion 3D                               |
| `ILLUSTRATION_GUIDE.md` | Ilustración, motion 2D, video, packaging, entorno |

---

## 8. Gobernanza

1. Toda pieza nueva se valida contra este Brand System + `UI_UX_PRINCIPLES.md`.
2. Excepciones permanentes se documentan en Design Bible.
3. Assets finales de logo (SVG/PNG) se versionan en un bank de marca cuando existan; **esta guía define la identidad aunque el archivo maestro aún se produzca**.
4. Producto digital implementa identidad vía `@pergon/ui` tokens — no hex locales.

---

## 9. Checklist rápido

- [ ] ¿Se reconoce como PerGon sin leer el claim?
- [ ] ¿Logo/isotipo con zona de seguridad?
- [ ] ¿Paleta solo tokens / neutros + semántica?
- [ ] ¿Tipografía oficial (sans + mono)?
- [ ] ¿Sin look AI / plantilla SaaS / química genérica?
- [ ] ¿Pasaporte/QR tratados con dignidad?
- [ ] ¿Misma identidad en Web, Admin, packaging y redes?
