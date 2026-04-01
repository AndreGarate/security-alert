# 🛡️ Alerta Segura — Guía de Configuración Local

## ✅ Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Python | 3.8+ | python.org |
| Node.js | 16+ | nodejs.org |
| MongoDB | 6+ | mongodb.com/try/download/community |
| Expo Go (celular) | Última | App Store / Play Store |

---

## 🗂️ Estructura del proyecto

```
alerta-segura/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── analyze-message.tsx
    │   ├── analyze-url.tsx
    │   ├── analyze-image.tsx
    │   ├── training.tsx
    │   └── history.tsx
    ├── package.json
    ├── app.json
    └── .env
```

---

## 🚀 Paso 1: Configurar el Backend

Abre una terminal y navega a la carpeta backend:

```bash
cd alerta-segura/backend

# 1. Crear entorno virtual
python -m venv venv

# 2. Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# 3. Instalar dependencias normales
pip install -r requirements.txt

# 4. Instalar la librería de Emergent (índice especial)
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# 5. Iniciar el servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

✅ Verifica que funciona abriendo en tu navegador: http://localhost:8001/api/health

---

## 📱 Paso 2: Configurar el Frontend

Abre UNA NUEVA terminal (deja el backend corriendo):

```bash
cd alerta-segura/frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar Expo
npx expo start
```

---

## 📲 Paso 3: Ver la app en tu celular

1. Instala **Expo Go** en tu celular desde la App Store o Play Store
2. Asegúrate de que tu celular y tu PC estén en la **misma red WiFi**
3. Escanea el QR que aparece en la terminal con la cámara (iOS) o con Expo Go (Android)

### ⚠️ Si usas dispositivo físico (no emulador)

Necesitas cambiar la IP en `frontend/.env`:

```env
# Reemplaza 192.168.1.XXX con la IP de tu PC en la red WiFi
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:8001
```

Para saber tu IP:
- Windows: ejecuta `ipconfig` en cmd → busca "Dirección IPv4"
- Mac/Linux: ejecuta `ifconfig` → busca la IP de tu red

---

## 🗄️ MongoDB

El backend necesita MongoDB corriendo. Opciones:

### Opción A: MongoDB local (más fácil)
Instala MongoDB Community desde: https://www.mongodb.com/try/download/community
Una vez instalado, se inicia automáticamente como servicio.

### Opción B: MongoDB Atlas (nube gratuita)
1. Crea cuenta en https://www.mongodb.com/atlas
2. Crea un cluster gratuito (M0)
3. Copia la connection string
4. Reemplaza en `backend/.env`:
   ```
   MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/
   ```

---

## 🔧 Variables de entorno

### backend/.env
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=alerta_segura_db
EMERGENT_LLM_KEY=sk-emergent-80b343479AeDf1589B
VIRUSTOTAL_API_KEY=REDACTED
```

### frontend/.env
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

---

## ❗ Problemas comunes

**"ModuleNotFoundError: No module named 'emergentintegrations'"**
```bash
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

**"Network request failed" en la app**
- Verifica que el backend esté corriendo (http://localhost:8001/api/health)
- Si usas dispositivo físico, usa la IP de tu PC en lugar de "localhost"

**La app no carga en Expo Go**
- Asegúrate de estar en la misma red WiFi
- Prueba ejecutando: `npx expo start --tunnel`
