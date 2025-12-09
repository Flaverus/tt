from contextlib import asynccontextmanager

from fastapi import FastAPI
from app.routes import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("startup")
    # await start_mqtt()
    yield
    print("shutdown")


app = FastAPI(title="Broker API", lifespan=lifespan)
app.include_router(health.router)


@app.get("/")
def root():
    return {"message": "Backend is running!"}
