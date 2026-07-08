FROM python:3.10

# Set working directory di dalam container
WORKDIR /app

# Install dependencies sistem yang diperlukan (jika ada library ML yang butuh kompilasi C)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements dan install library Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh source code ke dalam containerup
COPY . .

# Expose port 8000 untuk FastAPI
EXPOSE 8000

# Jalankan server Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

