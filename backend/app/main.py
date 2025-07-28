from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from config import config, check_config
from llm.parser import VizmoParser
from llm.prompts import get_system_prompt

check_config()


messages = [
    SystemMessage(get_system_prompt()),
    HumanMessage("Generate a video explaining sieve of eratosthenes algorithm")
]

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", max_tokens=8192, temperature=0.2, api_key=config["GOOGLE_API_KEY"])
parser = VizmoParser('./output')

response = llm.invoke(messages).content
print(response)
parser.parse_and_create_files(response, "./ouput")
