from langchain_google_genai import ChatGoogleGenerativeAI
from .parser import MarkdownPythonParser

from app.config import config


model = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro", 
    max_tokens=8192 * 4, 
    temperature=0.1, 
    api_key=config["GOOGLE_API_KEY"],
    thinking_budget=4096
)
parser = MarkdownPythonParser('./output')

scripting_model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", 
    max_tokens=8192, 
    api_key=config["GOOGLE_API_KEY"]
)