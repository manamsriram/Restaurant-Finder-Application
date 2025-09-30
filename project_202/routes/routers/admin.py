from fastapi import FastAPI

app = FastAPI()

# Admin Endpoints
@app.get("/admin/check-duplicates")
def check_for_duplicate_listings():
	return {"message": "Check for duplicate listings"}

@app.delete("/admin/remove-entry/{entry_id}")
def remove_entry(entry_id: int):
	return {"message": f"Remove entry {entry_id}"}