from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.api.routes import analysis, reports
from backend.app.config.settings import settings
import os

app = FastAPI(title=settings.PROJECT_TITLE)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(analysis.router, prefix="/v1", tags=["IA Analysis"])
app.include_router(reports.router, prefix="/v1", tags=["Reports"])

# Forzar MIME types para JavaScript (Crítico para Cloud Run)
import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Servir la carpeta src explícitamente
if os.path.exists("src"):
    app.mount("/src", StaticFiles(directory="src"), name="src")

# Servir el index.html en la raíz
@app.get("/")
async def read_index():
    return FileResponse("index.html")

# Servir cualquier otro archivo en la raíz (como favicon o assets sueltos)
app.mount("/", StaticFiles(directory="."), name="root")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
