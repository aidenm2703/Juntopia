# Juntopia

Podés iniciar el proyecto desde esta misma carpeta, la que contiene `contexto.md`.

```powershell
# Sólo la primera vez o si faltan dependencias:
npm.cmd run setup

# Iniciar frontend y backend:
npm.cmd run dev
```

En PowerShell, `npm.cmd` evita el bloqueo que puede producir `npm.ps1` cuando la ejecución de scripts está deshabilitada. No hace falta cambiar la política de ejecución del equipo.

Frontend: **http://localhost:3000**. Backend: **http://127.0.0.1:4000**.

Si los servicios de Juntopia ya están abiertos, el comando muestra sus direcciones y los reutiliza. No cierra procesos ajenos. Si otro programa ocupa esos puertos, indica el conflicto.

El código conserva su separación en [frontend](Juntopia/frontend/README.md) y [backend](Juntopia/backend/README.md), dentro de `Juntopia/`. La raíz sólo proporciona comandos de acceso; también podés ejecutar `npm.cmd run dev` desde la carpeta interna.

Configuración y documentación completa: [Juntopia/README.md](Juntopia/README.md).
