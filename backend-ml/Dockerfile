# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Install system-level dependencies
# Install portaudio19-dev for PyAudio and remove the apt cache to reduce image size
RUN apt-get update && apt-get install -y \
    portaudio19-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements.txt file
COPY requirements.txt .

# Install any needed Python packages, including PyAudio
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Command to run FastAPI via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]