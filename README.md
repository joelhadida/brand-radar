# Brand Radar 🎯

**Sistema automatizado de análisis de marcas y generación de propuestas de marketing**

Powered by Claude AI + ITO Agency 360 + Prohibido Tomar En Serio

---

## 🌟 Características

- ✅ **Análisis automático** de presencia digital en 6 redes sociales
- ✅ **Viability Score** (0-100) para identificar oportunidades reales
- ✅ **Propuestas personalizadas** generadas por IA en segundos
- ✅ **Dashboard** con historial y estadísticas de conversión
- ✅ **Base de datos** para guardar todos los análisis
- ✅ **Almacenamiento de propuestas** listas para enviar

---

## 🚀 Inicio rápido

### Requisitos previos
- Node.js 18+
- npm o yarn
- Cuentas en: Anthropic (Claude API), Supabase

### 1. Clonar y instalar

```bash
git clone https://github.com/tu-usuario/brand-radar.git
cd brand-radar

# Instalar dependencias
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Configurar variables de entorno

```bash
# Copiar template
cp .env.example backend/.env.local
cp .env.example frontend/.env.local

# Editar con tus credenciales
nano backend/.env.local
nano frontend/.env.local
```

**Variables necesarias:**
- `CLAUDE_API_KEY` → https://console.anthropic.com/
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` → https://supabase.com/
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase Dashboard

### 3. Configurar base de datos

```bash
# En Supabase SQL Editor, ejecutar:
# /backend/migrations/001_initial_schema.sql
```

### 4. Desarrollo local

```bash
npm run dev
```

Abre:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 📚 Stack Técnico

| Componente | Tecnología |
|-----------|-----------|
| Frontend | Next.js 14 + React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL) |
| IA | Claude API (Haiku + Sonnet) |
| Hosting | Vercel + Railway |

---

## 📁 Estructura

```
brand-radar/
├── frontend/               # Next.js App
│   ├── app/               # Pages
│   ├── components/        # React Components
│   └── package.json
├── backend/               # Express Server
│   ├── src/
│   │   ├── routes/        # API Endpoints
│   │   ├── services/      # Business Logic
│   │   └── types/         # TypeScript Types
│   └── migrations/        # SQL Schemas
├── DEPLOYMENT.md          # Guide for production
└── CLAUDE.md             # Architecture docs
```

---

## 🔄 Flujo Principal

```
1. Usuario escribe marca → Buscar
2. Backend:
   - Claude extrae datos de redes sociales
   - Claude analiza viabilidad (score 0-100)
   - Guarda análisis en BD
3. Frontend muestra:
   - Métricas por red (Instagram, TikTok, YouTube, etc)
   - Score de viabilidad
   - Problemas identificados
4. Si viable:
   - Claude genera propuesta personalizada
   - Usuario aprueba o rechaza
5. Post-aprobación (próximamente):
   - Generar PDF con diseño profesional
   - Enviar por email a cliente
```

---

## 📊 Dashboard

Accede a `/dashboard` para ver:
- Total de análisis realizados
- Tasa de conversión (viable vs no viable)
- Historial de propuestas
- Status de cada análisis (borrador, enviada, etc)

---

## 🚀 Deployment

Ver **DEPLOYMENT.md** para instrucciones detalladas:

```bash
# Resumen rápido:
1. Push a GitHub
2. Deploy Frontend → Vercel
3. Deploy Backend → Railway
4. Configurar variables de entorno
5. Test en producción
```

---

## 📝 Variables de Entorno

```bash
# Backend
CLAUDE_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
NODE_ENV=production
PORT=3001
PROGRAM_NAME=Prohibido Tomar En Serio
AGENCY_NAME=ITO Agency 360

# Frontend
NEXT_PUBLIC_BACKEND_URL=https://brand-radar-backend.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🔐 Seguridad

- ✅ API Keys en variables de entorno (.env no versionado)
- ✅ CORS habilitado con control de dominios
- ✅ Database queries parametrizadas (sin SQL injection)
- ✅ Validación de inputs en backend

---

## 📞 Próximas Fases

### Fase 2: PDF + Email (con diseños)
- Generación de PDF con Claude Design
- Base de templates profesionales
- Envío automático por Resend
- Tracking de conversiones

### Fase 3: Autenticación
- Login de usuarios
- Roles (Comercial, Admin)
- Historial personal de propuestas

### Fase 4: Integraciones
- CRM (HubSpot, Pipedrive)
- Webhooks para notificaciones
- API pública para partners

---

## 🙋 Soporte

Para preguntas o issues:
1. Revisa CLAUDE.md para contexto técnico
2. Revisa DEPLOYMENT.md para problemas de deploy
3. Contacta a Joel: joel.hadida@ito.digital

---

## 📄 Licencia

Propietario de ITO Agency 360

---

**Creado con ❤️ usando Claude AI**
