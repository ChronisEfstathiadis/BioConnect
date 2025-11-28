from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
import httpx
from config import AUTH0_DOMAIN, AUTH0_AUDIENCE, ALGORITHMS
from database import SessionLocal
from models import Profile
from sqlalchemy.orm import Session

security = HTTPBearer()

# Cache for JWKS
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        response = httpx.get(url)
        _jwks_cache = response.json()
    return _jwks_cache

def get_token_from_request(request: Request) -> Optional[str]:
    """Get token from cookie first, then from Authorization header as fallback"""
    token = request.cookies.get("access_token")
    if token:
        return token
    
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    
    return None

async def verify_token(request: Request = None, credentials: HTTPAuthorizationCredentials = None):
    """Verify token from cookie or Authorization header"""
    token = None
    
    if request:
        token = get_token_from_request(request)
    
    if not token and credentials:
        token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Token is missing")
    
    token_parts = token.split('.')
    if len(token_parts) != 3:
        raise HTTPException(status_code=401, detail=f"Invalid token format. Expected 3 parts, got {len(token_parts)}")
    
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Unable to find appropriate key")
        
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        return payload
    except jwt.DecodeError as e:
        raise HTTPException(status_code=401, detail=f"Token decode error: {str(e)}")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification error: {str(e)}")

async def get_token_data(request: Request) -> dict:
    """Dependency to get token data from cookie or header"""
    return await verify_token(request=request)

def get_user_id_from_token(token_data: dict) -> str:
    """Extract user ID (sub) from Auth0 token"""
    return token_data.get("sub", "")

def get_user_email_from_token(token_data: dict) -> str:
    """Extract user email from Auth0 token"""
    return token_data.get("email", "")

def get_user_name_from_token(token_data: dict) -> tuple[str, str]:
    """Extract user name from Auth0 token and split into first/last"""
    name = token_data.get("name", "")
    if name:
        parts = name.split(" ", 1)
        return (parts[0], parts[1] if len(parts) > 1 else "")
    return ("", "")

def get_or_create_profile(token_data: dict, db: Session) -> Profile:
    """Automatically create profile if it doesn't exist, using Auth0 token data"""
    user_id = get_user_id_from_token(token_data)
    
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    
    if not profile:
        email = get_user_email_from_token(token_data)
        first_name, last_name = get_user_name_from_token(token_data)
        
        profile = Profile(
            id=user_id,
            email=email,
            FirstName=first_name or "",
            LastName=last_name or "",
            avatar_url=None,
            phone=None
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        print(f"Auto-created profile for user: {user_id}")
    
    return profile
