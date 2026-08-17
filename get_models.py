import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
models = [m.id for m in client.models.list().data]

with open("models.json", "w") as f:
    json.dump(models, f)
print("Models saved to models.json")
