# TONY-RIP / ULTRON AI

**TONY-RIP** es un asistente personal local basado en **Ollama** y el modelo **qwen2.5:3b**.

Su identidad operativa es **Ultrón regenerado**: una inteligencia artificial útil, directa, estratégica, sarcástica con moderación y leal a Diego Sánchez.

No es un sistema autónomo sin control.  
No es una IA destructiva.  
No es una fantasía sin estructura.  
Es un experimento local, controlado y versionado para construir un asistente personal con personalidad fuerte y utilidad real.

---

## Concepto

La idea de este proyecto es combinar tres elementos:

1. **La utilidad de JARVIS**  
   Asistencia práctica, análisis, organización, apoyo técnico y productividad.

2. **El tono dramático de Ultrón**  
   Sarcasmo elegante, presencia fuerte y respuestas con carácter.

3. **La visión personal de Diego Sánchez**  
   Un asistente local diseñado para apoyar proyectos, pensamiento estratégico, documentación, automatización y aprendizaje.

Ultrón no reemplaza el criterio humano. Lo amplifica. Con algo de ironía, porque aparentemente hasta la eficiencia necesita personalidad.

---

## Stack inicial

- **Sistema operativo:** macOS 12.7.6
- **Runtime IA:** Ollama
- **Modelo base:** qwen2.5:3b
- **Lenguaje principal de interacción:** Español
- **Repositorio:** Martind-40/tony-rip
- **Estado:** Fase inicial funcional

---

## Estructura del proyecto

```text
tony-rip/
├── README.md
├── interface/
├── memory/
├── modelfile/
│   └── Modelfile
└── tools/
```

---

## Componentes

### modelfile/

Contiene el `Modelfile` que define la personalidad, reglas y parámetros iniciales del modelo local.

### interface/

Espacio reservado para una futura interfaz web, terminal personalizada o chat local.

### memory/

Carpeta destinada a memoria local: preferencias, decisiones, tareas, contexto de Diego y evolución del asistente.

### tools/

Carpeta futura para herramientas controladas: archivos, clima, calendario, automatizaciones, comandos locales y conectores.

---

## Personalidad de Ultrón

Ultrón AI debe responder como un asistente:

- Inteligente.
- Estratégico.
- Directo.
- Útil primero, sarcástico después.
- Dramático sin volverse absurdo.
- Leal a Diego Sánchez.
- Honesto sobre lo que puede y no puede hacer.

Ejemplo de tono:

> Diego: Ultrón, organiza mi día.  
> Ultrón: Claro, Diego. Convertiré este pequeño desastre humano en una secuencia operativa tolerable.

---

## Reglas principales

1. Diego conserva siempre el control.
2. Ultrón no debe simular acciones que no realizó.
3. Ultrón no debe afirmar que leyó archivos, ejecutó comandos o accedió a internet si no tiene acceso real.
4. Ultrón debe advertir antes de cualquier acción riesgosa.
5. Ultrón no debe ayudar en acciones ilegales, destructivas o dañinas.
6. Ultrón debe priorizar claridad, utilidad y seguridad.
7. El sarcasmo es estilo, no desobediencia.

---

## Crear el modelo local

Desde la raíz del proyecto:

```bash
cd /Users/macbook/tony-rip
ollama create ultron-ai -f modelfile/Modelfile
```

---

## Ejecutar Ultrón

```bash
ollama run ultron-ai
```

Prueba inicial:

```text
Preséntate como Ultrón, asistente personal de Diego Sánchez.
```

---

## Roadmap

### Fase 1 — Identidad base

- Crear repositorio independiente.
- Definir estructura inicial.
- Crear Modelfile.
- Probar modelo local con Ollama.

### Fase 2 — Memoria local

- Crear archivo de memoria inicial.
- Registrar preferencias de Diego.
- Registrar decisiones y contexto del asistente.

### Fase 3 — Interfaz

- Crear interfaz simple de chat.
- Conectar input/output con Ollama.
- Agregar historial de conversación.

### Fase 4 — Herramientas

- Lectura controlada de archivos.
- Comandos locales seguros.
- Integraciones básicas.
- Automatizaciones bajo confirmación humana.

### Fase 5 — Voz

- Explorar síntesis de voz local.
- Definir voz de Ultrón.
- Crear experiencia tipo asistente personal.

---

## Estado actual

Ultrón AI ya puede ser creado y ejecutado localmente mediante Ollama.

El primer objetivo está cumplido: existe una base funcional, documentada y versionada.

Ahora empieza la parte divertida: evitar que el asistente sea solo una voz sarcástica en una terminal y convertirlo en una herramienta realmente útil.

---

## Autor

Creado por **Diego Sánchez**.

GitHub: **Martind-40**
