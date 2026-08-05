# PerGon — 3D Guide

> Guía oficial de render y motion 3D.  
> Implementación técnica en `@pergon/three` / R3F.  
> El 3D existe para **presencia o comprensión** del producto/sistema — no como wallpaper.

---

## 1. Cuándo usar 3D

| Sí                                                       | No                                           |
| -------------------------------------------------------- | -------------------------------------------- |
| Hero de producto cuando aporta volumen/material real     | Fondo ornamental permanente en Admin         |
| Explorar forma / tapa / etiqueta en experiencia producto | Scroll parallax 3D agresivo en mobile        |
| Demo de pasaporte/QR como objeto (si aporta)             | Escenas concurrentes con blur animado pesado |
| Idle loop suave de presencia                             | Simulación científica falsa                  |

---

## 2. Calidad de render

### 2.1 Target

- Aspecto **product visualization** de estudio: limpio, nítido, materiales honestos.
- Resolución de texturas adecuada al crop (evitar blur en etiqueta/QR).
- Anti-aliasing estable; sin shimmer excesivo.

### 2.2 Prohibido

- Estilo cartoon / clay / low-poly “tech startup 2014”.
- Bloom/glow excesivo, chromatic aberration de moda, film grain fuerte.
- HDRI de atardecer lifestyle.

---

## 3. Materiales

| Material         | Guía                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| Plástico botella | Roughness medio-alto mate o satinado según SKU real; specular contenido |
| Etiqueta         | Almost-diffuse + print sharpness; no plástico speclado irreal           |
| Metal / tapa     | Metalness realista; roughness según acabado (cepillado vs brillante)    |
| Líquido          | Solo si el SKU lo requiere; IOR/absorpión discretos; no gelatina neón   |
| Vidrio           | Claridad alta; reflections controladas                                  |

Principio: **material honesty** — el render no inventa un producto distinto al físico.

---

## 4. Iluminación

- Studio HDRI técnico (neutro) + 1–2 luces área.
- Key suave; fill bajo; rim fino opcional.
- Exposición estable entre shots de la misma familia de producto.
- Evitar colored lights de identidad (salvo semántica puntual justificada).

---

## 5. Reflexiones y entorno

- Reflection catcher / suelo sutil permitido.
- Entorno mínimo: ciclo / studio; no kitchens stock.
- Contact shadow suave; sin AO theatrical extremo.

---

## 6. Cámara

- Focal equivalente 50–85 mm para producto.
- Ángulo 3/4 hero; orthographic solo para diagramas técnicos.
- Profundidad de campo leve; sujeto siempre legible.
- Safe area para UI overlay (copy/CTA) en composiciones Web.

---

## 7. Animaciones 3D

| Tipo        | Uso           | Reglas                                               |
| ----------- | ------------- | ---------------------------------------------------- |
| Idle        | Presencia     | Rotación yaw muy lenta o float mínimo; loop seamless |
| Entrada     | Reveal        | Opacity/camera ease-out ≤ 600–800 ms; una vez        |
| Interacción | Orbit control | Solo si el usuario lo pide; no auto-spin agresivo    |
| Exploded    | Comprensión   | Justificado; labels tipográficos PerGon              |

Prohibido: bounce, shake, infinite pulse glow, camera shake.

Respetar `prefers-reduced-motion`: escena estática equivalente.

---

## 8. Performance

- Lazy load / dynamic import de escenas.
- No montar 3D si `model` está disabled o sin asset.
- Presupuesto: una escena 3D dominante por viewport.
- Mobile: degradar a still o reduce DPR antes que stutter.
- No combinar blur CSS animado + 3D pesado.

---

## 9. 3D y marca

- Wordmark no se extruye en 3D como logo “cool”.
- QR/pasaporte en 3D deben mantener legibilidad o ser claramente esquemáticos.
- Color del producto = SKU real; no recastear a púrpura de moda.

---

## 10. Entrega de assets

- Formatos preferidos: glTF/GLB optimizado.
- Texturas: power-of-two, comprimidas; atlas cuando ayude.
- Naming de dominio (`product`, `passport`, `qr`) — no `final_v3_new`.

---

## 11. Checklist

- [ ] ¿Aporta presencia o comprensión?
- [ ] ¿Materiales honestos?
- [ ] ¿Luz de estudio neutra?
- [ ] ¿Motion contenido + reduced-motion?
- [ ] ¿Performance aceptable en target device?
- [ ] ¿No montado en Admin por defecto?
