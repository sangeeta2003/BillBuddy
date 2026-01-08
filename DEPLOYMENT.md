# BillBuddy Deployment Guide

This guide covers different deployment options for BillBuddy.

## Prerequisites

- Docker and Docker Compose installed
- (Optional) Node.js 18+ for local development
- MongoDB (if not using Docker)

## Quick Start with Docker Compose (Recommended)

### Windows
```powershell
.\deploy.ps1
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Docker Compose Deployment

1. **Set up environment variables:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

## Environment Variables

Create a `backend/.env` file with the following variables:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/billbuddy
JWT_SECRET=your-strong-secret-key-here
CORS_ORIGIN=https://your-frontend-domain.com
```

### Important Notes:
- **JWT_SECRET**: Use a strong, random string in production. Generate one using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **MONGO_URI**: For Docker Compose, use `mongodb://mongo:27017/billbuddy`. For external MongoDB, use your connection string.
- **CORS_ORIGIN**: In production, specify your frontend URL. Use `*` only for development.

## Deployment Options

### 1. Docker Compose (Local/Server)

Best for: Local development, single server deployment

**Advantages:**
- Easy setup
- Includes MongoDB
- Isolated environment
- Easy to scale

**Steps:**
1. Clone repository
2. Run `docker-compose up -d`
3. Access API at `http://localhost:5000`

### 2. Docker Only (Without Compose)

Best for: Cloud platforms that support Docker

**Steps:**
1. Build image:
   ```bash
   cd backend
   docker build -t billbuddy-backend .
   ```

2. Run container:
   ```bash
   docker run -d \
     -p 5000:5000 \
     --name billbuddy-backend \
     --env-file .env \
     billbuddy-backend
   ```

### 3. Traditional Node.js Deployment

Best for: VPS, cloud platforms without Docker

**Prerequisites:**
- Node.js 18+
- MongoDB (local or cloud)

**Steps:**
1. Install dependencies:
   ```bash
   cd backend
   npm install --production
   ```

2. Set up environment variables in `.env`

3. Start with PM2 (recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name billbuddy
   pm2 save
   pm2 startup
   ```

4. Or use systemd service (Linux)

### 4. Cloud Platform Deployment

#### Heroku
1. Create `Procfile`:
   ```
   web: node server.js
   ```

2. Set environment variables in Heroku dashboard

3. Deploy:
   ```bash
   git push heroku main
   ```

#### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### Render
1. Connect GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && node server.js`
4. Set environment variables

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build and run commands
3. Set environment variables
4. Add MongoDB database component

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (64+ characters)
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Use secure MongoDB connection (with authentication)
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup for MongoDB
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure firewall rules
- [ ] Set up SSL certificates

## Reverse Proxy Setup (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Health Check
The API includes a health check endpoint:
```bash
curl http://localhost:5000/
```

### Logs
- Docker: `docker-compose logs -f backend`
- PM2: `pm2 logs billbuddy`
- Systemd: `journalctl -u billbuddy -f`

## Troubleshooting

### MongoDB Connection Issues
- Check MongoDB is running: `docker-compose ps mongo`
- Verify MONGO_URI in .env
- Check MongoDB logs: `docker-compose logs mongo`

### Port Already in Use
- Change PORT in .env
- Or stop conflicting service: `lsof -ti:5000 | xargs kill`

### Container Won't Start
- Check logs: `docker-compose logs backend`
- Verify .env file exists and is properly formatted
- Ensure no syntax errors in code

### Socket.io Connection Issues
- Verify CORS_ORIGIN is set correctly
- Check firewall rules
- Ensure WebSocket support in reverse proxy

## Backup and Restore

### MongoDB Backup
```bash
docker-compose exec mongo mongodump --out /data/backup
```

### MongoDB Restore
```bash
docker-compose exec mongo mongorestore /data/backup
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple backend instances
- Shared MongoDB instance
- Redis for session management (if needed)

### Vertical Scaling
- Increase container resources
- Optimize database queries
- Add caching layer

## Security Best Practices

1. **Never commit .env files**
2. **Use environment variables for secrets**
3. **Enable MongoDB authentication**
4. **Use HTTPS in production**
5. **Implement rate limiting**
6. **Regular security updates**
7. **Monitor for vulnerabilities**

## Support

For issues or questions:
- Check logs first
- Review error messages
- Check GitHub issues
- Contact support team
