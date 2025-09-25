# Use the official Python image as a base
FROM python:3.10-slim

# Set working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port on which the FastAPI application will run
EXPOSE 8080

# Set environment variable for Python path
ENV PYTHONPATH=/app

# Command to run the application using uvicorn directly with PORT env var
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}