from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from config import DATABASE_URL

# Database setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Manually add missing columns to existing tables
    inspector = inspect(engine)
    existing_columns = [col['name'] for col in inspector.get_columns('profiles')]
    
    if 'email' not in existing_columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN email VARCHAR"))
            conn.commit()
        print("Added email column to profiles table")
    
    if 'phone' not in existing_columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN phone VARCHAR"))
            conn.commit()
        print("Added phone column to profiles table")
