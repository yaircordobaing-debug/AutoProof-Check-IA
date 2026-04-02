export const inspectionData = [
    {
        category: "1. Automático (IA + Cámara)",
        icon: "fa-robot",
        items: [
            { id: "ia_fugas", name: "Fugas en el suelo", desc: "Detección de manchas o charcos de líquidos.", type: "IA-V", prompt: "Analiza el suelo debajo del motor en busca de fugas de aceite, refrigerante o combustible." },
            { id: "ia_vidrios", name: "Fisuras en vidrios", desc: "Integridad del parabrisas y ventanas.", type: "IA-V", prompt: "Busca grietas, astilladuras o impactos en el cristal del parabrisas." },
            { id: "ia_llantas", name: "Estado de llantas", desc: "Cortes, deformaciones o hernias.", type: "IA-V", prompt: "Evalúa el estado físico de la cara externa del neumático." },
            { id: "ia_luces", name: "Luces", desc: "Funcionamiento de faros y stops.", type: "IA-V", prompt: "Verifica que el faro esté encendido y sin roturas." },
            { id: "ia_documentos", name: "Documentos (OCR)", desc: "SOAT, revisión técnico-mecánica.", type: "IA-V", prompt: "Lee la fecha de vigencia y placa en el documento." }
        ]
    },
    {
        category: "2. Híbrido (Valor + Foto)",
        icon: "fa-gauge-high",
        items: [
            { id: "hy_presion", name: "Presión de llantas (PSI)", desc: "Medición con manómetro manual.", type: "VAL", unit: "PSI", prompt: "Captura una foto de la lectura del manómetro junto a la válvula." },
            { id: "hy_labrado", name: "Profundidad labrado (mm)", desc: "Medición con profundímetro.", type: "VAL", unit: "mm", prompt: "Foto del profundímetro insertado en la banda de rodamiento." },
            { id: "hy_aceite", name: "Nivel de aceite", desc: "Verificación de varilla de medición.", type: "VAL", unit: "%", prompt: "Foto de la punta de la varilla de aceite indicando nivel." }
        ]
    },
    {
        category: "3. Audio (IA-A)",
        icon: "fa-microphone-lines",
        items: [
            { id: "au_claxon", name: "Claxon", desc: "Prueba sonora de bocina.", type: "IA-A", prompt: "Graba 3 segundos del sonido del claxon." },
            { id: "au_motor", name: "Ruido del motor", desc: "Detección de ruidos metálicos.", type: "IA-A", prompt: "Graba el sonido del motor en ralentí." }
        ]
    },
    {
        category: "4. Manual (Sí / No)",
        icon: "fa-hand-pointer",
        items: [
            { id: "mn_frenos", name: "Frenos", desc: "¿El pedal se siente firme?", type: "USR" },
            { id: "mn_direccion", name: "Dirección", desc: "¿El giro es suave y preciso?", type: "USR" },
            { id: "mn_ac", name: "Aire acondicionado", desc: "¿Enfría correctamente?", type: "USR" }
        ]
    }
];
