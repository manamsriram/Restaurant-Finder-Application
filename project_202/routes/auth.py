# General Endpoints
@app.get("/register")
def register_user():
	return {"message": "User registration"}

@app.post("/login")
def login_user():
	return {"message": "User login"}
