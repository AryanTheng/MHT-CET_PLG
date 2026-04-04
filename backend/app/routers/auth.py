from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import LoginRequest, TokenResponse
from app.core.database import users_col
from app.core.security import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = users_col().find_one({"username": body.username})

    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token({"sub": user["username"]})

    return TokenResponse(
        access_token=token,
        username=user["username"],
        full_name=user.get("full_name"),
    )


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user
