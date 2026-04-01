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

### 📊 **History & Analytics**
- Persistent storage of analysis results
- Threat timeline visualization
- Personal security statistics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           Mobile App (React Native/Expo)            │
│  ┌────────────────────────────────────────────────┐ │
│  │ • Message Analyzer      • URL Analyzer        │ │
│  │ • Image Recognition    • Training Module     │ │
│  │ • History Tracking     • User Preferences    │ │
│  └────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS/REST
                     ↓
        ┌────────────────────────────┐
        │   FastAPI Backend (8001)   │
        │  ┌────────────────────────┐│
        │  │ • API Endpoints       ││
        │  │ • AI Integration      ││
        │  │ • Threat Detection    ││
        │  │ • Auth & Validation   ││
        │  └────────────────────────┘│
        └────────────┬───────────────┘
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
    ┌──────────────┐    ┌─────────────────┐
    │   MongoDB    │    │   VirusTotal    │
    │  (27017)     │    │   API           │
    └──────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 16+
- MongoDB 6+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/AndreGarate/security-alert.git
cd security-alert/alerta-segura

# Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt

# Frontend Setup
cd ../frontend
npm install

# Environment Configuration
# Create .env files from .env.example
# Add your API keys (Anthropic, VirusTotal)
```

### Running the Application

#### 1. Start MongoDB
```bash
mongod --dbpath <path-to-data-directory>
# Or with Docker:
docker compose up -d
```

#### 2. Start Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### 3. Start Frontend
```bash
cd frontend
npx expo start
```

#### 4. View on Mobile
- Install **Expo Go** from App Store or Play Store
- Scan the QR code from Expo terminal
- App opens on your device

---

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/analyze-message` | POST | Analyze text for threats |
| `/api/analyze-url` | POST | Verify URL safety |
| `/api/analyze-image` | POST | Detect fraud in images |
| `/api/training` | GET | Get training scenarios |
| `/api/history` | GET | User analysis history |

---

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: MongoDB with Motor (async driver)
- **AI**: Anthropic Claude API
- **Security**: VirusTotal Integration
- **Async**: Python AsyncIO

### Frontend
- **Framework**: React Native
- **Build**: Expo
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Navigation**: Expo Router
- **UI**: React Native Components

### DevOps
- Docker & Docker Compose
- Git & GitHub
- Environment-based configuration

---

## 🔑 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=alerta_segura_db
ANTHROPIC_API_KEY=your_api_key_here
VIRUSTOTAL_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-20250514
```

### Frontend (.env)
```env
# Auto-detects backend URL (Android: 10.0.2.2, iOS/Web: localhost)
# For physical device, specify:
# EXPO_PUBLIC_BACKEND_URL=http://192.168.1.X:8001
```

---

## 📈 Project Statistics

- **Frontend Files**: 7 screen components
- **Backend Endpoints**: 5+ API routes
- **Database Collections**: Analysis history, user preferences
- **Lines of Code**: 2000+ (production code)
- **Dependencies**: 40+ optimized packages

---

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Full-Stack Development**
- FastAPI backend architecture
- React Native mobile development
- REST API design patterns

✅ **Security Concepts**
- Threat detection algorithms
- Input validation & sanitization
- API security & CORS
- Environment-based secrets management

✅ **DevOps & Deployment**
- Docker containerization
- Database management
- Build pipelines
- Error handling & logging

✅ **AI Integration**
- LLM API consumption
- Prompt engineering
- Threat classification

---

## 🐛 Known Limitations

- Mobile app requires internet connection
- VirusTotal API has rate limits (free tier: 4 requests/min)
- Image analysis limited to 2MB files
- MongoDB local setup (production uses cloud)

---

## 🛣️ Roadmap

- [ ] User authentication & multi-device sync
- [ ] Offline threat database
- [ ] Advanced ML models for pattern detection
- [ ] Browser extensions (Chrome, Firefox)
- [ ] Community threat reporting
- [ ] Push notifications for threats
- [ ] Analytics dashboards

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 👤 Author

**André Garate**

Cybersecurity Enthusiast | Full-Stack Developer

- GitHub: [@AndreGarate](https://github.com/AndreGarate)
- Email: andregarate6@gmail.com

---

## 🤝 Contributing

Contributions are welcome! Open issues and pull requests.

---

## ⭐ Support

If this project helped you, consider giving it a star! 🌟

---

**Made with 🛡️ for cybersecurity awareness**
