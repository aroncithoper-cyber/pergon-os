# PerGon OS — Design Bible

> Documento maestro de diseño, producto y sistema.
> Completar cada sección conforme avance el proyecto.

---

## Índice

1. [Filosofía del proyecto](#1-filosofía-del-proyecto)
2. [Visión](#2-visión)
3. [Arquitectura](#3-arquitectura)
4. [Sistema de diseño](#4-sistema-de-diseño)
5. [Colores](#5-colores)
6. [Tipografía](#6-tipografía)
7. [Espaciados](#7-espaciados)
8. [Componentes](#8-componentes)
9. [Animaciones](#9-animaciones)
10. [Reglas de UI](#10-reglas-de-ui)
11. [Reglas UX](#11-reglas-ux)
12. [Accesibilidad](#12-accesibilidad)
13. [SEO](#13-seo)
14. [IA PerGon Expert](#14-ia-pergon-expert)
15. [Sistema QR](#15-sistema-qr)
16. [Pasaporte Digital](#16-pasaporte-digital)
17. [Panel Administrador](#17-panel-administrador)
18. [Automatizaciones](#18-automatizaciones)
19. [Base de datos](#19-base-de-datos)
20. [Seguridad](#20-seguridad)
21. [Convenciones de código](#21-convenciones-de-código)
22. [Checklist antes de hacer cualquier pantalla](#22-checklist-antes-de-hacer-cualquier-pantalla)

---

## 1. Filosofía del proyecto

### 1.1 Propósito

### 1.2 Principios fundacionales

### 1.3 Qué somos / qué no somos

### 1.4 Criterios de decisión

---

## 2. Visión

### 2.1 Visión a largo plazo

### 2.2 Objetivos de producto

### 2.3 Experiencia objetivo

### 2.4 Roadmap de alto nivel

---

## 3. Arquitectura

### 3.1 Visión general del monorepo

### 3.2 Apps

#### 3.2.1 Web

#### 3.2.2 Admin

### 3.3 Packages

#### 3.3.1 `@pergon/ui`

#### 3.3.2 `@pergon/config`

#### 3.3.3 `@pergon/database`

#### 3.3.4 `@pergon/shared`

#### 3.3.5 `@pergon/three`

### 3.4 Límites y dependencias

### 3.5 Capas de dominio

### 3.6 Integraciones externas

---

## 4. Sistema de diseño

### 4.1 Fundamentos

### 4.2 Tokens de diseño

### 4.3 Lenguaje visual

### 4.4 Densidad e jerarquía

### 4.5 Relación con shadcn/ui

### 4.6 Relación con Three.js / R3F

### 4.7 Relación con Framer Motion

---

## 5. Colores

### 5.1 Paleta principal

### 5.2 Paleta secundaria

### 5.3 Semántica (success, warning, error, info)

### 5.4 Fondos y superficies

### 5.5 Bordes y divisores

### 5.6 Modo claro / modo oscuro

### 5.7 Contraste y uso

---

## 6. Tipografía

### 6.1 Familias tipográficas

### 6.2 Escala tipográfica

### 6.3 Pesos

### 6.4 Interlineado

### 6.5 Jerarquía de títulos

### 6.6 Cuerpo y UI text

### 6.7 Reglas de uso

---

## 7. Espaciados

### 7.1 Escala de espaciado

### 7.2 Márgenes y paddings

### 7.3 Gaps y layouts

### 7.4 Contenedores y anchos máximos

### 7.5 Ritmo vertical

### 7.6 Breakpoints y responsividad

---

## 8. Componentes

### 8.1 Principios de composición

### 8.2 Componentes base (primitives)

### 8.3 Componentes de layout

### 8.4 Componentes de formulario

### 8.5 Componentes de feedback

### 8.6 Componentes de navegación

### 8.7 Componentes de datos

### 8.8 Componentes de dominio PerGon

### 8.9 Variantes y estados

### 8.10 Dónde vive cada componente

---

## 9. Animaciones

### 9.1 Principios de motion

### 9.2 Timing y easing

### 9.3 Microinteracciones

### 9.4 Transiciones de página

### 9.5 Motion 3D (R3F)

### 9.6 Framer Motion — convenciones

### 9.7 Reducción de movimiento

---

## 10. Reglas de UI

### 10.1 Composición de pantalla

### 10.2 Jerarquía visual

### 10.3 Uso de cards y contenedores

### 10.4 Iconografía

### 10.5 Imágenes y media

### 10.6 Estados vacíos, carga y error

### 10.7 Densidad en Admin vs Web

### 10.8 Prohibiciones de UI

---

## 11. Reglas UX

### 11.1 Flujos principales

### 11.2 Claridad y reducción de fricción

### 11.3 Feedback al usuario

### 11.4 Navegación y wayfinding

### 11.5 Formularios y validación

### 11.6 Progressive disclosure

### 11.7 Errores recuperables

### 11.8 Prohibiciones de UX

---

## 12. Accesibilidad

### 12.1 Estándares objetivo

### 12.2 Teclado y foco

### 12.3 Semántica HTML / ARIA

### 12.4 Contraste y color

### 12.5 Texto alternativo y media

### 12.6 Formularios accesibles

### 12.7 Motion y vestibular

### 12.8 Checklist de accesibilidad

---

## 13. SEO

### 13.1 Alcance SEO (Web vs Admin)

### 13.2 Metadata y Open Graph

### 13.3 Estructura de URLs

### 13.4 Contenido indexable

### 13.5 Performance y Core Web Vitals

### 13.6 Sitemap y robots

### 13.7 Schema / datos estructurados

---

## 14. IA PerGon Expert

### 14.1 Rol y propósito

### 14.2 Capacidades

### 14.3 Límites y no-objetivos

### 14.4 Experiencia de conversación

### 14.5 Contexto y conocimiento

### 14.6 Integración en Web

### 14.7 Integración en Admin

### 14.8 Seguridad y privacidad de prompts

### 14.9 Métricas de calidad

---

## 15. Sistema QR

### 15.1 Propósito

### 15.2 Tipos de QR

### 15.3 Generación

### 15.4 Escaneo y validación

### 15.5 Ciclo de vida

### 15.6 Relación con Pasaporte Digital

### 15.7 UI de QR

### 15.8 Reglas operativas

---

## 16. Pasaporte Digital

### 16.1 Concepto

### 16.2 Identidad digital

### 16.3 Datos que contiene

### 16.4 Estados del pasaporte

### 16.5 Emisión y renovación

### 16.6 Visualización (Web / móvil)

### 16.7 Relación con QR

### 16.8 Privacidad y consentimiento

---

## 17. Panel Administrador

### 17.1 Rol del Admin en PerGon OS

### 17.2 Principios de operación

### 17.3 Arquitectura de información

### 17.4 Módulos previstos

#### 17.4.1 Auth

#### 17.4.2 Users

#### 17.4.3 Settings

#### 17.4.4 Módulos futuros

### 17.5 Shell del dashboard

### 17.6 Permisos y roles

### 17.7 Densidad y productividad

### 17.8 Reglas específicas de Admin

---

## 18. Automatizaciones

### 18.1 Principios

### 18.2 Triggers

### 18.3 Flujos automatizados

### 18.4 Notificaciones

### 18.5 Jobs y colas

### 18.6 Observabilidad

### 18.7 Fallos y reintentos

### 18.8 Gobernanza

---

## 19. Base de datos

### 19.1 Supabase — rol en el sistema

### 19.2 Modelo de datos (alto nivel)

### 19.3 Convenciones de esquema

### 19.4 Migraciones

### 19.5 RLS y políticas

### 19.6 Tipos tipados (`@pergon/database`)

### 19.7 Clientes browser / server

### 19.8 Backups y entornos

---

## 20. Seguridad

### 20.1 Principios

### 20.2 Autenticación

### 20.3 Autorización

### 20.4 Secrets y variables de entorno

### 20.5 Datos sensibles

### 20.6 Superficie de ataque

### 20.7 Auditoría y logs

### 20.8 Checklist de seguridad

---

## 21. Convenciones de código

### 21.1 Stack y tooling

### 21.2 Naming

### 21.3 Estructura de carpetas

### 21.4 Features vs components

### 21.5 TypeScript

### 21.6 Imports y aliases

### 21.7 ESLint / Prettier / Husky

### 21.8 Commits y PRs

### 21.9 Testing (cuando aplique)

### 21.10 Documentación en código

---

## 22. Checklist antes de hacer cualquier pantalla

### 22.1 Propósito de la pantalla

### 22.2 Usuario y contexto

### 22.3 App correcta (Web / Admin)

### 22.4 Alineación con filosofía y visión

### 22.5 Tokens de diseño (color, tipo, espacio)

### 22.6 Componentes reutilizables vs nuevos

### 22.7 Estados (loading, empty, error, success)

### 22.8 Motion

### 22.9 Accesibilidad

### 22.10 SEO (si aplica)

### 22.11 Datos y seguridad

### 22.12 Alcance mínimo viable

### 22.13 Aprobación / listo para implementar

---

## Apéndices

### A. Glosario

### B. Referencias internas

### C. Historial de cambios del documento
