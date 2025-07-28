from langchain_google_genai import ChatGoogleGenerativeAI
from .parser import VizmoParser

from app.config import config

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", max_tokens=8192, temperature=0.2, api_key=config["GOOGLE_API_KEY"])
parser = VizmoParser('./output')