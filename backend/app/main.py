from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": len(content),
    }
