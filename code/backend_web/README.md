# Backend Web

## Build Dockerfile and run single container

```
docker build -t backend_web .
docker run -p 3000:3000 --rm backend_web
```