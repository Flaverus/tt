from pydantic import BaseSettings

class Settings(BaseSettings):
    mongo_url: str
    mqtt_broker: str
    mqtt_port: int
    mqtt_topic: str

    class Config:
        env_file = ".env"

settings = Settings()
