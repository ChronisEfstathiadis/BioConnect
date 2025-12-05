from fastapi import APIRouter, HTTPException, Request, Response, Depends, Query, status
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from Schemas.TokenSchema import TokenRequest
from auth import verify_token, get_token_data, security, get_or_create_profile
from config import AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
from database import get_db
import httpx
from typing import Optional

router = APIRouter()

@router.get("/api/auth/callback", tags=["Auth"])
async def auth_callback(
    code: str = Query(...)
):
    """Auth0 callback - exchanges code for token, sets cookie, and creates profile"""
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is missing"
        )
    
    try:
        token_url = f"https://{AUTH0_DOMAIN}/oauth/token"
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                token_url,
                json={
                    "grant_type": "authorization_code",
                    "client_id": AUTH0_CLIENT_ID,
                    "client_secret": AUTH0_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": "http://localhost:8000/api/auth/callback"
                },
                timeout=10.0
            )
        
        if token_response.status_code != 200:
            error_data = token_response.json() if token_response.headers.get("content-type", "").startswith("application/json") else {}
            error_message = error_data.get("error_description", "Failed to exchange authorization code for token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {error_message}"
            )
        
        token_data = token_response.json()
        
        # Debug: Print what Auth0 returned
        print(f"🔍 Auth0 token response keys: {list(token_data.keys())}")
        print(f"🔍 Auth0 token response: {token_data}")
        
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")  # ✅ Get refresh token
        
        print(f"🔍 Access token present: {access_token is not None}")
        print(f"🔍 Refresh token present: {refresh_token is not None}")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No access token received from Auth0"
            )
        
        if not refresh_token:
            print("⚠️ WARNING: No refresh token received from Auth0!")
            print("⚠️ This might be because:")
            print("   1. Auth0 application is not configured to allow refresh tokens")
            print("   2. The 'offline_access' scope is not enabled in Auth0")
            print("   3. The application type doesn't support refresh tokens")
        
        # Get user info from Auth0 /userinfo endpoint
        userinfo_url = f"https://{AUTH0_DOMAIN}/userinfo"
        try:
            async with httpx.AsyncClient() as client:
                userinfo_response = await client.get(
                    userinfo_url,
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=10.0
                )
            
            if userinfo_response.status_code != 200:
                print(f"⚠️ Failed to get userinfo: {userinfo_response.status_code}")
                # Fallback to access token
                verified_token = await verify_token(credentials=HTTPAuthorizationCredentials(
                    scheme="Bearer",
                    credentials=access_token
                ))
                user_data = verified_token
            else:
                user_data = userinfo_response.json()
        except Exception as e:
            print(f"⚠️ Error getting userinfo: {e}")
            # Fallback to access token
            verified_token = await verify_token(credentials=HTTPAuthorizationCredentials(
                scheme="Bearer",
                credentials=access_token
            ))
            user_data = verified_token
        
        # Auto-create profile if it doesn't exist
        db = next(get_db())
        try:
            profile = get_or_create_profile(user_data, db)
        except Exception as e:
            print(f"❌ Error creating profile: {e}")
            import traceback
            traceback.print_exc()
            # Don't fail auth if profile creation fails - user can create it later
        finally:
            db.close()
        
        # Create redirect response and set cookies
        redirect_response = RedirectResponse(url="http://localhost:5173/")
        redirect_response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600,
            path="/",
            domain="localhost"
        )
        
        # ✅ Store refresh token in cookie (only if we got one)
        if refresh_token:
            redirect_response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=86400 * 30,  # 30 days
                path="/",
                domain="localhost"
            )
            print(f"✅ Refresh token cookie set successfully")
        else:
            print(f"⚠️ No refresh token to set - user will need to re-login when access token expires")
        
        return redirect_response
        
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Authentication service timeout. Please try again."
        )
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/api/auth/login", tags=["Auth"])
async def login():
    """Redirect to Auth0 login"""
    from config import AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE
    
    auth_url = (
        f"https://{AUTH0_DOMAIN}/authorize?"
        f"response_type=code&"
        f"client_id={AUTH0_CLIENT_ID}&"
        f"redirect_uri=http://localhost:8000/api/auth/callback&"
        f"scope=openid profile email offline_access&"  # Add offline_access to get refresh token
        f"audience={AUTH0_AUDIENCE}"
    )
    
    return RedirectResponse(url=auth_url)

# Keep existing endpoints
@router.post("/api/auth/set-cookie", tags=["Auth"])
async def set_auth_cookie(
    token_request: TokenRequest,
    response: Response,
    request: Request
):
    """Set Auth0 token as HTTP-only cookie - token is never stored in frontend"""
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
            samesite="none",  # ✅ Changed from "lax" to "none"
            max_age=3600,
            path="/"
        )
        
        return {"message": "Cookie set successfully"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.delete("/api/auth/logout", tags=["Auth"])
async def logout(response: Response):
    """Clear auth cookies on logout"""
    response.delete_cookie(
        key="access_token", 
        path="/",
        httponly=True,
        secure=False,
        samesite="none",
        domain="localhost"
    )
    # ✅ Also delete refresh token
    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=True,
        secure=False,
        samesite="none",
        domain="localhost"
    )
    return {"message": "Logged out successfully"}

@router.get("/api/protected", tags=["Auth"])
async def protected_route(token_data: dict = Depends(get_token_data)):
    return {"message": "You are authenticated!", "user": token_data}


@router.post("/api/auth/refresh", tags=["Auth"])
async def refresh_token(request: Request, response: Response):
    """Refresh access token using refresh token"""
    refresh_token = request.cookies.get("refresh_token")
    
    # Debug: Print all cookies to see what we're receiving
    print(f"🔍 Refresh endpoint - All cookies: {request.cookies}")
    print(f"🔍 Refresh endpoint - refresh_token cookie: {refresh_token}")
    
    if not refresh_token:
        print("❌ Refresh token is missing from cookies")
        print("💡 This usually means:")
        print("   1. User logged in before refresh tokens were configured")
        print("   2. Auth0 is not configured to return refresh tokens")
        print("   3. Refresh token cookie expired or was cleared")
        print("💡 User needs to log in again to get a new access token")
        
        # Clear access token cookie since we can't refresh
        response.delete_cookie(
            key="access_token",
            path="/",
            httponly=True,
            secure=False,
            samesite="lax",
            domain="localhost"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing. Please log in again."
        )
    
    try:
        token_url = f"https://{AUTH0_DOMAIN}/oauth/token"
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                token_url,
                json={
                    "grant_type": "refresh_token",
                    "client_id": AUTH0_CLIENT_ID,
                    "client_secret": AUTH0_CLIENT_SECRET,
                    "refresh_token": refresh_token
                },
                timeout=10.0
            )
        
        print(f"🔍 Auth0 refresh response status: {token_response.status_code}")
        
        if token_response.status_code != 200:
            error_data = token_response.json() if token_response.headers.get("content-type", "").startswith("application/json") else {}
            error_message = error_data.get("error_description", "Failed to refresh token")
            error_code = error_data.get("error", "unknown_error")
            print(f"❌ Auth0 refresh failed: {error_code} - {error_message}")
            
            # If refresh token is invalid/expired, clear both cookies
            if error_code in ["invalid_grant", "invalid_request", "invalid_refresh_token"]:
                response.delete_cookie(
                    key="refresh_token",
                    path="/",
                    httponly=True,
                    secure=False,
                    samesite="lax",
                    domain="localhost"
                )
                response.delete_cookie(
                    key="access_token",
                    path="/",
                    httponly=True,
                    secure=False,
                    samesite="lax",
                    domain="localhost"
                )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token refresh failed: {error_message}"
            )
        
        token_data = token_response.json()
        new_access_token = token_data.get("access_token")
        new_refresh_token = token_data.get("refresh_token")  # Auth0 may return a new refresh token
        
        if not new_access_token:
            print("❌ No access token received from Auth0")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No access token received from Auth0"
            )
        
        print(f"✅ Token refresh successful, setting new cookies")
        
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600,
            path="/",
            domain="localhost"
        )
        
        # Update refresh token if a new one was provided
        if new_refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=new_refresh_token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=86400 * 30,  # 30 days
                path="/",
                domain="localhost"
            )
            print(f"✅ New refresh token set")
        else:
            print(f"⚠️ No new refresh token provided by Auth0, keeping existing one")
        
        return {"message": "Token refreshed successfully"}
        
    except HTTPException:
        raise
    except httpx.TimeoutException:
        print("❌ Token refresh service timeout")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Token refresh service timeout. Please try again."
        )
    except Exception as e:
        print(f"❌ Token refresh error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )
