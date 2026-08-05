# PerGon — Iconography Guide

> Sistema de iconografía PerGon.  
> Los iconos **clarifican acción y estado**; no decoran.

---

## 1. Estilo oficial

| Parámetro  | Decisión                                                 |
| ---------- | -------------------------------------------------------- |
| Familia    | Lucide (SVG) / equivalentes outline del Design System    |
| Trazo      | Outline, **1.5–2 px** a tamaño 16–24                     |
| Esquinas   | Consistentes con radio del set (ligeramente redondeadas) |
| Relleno    | Evitar fill salvo estados activos inequívocos            |
| Grid       | Óptico 24×24 (o 16×16 en densidades Admin)               |
| Alineación | Centro óptico; no “casi alineado”                        |

Una sola familia por superficie. No mezclar filled Material con outline Lucide.

---

## 2. Grosor y tamaño

| Contexto                    | Tamaño                                              | Stroke |
| --------------------------- | --------------------------------------------------- | ------ |
| Admin table / chrome        | 16 px                                               | 1.5–2  |
| Botones UI                  | 16–20 px                                            | 2      |
| Web nav / marketing puntual | 20–24 px                                            | 2      |
| Señalética / stand          | Escalar stroke proporcionalmente; no pixelar raster |

Icono solo (sin label) únicamente si el significado es inequívoco (cerrar, buscar, menú).

---

## 3. Color

- Default: `foreground` / `muted-foreground`.
- Hover/active: tokens de sistema.
- Semántica: success / warning / destructive / info **solo** para estado.
- Nunca iconos multicolor arcoíris ni duotone moda.

---

## 4. Consistencia semántica

| Concepto              | Tratamiento                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| Pasaporte / identidad | Preferir componente de dominio (`PassportBadge`) antes que icono genérico “id card” |
| QR                    | Preferir `QrViewer` / glifo estructural; icono “qr” solo en navegación              |
| Verificar             | Check / shield solo si no diluye el dictamen tipográfico                            |
| Admin acciones        | Iconos de acción estándar (plus, filter, download) + label en acciones críticas     |

No inventar pictogramas de “química” (matraz, molécula) como identidad.

---

## 5. Densidad por superficie

- **Web:** pocos iconos; tipografía lidera.
- **Admin:** iconos densos OK; siempre con tooltip/`aria-label` si no hay texto.
- **Verify:** casi cero iconos decorativos.
- **Expert:** feedback (útil / no útil) outline ghost; sin avatar robot.

---

## 6. Accesibilidad

- Contraste AA en iconos esenciales.
- `aria-hidden` si hay label visible; `aria-label` si el icono es el control.
- No transmitir información solo por color del icono.

---

## 7. Uso incorrecto

- Emoji como icono UI.
- Icon packs mezclados.
- Glow, drop shadow, 3D bevel en iconos.
- Iconos > 24 en toolbars sin necesidad.
- Ilustraciones disfrazadas de iconos en tablas.

---

## 8. Checklist

- [ ] ¿Misma familia y stroke?
- [ ] ¿Tamaño de superficie correcto?
- [ ] ¿Label o aria adecuado?
- [ ] ¿Sin emoji / sin química clipart?
- [ ] ¿Estado semántico solo cuando aplica?
