# 🛡️ Alerta Segura - Security Alert Application

> A comprehensive mobile security application designed to detect and prevent cyber threats in real-time. Built for educational purposes and cybersecurity awareness.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![React Native](https://img.shields.io/badge/react--native-0.76+-blue)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

## 📱 Features

### 🔍 **Message Analysis**
- Detects phishing attempts and malicious text patterns
- Real-time classification: Safe ✅ / Suspicious ⚠️ / Dangerous 🚨
- AI-powered threat detection using Anthropic Claude

### 🔗 **URL Security Verification**
- Validates URLs before opening
- VirusTotal integration for threat intelligence
- Prevents drive-by downloads and malicious redirects

### 🖼️ **Image Analysis**
- OCR-based fraud detection
- Screenshot analysis for scam patterns
- Visual similarity matching with known threats

### 📚 **Interactive Training Module**
- Real-world phishing/scam examples
- Educational scenarios with guided learning
- Security best practices documentation

---

## 🏗️ Quick Architecture

```
Mobile App (React Native) ←→ FastAPI Backend ←→ MongoDB + AI APIs
```

---

## 🚀 Quick Start

### Prerequisites
```bash
Python 3.12+    Node.js 18+    MongoDB 6+    Git
```

### Installation (5 minutes)

```bash
# Clone & Setup
git clone https://github.com/AndreGarate/security-alert.git
cd security-alert/alerta-segura

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows or source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Configure .env files with your API keys
```

### Run Application

**Terminal 1: Backend**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2: MongoDB**
```bash
mongod --dbpath <your-data-path>
# or: docker compose up -d
```

**Terminal 3: Frontend**
```bash
cd frontend
npx expo start
```

**Terminal 4: Mobile**
- Install Expo Go app
- Scan QR code from Terminal 3
- Done! 📱

---

## 📚 API Documentation

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Server status |
| `/api/analyze-message` | POST | Threat analysis for text |
| `/api/analyze-url` | POST | URL safety verification |
| `/api/analyze-image` | POST | Image fraud detection |

---

## 🔧 Tech Stack

**Backend**: FastAPI, Uvicorn, MongoDB, Motor, Pydantic  
**Frontend**: React Native, Expo, TypeScript, Axios  
**AI**: Anthropic Claude, VirusTotal API  
**DevOps**: Docker, Docker Compose

---

## 📁 Project Structure

```
alerta-segura/
├── backend/              # FastAPI server
│   ├── server.py        # Main application
│   └── requirements.txt  # Dependencies
├── frontend/            # React Native mobile
│   ├── app/            # Screens & components
│   ├── lib/            # API & config
│   └── package.json
├── scripts/            # Setup utilities
├── docker-compose.yml  # MongoDB container
└── README.md          # This file
```

---

## 🎓 Learn More

See [README-PORTFOLIO.md](README-PORTFOLIO.md) for detailed feature documentation and development guide.

---

## 📄 License

MIT - Free for educational and commercial use

---

## 👤 Author

**André Garate** | Cybersecurity Enthusiast & Full-Stack Developer  
🔗 GitHub: [@AndreGarate](https://github.com/AndreGarate)
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
