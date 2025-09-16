FROM python:3.13-slim

ENV DEBIAN_FRONTEND=noninteractive

ENV TZ=UTC

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    # Graphics and video libraries
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    # libgdk-pixbuf2.0-dev \
    # libffi-dev \
    # shared-mime-info \
    # LaTeX for mathematical typesetting
    texlive-latex-base \
    texlive-latex-extra \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-xetex \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD [ "uvicorn", "app.main:app", "--port", "8000", "--host", "0.0.0.0"]
