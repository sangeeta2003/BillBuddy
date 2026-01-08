# BillBuddy Deployment Script for Windows PowerShell
Write-Host "🚀 Starting BillBuddy Deployment..." -ForegroundColor Cyan

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✅ Created .env file. Please update it with your configuration." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Build and start containers
Write-Host "📦 Building and starting containers..." -ForegroundColor Cyan
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check if services are running
$services = docker-compose ps
if ($services -match "Up") {
    Write-Host "✅ BillBuddy is now running!" -ForegroundColor Green
    Write-Host "🌐 Backend API: http://localhost:5000" -ForegroundColor Green
    Write-Host "📊 MongoDB: localhost:27017" -ForegroundColor Green
    Write-Host ""
    Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Cyan
    Write-Host "To stop: docker-compose down" -ForegroundColor Cyan
} else {
    Write-Host "❌ Some services failed to start. Check logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}
