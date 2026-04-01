import json
import uuid
import base64
import logging
import os
from datetime import datetime
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
MONGO_URL          = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME            = os.getenv("DB_NAME", "alerta_segura_db")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "") or os.getenv("EMERGENT_LLM_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Alerta Segura API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB ────────────────────────────────────────────────────────────────────────
mongo_client = None
db = None

@app.on_event("startup")
async def startup():
    global mongo_client, db
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    db = mongo_client[DB_NAME]
    logger.info("Conectado a MongoDB")

@app.on_event("shutdown")
async def shutdown():
    if mongo_client:
        mongo_client.close()

# ── Modelos ───────────────────────────────────────────────────────────────────
class MessageAnalysisRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)

class URLAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=1)

class ImageAnalysisRequest(BaseModel):
    image_base64: str

def _guess_image_media_type(image_base64: str) -> str:
    try:
        sample = image_base64[:4096]
        pad = "=" * (-len(sample) % 4)
        raw = base64.b64decode(sample + pad, validate=False)[:32]
        if raw.startswith(b"\xff\xd8"):
            return "image/jpeg"
        if raw.startswith(b"\x89PNG"):
            return "image/png"
        if raw.startswith(b"GIF8"):
            return "image/gif"
        if raw.startswith(b"RIFF") and len(raw) >= 12 and raw[8:12] == b"WEBP":
            return "image/webp"
    except Exception:
        pass
    return "image/jpeg"


# ── Helper: Claude vía API Messages de Anthropic ───────────────────────────────
async def call_claude(system_message: str, user_prompt: str, image_base64: Optional[str] = None) -> dict:
    """Llama a Claude y devuelve el JSON parseado."""
    if not ANTHROPIC_API_KEY:
        raise ValueError(
            "Falta ANTHROPIC_API_KEY (o EMERGENT_LLM_KEY) en el entorno. "
            "Configúrala en un archivo .env en la carpeta backend."
        )

    user_content: list = []
    if image_base64:
        user_content.append(
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": _guess_image_media_type(image_base64),
                    "data": image_base64,
                },
            }
        )
    user_content.append({"type": "text", "text": user_prompt})

    payload = {
        "model": CLAUDE_MODEL,
        "max_tokens": 4096,
        "system": system_message,
        "messages": [{"role": "user", "content": user_content}],
    }

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        blocks = data.get("content") or []
        text_parts = [b.get("text", "") for b in blocks if b.get("type") == "text"]
        text = "".join(text_parts).strip()
        logger.info(f"Claude response (primeros 120 chars): {text[:120]}")

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        return json.loads(text)

    except httpx.HTTPStatusError as e:
        logger.error(f"Anthropic HTTP error: {e.response.status_code} {e.response.text[:500]}")
        raise
    except Exception as e:
        logger.error(f"Error llamando a Claude: {str(e)}")
        raise

# ── Helper: guardar en MongoDB ────────────────────────────────────────────────
async def save_analysis(result: dict):
    try:
        doc = result.copy()
        if isinstance(doc.get("timestamp"), str):
            doc["timestamp"] = datetime.fromisoformat(doc["timestamp"])
        await db.analysis_history.insert_one(doc)
    except Exception as e:
        logger.warning("No se pudo guardar el análisis en MongoDB: %s", e)

# ── SYSTEM PROMPTS ────────────────────────────────────────────────────────────
SYSTEM_MESSAGE_BASE = """Eres un experto en seguridad digital especializado en detectar estafas, phishing y fraudes.
Responde SIEMPRE en español y ÚNICAMENTE en formato JSON válido, sin texto adicional, con esta estructura exacta:
{{
  "is_safe": <true o false>,
  "risk_level": "<safe|suspicious|dangerous>",
  "explanation": "<explicación clara sin tecnicismos, pensada para personas mayores>",
  "warning_signs": ["<señal 1>", "<señal 2>"]
}}"""

# ── ENDPOINTS ─────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "Alerta Segura API", "version": "1.0.0"}


@app.post("/api/analyze-message")
async def analyze_message(request: MessageAnalysisRequest):
    try:
        data = await call_claude(
            system_message=SYSTEM_MESSAGE_BASE,
            user_prompt=f"Analiza este mensaje y determina si es una estafa o phishing:\n\n{request.message}",
        )

        result = {
            "id": str(uuid.uuid4()),
            "analysis_type": "message",
            "content": request.message[:500],
            "is_safe": data.get("is_safe", False),
            "risk_level": data.get("risk_level", "suspicious"),
            "explanation": data.get("explanation", "No se pudo determinar."),
            "warning_signs": data.get("warning_signs", []),
            "timestamp": datetime.utcnow().isoformat(),
        }

        await save_analysis(result)
        return result

    except Exception as e:
        logger.error(f"Error analizando mensaje: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al analizar el mensaje: {str(e)}")


@app.post("/api/analyze-url")
async def analyze_url(request: URLAnalysisRequest):
    try:
        malicious_count = 0
        vt_info = ""

        # Consultar VirusTotal
        url_id = base64.urlsafe_b64encode(request.url.encode()).decode().strip("=")
        async with httpx.AsyncClient(timeout=10.0) as http:
            try:
                headers = {"x-apikey": VIRUSTOTAL_API_KEY}
                vt_resp = await http.get(
                    f"https://www.virustotal.com/api/v3/urls/{url_id}",
                    headers=headers,
                )
                if vt_resp.status_code == 200:
                    stats = vt_resp.json()["data"]["attributes"]["last_analysis_stats"]
                    malicious_count = stats.get("malicious", 0)
                    vt_info = f"\nVirusTotal detectó {malicious_count} motores de seguridad marcando esta URL como maliciosa."
                elif vt_resp.status_code == 404:
                    await http.post(
                        "https://www.virustotal.com/api/v3/urls",
                        headers=headers,
                        data={"url": request.url},
                    )
            except Exception as vt_err:
                logger.warning(f"VirusTotal error: {str(vt_err)}")

        data = await call_claude(
            system_message=SYSTEM_MESSAGE_BASE,
            user_prompt=f"Analiza esta URL y determina si es segura o peligrosa:{vt_info}\n\nURL: {request.url}",
        )

        # Si VirusTotal lo marcó como peligroso, forzar resultado
        if malicious_count > 0:
            data["is_safe"] = False
            data["risk_level"] = "dangerous"
            warning = f"Detectado como malicioso por {malicious_count} motores de seguridad"
            if warning not in data.get("warning_signs", []):
                data.setdefault("warning_signs", []).insert(0, warning)

        result = {
            "id": str(uuid.uuid4()),
            "analysis_type": "url",
            "content": request.url,
            "is_safe": data.get("is_safe", False),
            "risk_level": data.get("risk_level", "suspicious"),
            "explanation": data.get("explanation", "No se pudo determinar."),
            "warning_signs": data.get("warning_signs", []),
            "timestamp": datetime.utcnow().isoformat(),
        }

        await save_analysis(result)
        return result

    except Exception as e:
        logger.error(f"Error analizando URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al analizar la URL: {str(e)}")


@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    try:
        logger.info("Analizando imagen...")

        data = await call_claude(
            system_message=SYSTEM_MESSAGE_BASE,
            user_prompt="Analiza esta imagen y determina si contiene señales de estafa, phishing o fraude digital.",
            image_base64=request.image_base64,
        )

        result = {
            "id": str(uuid.uuid4()),
            "analysis_type": "image",
            "content": "[Imagen analizada]",
            "is_safe": data.get("is_safe", False),
            "risk_level": data.get("risk_level", "suspicious"),
            "explanation": data.get("explanation", "No se pudo determinar."),
            "warning_signs": data.get("warning_signs", []),
            "timestamp": datetime.utcnow().isoformat(),
        }

        await save_analysis(result)
        return result

    except Exception as e:
        logger.error(f"Error analizando imagen: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al analizar la imagen: {str(e)}")


@app.get("/api/history")
async def get_history(limit: int = 50):
    try:
        cursor = db.analysis_history.find().sort("timestamp", -1).limit(limit)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if isinstance(doc.get("timestamp"), datetime):
                doc["timestamp"] = doc["timestamp"].isoformat()
            history.append(doc)
        return history
    except Exception as e:
        logger.warning("Historial no disponible (¿MongoDB en marcha?): %s", e)
        return []


@app.delete("/api/history/{analysis_id}")
async def delete_history(analysis_id: str):
    try:
        result = await db.analysis_history.delete_one({"id": analysis_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Elemento no encontrado")
        return {"message": "Elemento eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("No se pudo eliminar del historial: %s", e)
        raise HTTPException(status_code=503, detail="Base de datos no disponible")


@app.get("/api/training-questions")
async def get_training_questions():
    return [
        {
            "id": "1",
            "question": "¿Este mensaje es seguro?",
            "example": "¡URGENTE! Tu cuenta bancaria será bloqueada en 24 horas. Haz clic aquí para verificar tus datos: http://banco-seguro.xyz/verificar",
            "is_safe": False,
            "explanation": "Este es un mensaje peligroso. Crea urgencia innecesaria, usa una URL sospechosa que no es del banco real, y pide que hagas clic en un enlace para 'verificar' datos. Los bancos nunca piden tus datos por mensaje.",
        },
        {
            "id": "2",
            "question": "¿Este mensaje es seguro?",
            "example": "Hola María, te escribo para recordarte que mañana tenemos reunión familiar a las 3pm en casa de la abuela. ¡No olvides traer el postre!",
            "is_safe": True,
            "explanation": "Este mensaje es completamente seguro. Es una comunicación familiar normal sin solicitudes de datos personales, dinero, ni enlaces sospechosos.",
        },
        {
            "id": "3",
            "question": "¿Este mensaje es seguro?",
            "example": "¡Felicitaciones! Ganaste $50,000 en nuestro sorteo. Para reclamar tu premio, envía tus datos bancarios y paga $200 de impuestos al siguiente número...",
            "is_safe": False,
            "explanation": "Esta es una estafa clásica. Nadie gana premios de sorteos en los que no participó. Ningún sorteo legítimo te pide pagar impuestos para recibir un premio.",
        },
        {
            "id": "4",
            "question": "¿Este enlace es seguro?",
            "example": "www.faceb00k-login-seguro.com/verify-account",
            "is_safe": False,
            "explanation": "Esta URL es peligrosa. Facebook real es 'facebook.com', pero esta usa '00' (ceros) en lugar de 'oo' para engañarte. Es una página falsa que roba contraseñas.",
        },
        {
            "id": "5",
            "question": "¿Este mensaje es seguro?",
            "example": "Tu paquete de Amazon no pudo ser entregado. Actualiza tu dirección en las próximas 2 horas o será devuelto. Haz clic: amaz0n-delivery.net/update",
            "is_safe": False,
            "explanation": "Este mensaje tiene múltiples señales de estafa: urgencia artificial, el enlace usa '0' en vez de 'o', y el dominio es completamente diferente al oficial (amazon.com).",
        },
    ]
