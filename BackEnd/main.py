from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import auth, profiles, services, social_links, projects, jobs

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(services.router)
app.include_router(social_links.router)
app.include_router(projects.router)
app.include_router(jobs.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
