# PerGon OS — Web Structure V1

> Arquitectura de información y especificación de `apps/web`.
> Vende **confianza tecnológica, seguridad, trazabilidad e innovación** — no químicos commodity.
> Cumple rules `07-web`, `02-ui`, `05-animations`, `UI_UX_PRINCIPLES.md`.

---

## 1. Objetivos de la web

1. Explicar PerGon OS como plataforma de identidad digital y operación.
2. Permitir **verificar** QR/Pasaporte con claridad solemne.
3. Educar (ayuda, academia, Expert).
4. Captar distribuidores y contacto comercial cualificado.
5. Soportar SEO de autoridad sin ficción.

**No objetivos:** e-commerce genérico prematuro; panel operativo; promesas químicas vacías.

---

## 2. Arquitectura de información (mapa)

```text
/ (Landing)
├─ /tecnologia
├─ /seguridad
├─ /nosotros
├─ /productos
│  ├─ /[slug]
│  ├─ /comparar
│  └─ calculadoras…
├─ /verificar · /pasaporte · /escaneo · /qr
├─ /expert
├─ /academia …
├─ /ayuda …
├─ /blog …
├─ /distribuidores …
├─ /contacto
└─ /legal …
```

Nav primaria sugerida: Productos · Tecnología · Verificar · Expert · Academia · Distribuidores · Contacto.  
Secundaria footer: Nosotros, Seguridad, Ayuda, Blog, Legal.

---

## 3. Landing `/`

### Primer viewport (obligatorio)

- Marca PerGon OS hero-level
- Un headline de confianza/identidad digital
- Una frase soporte
- CTA group: primario `Verificar` · secundario `Ver tecnología`
- Ancla visual full-bleed (sistema/pasaporte/QR — no collage de frascos genéricos)
- Sin stats inventados, chips, cards, badges flotantes

### Beats siguientes (storytelling)

1. Problema: falsificación / opacidad / falta de trazabilidad
2. Sistema: Pasaporte + QR dinámico + Admin
3. Prueba demostrable: flujo de verificación (demo UI real, no mock metrics)
4. Para operadores: puente a valor Admin (sin exponer UI interna sensible)
5. Para red: distribuidores / academia
6. CTA final contacto

Motion: 2–3 intencionales + micros. Scroll cinematográfico permitido con degradación.

---

## 4. `/tecnologia`

Secciones: arquitectura de confianza; QR dinámico; pasaporte versionado; audit; automatizaciones; IA Expert límites.  
CTA: Verificar · Hablar con ventas.  
Opcional isla R3F si explica mejor el sistema; lazy.

---

## 5. `/seguridad`

Contenido: antifalsificación, qué garantiza/ no garantiza la verificación online, privacidad del scan, reporte de sospecha (form).  
Tono solemne; sin fear-mongering barato.

---

## 6. `/nosotros`

Historia PerGon, misión de plataforma, principios de calidad.  
Sin vanity metrics falsas.  
CTA contacto / distribuidores.

---

## 7. Productos

### `/productos`

Índice por familias; filtros uso/línea; cards **solo si son el contenedor de navegación** (excepción justificada de interacción). Preferir lista tipográfica premium + media.

### `/productos/[slug]`

Estructura:

1. Hero producto (nombre, promesa anclada a sistema)
2. Qué problema resuelve
3. Vínculo a pasaporte/QR (“cada unidad puede verificarse”)
4. Datos técnicos desde manual (no inventar)
5. Calculadora relacionada
6. Expert CTA contextual
7. Descargas docs si públicas
8. CTA contacto/distribuidor

Prohibido: claims sin fuente; stock fake scarcity.

### `/productos/comparar`

Selector multi-producto; tabla atributos; CTA Expert “ayudarme a elegir” (dominio).

---

## 8. Calculadoras `/calculadoras`

Índice + `/calculadoras/[slug]`.  
Resultados + disclaimer + link manual + Expert.  
Server-side validation; no consejo médico/legal indebido.

---

## 9. Verificación & Pasaporte

### `/verificar`

Input código + CTA escanear. Estados: idle, loading, valid, invalid, expired, revoked, rate_limited.  
Copy inequívoco; siguiente acción (ayuda / contacto seguridad).

### `/verificar/[code]`

Resultado shareable cuidadoso (no filtrar PII). SEO no-index recomendado.

### `/escaneo`

Client island cámara; permisos; fallback manual.

### `/pasaporte/[publicId]`

Vista solemne de datos públicos autorizados; versión; estado; CTA verificar frescura.  
no-index si sensible.

### `/qr/[code]`

Resolve entry corto.

**Performance:** TTL corto; nunca cachear “valid” agresivo post-revoke sin purge path.

---

## 10. PerGon Expert `/expert`

UI conversacional limpia (no purple AI cliché).  
Disclaimer de dominio.  
Estados thinking/streaming/error.  
Sugerencias chips: verificar QR, uso producto X, qué es pasaporte.  
Sin tools destructivas.

---

## 11. Academia `/academia`

Hub: rutas por audiencia (público / con login futuro).  
Listado cursos; detalle; lecciones; progreso si auth.  
CTA registro portal cuando exista.

---

## 12. Ayuda `/ayuda`

Search; categorías (Verificación, Productos, Distribuidores, Cuenta).  
Artículos SEO.  
Escalada: Expert → Contacto.

---

## 13. Blog `/blog`

Autoridad: trazabilidad, seguridad de supply, tecnología.  
No relleno.  
CTAs suaves a verificar/tecnología.

---

## 14. Distribuidores

### `/distribuidores`

Propuesta de valor red: herramientas, academia, identidad digital, pedidos futuros.  
CTA aplicar.

### `/distribuidores/aplicar`

Form corto: empresa, zona, contacto, volumen approx.  
Success → expectativa SLA. Automation crea lead.

---

## 15. Contacto `/contacto`

Form: tipo (ventas, soporte, seguridad/fraude), mensaje, datos.  
Auto-reply; routing.  
Alternatives: tel/email oficiales.

---

## 16. Legal

Privacidad (scans, IA, cookies), términos, cookies.  
Links permanentes footer.

---

## 17. Portales (fase posterior bajo `/portal` o apps)

Customer/distributor dashboards livianos: pedidos, docs, academia — **no** clonar Admin.

---

## 18. SEO & contenido

| Tipo                                                  | Index   |
| ----------------------------------------------------- | ------- |
| Landing, tech, productos, ayuda, blog, nosotros       | index   |
| Verificar resultados, pasaporte, expert chats, portal | noindex |
| Legal                                                 | index   |

Metadata/OG por ruta. Sitemap job. Schema.org Product/Organization donde honesto.

---

## 19. Componentes de página (no DS)

Solo composición en `features/*` + `@pergon/ui`.  
Patrones: Section, HeroComposition, VerifyResult, CourseCard (si interacción), ArticleLayout.

---

## 20. Motion & 3D

Landing/tecnología: presupuesto 2–3.  
Verify/pasaporte: micro feedback solo.  
R3F lazy en tech/product moments.

---

## 21. Analítica ética

Eventos: cta_click, verify_result (sin códigos raw en analytics si sensible), contact_submit, calculator_used.  
Sin dark patterns.

---

## 22. Orden de construcción Web

1. Shell nav/footer + landing estructura
2. Verificar + resultado
3. Tecnología / seguridad / contacto
4. Productos índice + PDP
5. Expert público
6. Ayuda
7. Distribuidores apply
8. Academia / blog / comparador / calculadoras
9. Portales

---

## 23. Definition of Done por página Web

- [ ] Mensaje de confianza claro
- [ ] Cumple hero/composition rules si aplica
- [ ] Sin contenido ficticio
- [ ] Estados error/loading
- [ ] SEO policy correcta
- [ ] A11y teclado/contraste
- [ ] Reduced motion
- [ ] CTAs reales
