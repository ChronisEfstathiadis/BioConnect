from fastapi import APIRouter, HTTPException, Request, Response, Depends
from fastapi.security import HTTPAuthorizationCredentials
from schemas import TokenRequest
from auth import verify_token, get_token_data, security

router = APIRouter()

@router.post("/api/auth/set-cookie")
async def set_auth_cookie(
    token_request: TokenRequest,
    response: Response,
    request: Request
):
    """Set Auth0 token as HTTP-only cookie"""
    try:
        token = token_request.token
        
        token_data = await verify_token(credentials=HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials=token
        ))
        
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600,
            path="/"
        )
        
        return {"message": "Cookie set successfully"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.delete("/api/auth/logout")
async def logout(response: Response):
    """Clear auth cookie on logout"""
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}

@router.get("/api/protected")
async def protected_route(token_data: dict = Depends(get_token_data)):
    return {"message": "You are authenticated!", "user": token_data}
