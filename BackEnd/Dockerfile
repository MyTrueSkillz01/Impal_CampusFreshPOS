FROM python:3.11-slim

WORKDIR /app

# Copy requirements dulu (supaya layer cache efisien)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy semua file backend
COPY . .

# Expose port 5000
EXPOSE 5000

# Jalankan FastAPI dengan uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]
