from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    
    inspector = inspect(engine)
    existing_columns = [col['name'] for col in inspector.get_columns('profiles')]
    
    if 'email' not in existing_columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN email VARCHAR"))
            conn.commit()
    
    if 'phone' not in existing_columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE profiles ADD COLUMN phone VARCHAR"))
            conn.commit()
