# AutoProof Check IA - Especificación de Sistema y Arquitectura (Enterprise)

Este documento detalla la arquitectura y el diseño funcional de la plataforma AutoProof Check IA, optimizada para la gestión de flotas y cumplimiento legal-tech.

---

## 1. Arquitectura del Sistema
**Objetivo:** Alta disponibilidad, funcionamiento offline, inmutabilidad legal e integración de IA multisensorial.

- **Frontend (PWA):** Aplicación Vanilla JS optimizada con **arquitectura basada en estados**. Enfoque **Mobile-First** con diseño premium (Glassmorphism & HSL Color Tokens).
- **Backend (Serverless/Python):** FastAPI para procesamiento de reportes y orquestación de IA.
- **Motores de Validación:** 
  - **IA-Visual (Gemini Vision API):** Análisis de daños, fugas y OCR.
  - **IA-Audio:** Detección de patrones anómalos en motor y claxon.
  - **Telemetría OBD-II:** Conexión vía Bluetooth para lectura de ECUs.

---

## 2. Métodos de Validación (Core Logic)
Cada componente del vehículo se clasifica mediante etiquetas de validación:

1.  **🤖 IA-V (Visión Artificial):** Análisis automático de imágenes (ej. fisuras, neumáticos).
2.  **🔊 IA-A (Audio):** Análisis de sonido para motor y vibraciones.
3.  **🔌 OBD (Sensores):** Lectura directa de la computadora del auto.
4.  **👤 USR (Manual):** Preguntas binarias (Sí/No) para el conductor.
5.  **📊 VAL (Numérico):** Captura de valores (PSI, mm) con evidencia fotográfica.
6.  **📸 EVD (Evidencia):** Captura de foto obligatoria sin análisis IA profundo.
7.  **⚖️ LEG (Legal):** Bypass de responsabilidad bajo firma digital.

---

## 3. Matriz de Inspección (Flujo Operativo)

| Categoría | Ítem | Método Principal | Requisito de Evidencia |
| :--- | :--- | :--- | :--- |
| **Automático** | Fugas, Llantas, Luces | IA-V | Foto (Visor Guiado) |
| **Híbrido** | Presión de Llantas, Aceite | VAL + EVD | Valor Numérico + Foto |
| **Audio** | Claxon, Ruido Motor | IA-A | Grabación de Audio |
| **Manual** | Frenos, Dirección, AC | USR | Confirmación (Opc. LEG) |

---

## 4. Flujo Legal Anti-Fraude (Regla de Bypass)
Si la IA no es concluyente o el sensor falla, se activa el flujo **LEG**:

1.  **Trigger:** El usuario pulsa "Verificado bajo mi responsabilidad".
2.  **Acción Obligatoria:**
    - Checkbox de aceptación de términos legales.
    - Firma digital táctil (Biometría de trazo).
    - Comentario de justificación.
3.  **Consecuencia:** El sistema marca el ítem con estatus **VALIDACIÓN MANUAL** y genera una bandera de riesgo en el reporte final para la aseguradora/empresa.

---

## 5. Diseño de Experiencia (UX Designer)
- **Wizard Step-by-Step:** Evita la sobrecarga cognitiva agrupando ítems por zonas del vehículo.
- **Visual Feedback:** Uso de HSL para estados:
  - `Cumple`: Verde Esmeralda (H: 158).
  - `No Cumple`: Rojo Coral (H: 354).
  - `LEG`: Ámbar Dorado (H: 45).
- **Captura Guiada:** Siluetas superpuestas en la cámara para asegurar el ángulo correcto de la foto.

---

## 6. Estructura del Reporte Legal Final
Exportación en PDF con secciones diferenciadas:
1.  **Dashboard de Puntaje:** Score 0-100 calculado por criticidad de fallos.
2.  **Matriz de Evidencias:** Thumbnails de fotos con resultados de IA.
3.  **ANEXO CRÍTICO A (Waivers):** Sección resaltada con todas las validaciones manuales/LEG, incluyendo la firma y el texto de exención de responsabilidad empresarial.
4.  **Huella Digital:** Hash SHA-256 de integridad y Timestamp GPS incrustado.
