<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=FFFFFF&height=220&section=header&text=midiPCcontrolPIANO&fontSize=52&fontColor=000000&animation=fadeIn&fontAlignY=38&desc=MIDI%20PC%20Controller%20%E2%80%94%20PIXELBITS%20Studio&descAlignY=58&descSize=20&descColor=222222" />

</div>

<div align="center">

[![MIDI](https://img.shields.io/badge/USB_MIDI-Class_Compliant-FFFFFF?style=for-the-badge&logo=musicbrainz&logoColor=000000&labelColor=111111)](https://github.com/Pacheco55/midiPCcontrolPIANO)
[![MQTT](https://img.shields.io/badge/MQTT-Broker_Local-FFFFFF?style=for-the-badge&logo=eclipse-mosquitto&logoColor=000000&labelColor=111111)](https://mosquitto.org)
[![IoT](https://img.shields.io/badge/IoT-ESP32_WS2812B-FFFFFF?style=for-the-badge&logo=espressif&logoColor=000000&labelColor=111111)](https://github.com/Pacheco55/midiPCcontrolPIANO)
[![Platform](https://img.shields.io/badge/Windows_%7C_Linux-FFFFFF?style=for-the-badge&logo=windows&logoColor=000000&labelColor=111111)](https://github.com/Pacheco55/midiPCcontrolPIANO)
[![Release](https://img.shields.io/github/v/release/Pacheco55/midiPCcontrolPIANO?style=for-the-badge&color=FFFFFF&labelColor=111111&logo=github&logoColor=000000)](https://github.com/Pacheco55/midiPCcontrolPIANO/releases/latest)

</div>

<div align="center">

**Convierte tu teclado CASIO en el centro de mando de tu PC, tu estudio, tu streaming y tu hogar inteligente.**

</div>

---

<div align="center">

### Las teclas del piano no son solo notas. Son comandos.

</div>

Un teclado de 61 teclas tiene más superficie de control que cualquier periférico de escritorio. **midiPCcontrolPIANO** convierte cada tecla, rueda, pedal y botón de banco del CTK-2400 en un disparador de acciones reales — en tu sistema operativo, en tus dispositivos IoT, en tu DAW y en tu setup de streaming — todo configurable desde una interfaz visual sin instalar nada, sin abrir ninguna terminal.

> **Descarga el ejecutable en [Releases](https://github.com/Pacheco55/midiPCcontrolPIANO/releases/latest), conecta el CTK-2400 por USB y abre el programa. Eso es todo.**

---

## Qué controla

<table>
<tr>
<td width="50%" valign="top">

### 🖥 Sistema operativo
Abrir o cerrar aplicaciones, atajos complejos de una sola pulsación, bloquear sesión, suspender equipo, minimizar o maximizar ventanas, capturas de pantalla completa o de área, escritura automática de texto y copia al portapapeles.

</td>
<td width="50%" valign="top">

### 🎵 Multimedia y producción
Play, pausa, siguiente pista, pista anterior, rebobinado y avance. Control de volumen del sistema con la rueda del teclado vía CC. Silencio instantáneo. Compatible con cualquier reproductor que responda a las teclas de media del sistema.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎸 Guitar Pro 8 + REAPER
A través de loopMIDI las partituras de Guitar Pro fluyen al CTK-2400 para sonar en hardware, o a REAPER para grabarse y procesarse. Canal configurable por pista desde la misma ventana.

</td>
<td width="50%" valign="top">

### 💡 Hogar inteligente y estudio IoT
Notas, CC y Program Change publican mensajes MQTT a cualquier topic. Control de tiras WS2812B, escenas de iluminación, brillo continuo con la rueda, toggle on/off y coordenadas RGB en tiempo real.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎬 Streaming y OBS Studio
Un toque cambia de escena en OBS vía MQTT, activa o desactiva fuentes, y dispara notificaciones del sistema con mensajes personalizados para coordinar eventos en directo.

</td>
<td width="50%" valign="top">

### 🖱 Mouse y navegación
Los controles continuos mueven el cursor en X e Y en relación al tamaño de la pantalla, ejecutan clics izquierdo, derecho y doble clic, y hacen scroll vertical con velocidad configurable.

</td>
</tr>
</table>

---

## La interfaz

```
┌─────────────────────────────────────────────────────────────────────┐
│  PIXELBITS Studio  •  midiPCcontrolPIANO  v5.0      ☀ Tema Claro   │
├──────────────┬────────────┬────────────┬───────────┬───────┬────────┤
│  🎹 Dashboard│  ⚙ MIDI   │  📡 MQTT  │  🗺 Mapeos│🚀 Init│ 📋 Log│
└──────────────┴────────────┴────────────┴───────────┴───────┴────────┘
```

| Pestaña | Contenido principal |
|---|---|
| **🎹 Dashboard** | Piano interactivo iluminado · Estadísticas en tiempo real · Uptime del motor · Selección de puertos MIDI con autodetección |
| **⚙ MIDI** | Canal de notas y CC · Transpose · Octave shift · 14 escalas musicales · Arpegiador con BPM · 8 banderas individuales |
| **📡 MQTT** | Broker con TLS y LWT · Publicador manual · Monitor en tiempo real · 12 botones de topics rápidos |
| **🗺 Mapeos** | Editor visual con 30 acciones para notas, CC y Program Change · Carga y exporta JSON |
| **🚀 Inicio** | Autostart con Windows · Motor automático al abrir · Inicio minimizado |
| **📋 Log** | Consola con color por severidad · Acceso al archivo persistente |

---

## Capturas

<div align="center">

| Dashboard activo | Editor de mapeos |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Mapeos](screenshots/mapeos.png) |
| *Piano interactivo con teclas mapeadas y estadísticas en tiempo real* | *30 acciones categorizadas con parámetros dinámicos por tipo* |

| Monitor MQTT | Tema claro |
|:---:|:---:|
| ![MQTT](screenshots/mqtt.png) | ![Light](screenshots/tema_claro.png) |
| *Suscriptor en tiempo real y topics rápidos del setup* | *Toggle instantáneo entre paleta oscura y clara* |

</div>

---

## Casos de uso

<table>
<tr>
<td width="50%" valign="top">

### 🎙 El estudio sin manos
Mientras grabas guitarra con ambas manos ocupadas, el pedal de sustain dispara Play en REAPER y la tecla más baja del piano arma o desarma la pista. Sin mouse, sin perder el take.

</td>
<td width="50%" valign="top">

### 📡 Streaming sincronizado
Intro del show: rainbow en los LEDs y escena de presentación en OBS. Drop del beat: luces rojo puro y corte a cámara frontal. Todo desde el mismo instrumento con el que estás tocando.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏠 Cabina de control del hogar
Las teclas del banco superior que no usas musicalmente se convierten en interruptores físicos: luz de escritorio, sala, modo concentración, modo noche. Sin pantallas, con respuesta inmediata.

</td>
<td width="50%" valign="top">

### 🎼 Guitar Pro como biblioteca en vivo
Setlistas en formato GP reproducidas al CTK-2400 via loopMIDI. El teclado suena con sus propios timbres y REAPER graba en paralelo. Un Program Change salta a la siguiente canción.

</td>
</tr>
</table>

---

<div align="center">

## Encuéntrame

[![GitHub](https://img.shields.io/badge/GitHub-Pacheco55-FFFFFF?style=for-the-badge&logo=github&logoColor=000000&labelColor=111111)](https://github.com/Pacheco55)
[![Instagram](https://img.shields.io/badge/Instagram-PIXELBITS-FFFFFF?style=for-the-badge&logo=instagram&logoColor=000000&labelColor=111111)](https://instagram.com)
[![YouTube](https://img.shields.io/badge/YouTube-PIXELBITS_Studio-FFFFFF?style=for-the-badge&logo=youtube&logoColor=000000&labelColor=111111)](https://youtube.com)
[![Twitch](https://img.shields.io/badge/Twitch-Live_Sessions-FFFFFF?style=for-the-badge&logo=twitch&logoColor=000000&labelColor=111111)](https://twitch.tv)
[![Email](https://img.shields.io/badge/Email-studiospixelbits%40gmail.com-FFFFFF?style=for-the-badge&logo=gmail&logoColor=000000&labelColor=111111)](mailto:studiospixelbits@gmail.com)

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=FFFFFF&height=120&section=footer&animation=fadeIn&fontColor=000000" />

**midiPCcontrolPIANO**

Desarrollado por **Julio César Pacheco Rojas**
PIXELBITS Studio © 2026

*Cada tecla tiene un propósito. Este es el tuyo.*

</div>
