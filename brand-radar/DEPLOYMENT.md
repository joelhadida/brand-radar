# Guía de Deployment: Brand Radar

Deployment de Brand Radar en Vercel (frontend) + Railway (backend).

---

## **PASO 1: Preparar el repositorio para GitHub**

```bash
cd /Users/jhadidab/Projects/workspace

# Crear repo en GitHub (vacío)
# https://github.com/new
# Nombre: brand-radar
# NO inicializar con README

# Agregar remote y push
git remote add origin https://github.com/TU_USUARIO/brand-radar.git
git branch -M main
git push -u origin main
```

---

## **PASO 2: Configurar variables de entorno**

Necesitarás estas keys en Vercel y Railway:

### **Frontend (Vercel)**
```
NEXT_PUBLIC_BACKEND_URL=https://brand-radar-backend.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### **Backend (Railway)**
```
CLAUDE_API_KEY=sk-ant-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
NODE_ENV=production
PROGRAM_NAME=Prohibido Tomar En Serio
AGENCY_NAME=ITO Agency 360
STREAM_VIEWERS=10000
```

---

## **PASO 3: Deploy Frontend en Vercel**

1. Ve a https://vercel.com/ y crea cuenta
2. Conecta tu GitHub
3. Importa repositorio `brand-radar`
4. Configura:
   - **Framework:** Next.js
   - **Root Directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `.next`
5. Agrega variables de entorno (Environment Variables)
6. Click **Deploy**

La app estará en: `https://brand-radar-xxxxxxx.vercel.app`

---

## **PASO 4: Deploy Backend en Railway**

1. Ve a https://railway.app/ y crea cuenta
2. Nuevo proyecto → GitHub
3. Autoriza y selecciona tu repo
4. Configura variables de entorno (Environment)
5. En Build:
   - **Working Directory:** `backend`
   - **Node Modules Cache:** ON
6. En Deploy:
   - **Start Command:** `npm run start`
7. Click **Deploy**

El backend estará en: `https://brand-radar-backend.up.railway.app`

---

## **PASO 5: Actualizar variables de Vercel**

Una vez que Railway haya deployado, actualiza en Vercel:

```
NEXT_PUBLIC_BACKEND_URL=https://brand-radar-backend.up.railway.app
```

Redeploy en Vercel.

---

## **PASO 6: Test en producción**

```bash
# Verifica que todo funciona
curl https://brand-radar-backend.up.railway.app/health
# Debe devolver: {"status":"ok"}
```

Abre: `https://brand-radar-xxxxxxx.vercel.app`

---

## **Troubleshooting**

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
# En Railway
npm install @supabase/supabase-js
git add package-lock.json
git push
```

### Error: "NEXT_PUBLIC_BACKEND_URL is undefined"
- Verifica que las variables estén en Vercel Environment Variables
- Redeploy en Vercel

### Error: "Connection refused to Supabase"
- Verifica SUPABASE_URL y SUPABASE_SERVICE_KEY
- Comprueba que Supabase proyecto está activo

---

## **Próximo: Integración de Claude Design para PDFs**

Una vez deployado, podemos conectar Claude Design para:
1. Generar PDFs con diseños profesionales
2. Seleccionar de una base de templates
3. Personalizar con logo de la marca

Esto será el **Paso 11** (PDF + Email con Diseños).
