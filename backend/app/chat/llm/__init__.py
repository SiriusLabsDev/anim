from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from .parser import MarkdownPythonParser

from app.config import config

model = (
    ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        max_tokens=8192 * 4,
        temperature=0.1,
        api_key=config["GOOGLE_API_KEY"],
        thinking_budget=4096,
    )
    if config["LLM"] == "GEMINI"
    else ChatAnthropic(
        model="claude-sonnet-4-5-20250929",
        max_tokens=8192 * 3,
        temperature=0.1,
        api_key=config["CLAUDE_API_KEY"],
    )
)

parser = MarkdownPythonParser("./output")

scripting_model = (
    ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", max_tokens=8192, api_key=config["GOOGLE_API_KEY"]
    ) if config["LLM"] == "GEMINI"
    else ChatAnthropic(
        model="claude-3-5-haiku-20241022",
        max_tokens=512,
        api_key=config["CLAUDE_API_KEY"],
        temperature=0.1
    )
)