import logging

from fastapi import FastAPI, HTTPException

from app.services.weather_agent import get_weather_agent_service

app = FastAPI()
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event() -> None:
    service = get_weather_agent_service()
    try:
        await service.warm_up()
    except Exception:  # pragma: no cover - startup prefetch
        logger.exception("Weather agent warm-up failed")


@app.get("/")
async def read_root():
    return {"status": "ok"}


@app.get("/weather/latest")
async def read_latest_weather():
    try:
        service = get_weather_agent_service()
        payload = await service.fetch_latest_weather()
    except Exception as exc:  # pragma: no cover - defensive error translation
        logger.exception("Weather agent call failed")
        raise HTTPException(status_code=500, detail="Failed to query the MCP agent") from exc

    if not payload.get("latest"):
        raise HTTPException(status_code=404, detail="No weather data available")

    return payload
