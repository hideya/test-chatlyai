# Deployment Guide

This document provides detailed deployment instructions for various platforms. Choose the platform that best suits your needs.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Replit Deployment](#replit-deployment)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
  - [EC2 Deployment](#ec2-deployment)
  - [Elastic Beanstalk Deployment](#elastic-beanstalk-deployment)
- [Docker Deployment](#docker-deployment)

## Replit Deployment

### Prerequisites
- Replit account
- OpenAI API key
- PostgreSQL database (provided by Replit)

### Step-by-Step Instructions

1. **Fork the Repository**
   - Go to [replit.com](https://replit.com)
   - Click "Create Repl"
   - Choose "Import from GitHub"
   - Paste the repository URL

2. **Configure Environment**
   - In your Repl's "Secrets" tab, add:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `PORT`: Set to 5000 (or preferred port)

3. **Install and Setup**
   ```bash
   npm install
   npm run db:push
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Replit-Specific Features
Replit automatically handles:
- HTTPS certificates
- Process management
- Continuous deployment from Git
- Domain management

### Optimization Tips
- Enable "Always On" in Repl settings for 24/7 availability
- Use environment variables for sensitive information
- Configure proper build commands in the `.replit` file

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account
- Git installed
- PostgreSQL add-on (available through Heroku)

### Step-by-Step Instructions

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL Database**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configure Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   ```

5. **Deploy the Application**
   ```bash
   git push heroku main
   ```

6. **Run Database Migrations**
   ```bash
   heroku run npm run db:push
   ```

### Monitoring and Maintenance
- Use Heroku Dashboard for basic monitoring
- Enable Heroku Application Metrics add-on
- Set up logging with Papertrail add-on
- Configure alerts for critical metrics

## AWS Deployment

### EC2 Deployment

#### Prerequisites
- AWS account
- AWS CLI installed
- Basic knowledge of EC2 and security groups

#### Step-by-Step Instructions

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 AMI
   - Select appropriate instance type (t2.micro for testing)
   - Configure security groups for ports 80, 443, and 5000

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm git
   ```

4. **Clone and Setup Application**
   ```bash
   git clone your-repository
   cd your-app
   npm install
   ```

5. **Configure Environment**
   ```bash
   echo "export OPENAI_API_KEY=your_api_key" >> ~/.bashrc
   echo "export DATABASE_URL=your_database_url" >> ~/.bashrc
   source ~/.bashrc
   ```

6. **Setup Process Manager**
   ```bash
   npm install -g pm2
   pm2 start npm --name "app" -- start
   pm2 startup
   ```

#### Monitoring and Maintenance
- Use AWS CloudWatch for monitoring
- Configure CloudWatch alarms
- Setup AWS Systems Manager for maintenance
- Regular security updates using `yum update`

### Elastic Beanstalk Deployment

#### Prerequisites
- AWS account
- AWS EB CLI installed
- Application properly configured for EB

#### Step-by-Step Instructions

1. **Initialize EB Application**
   ```bash
   eb init -p node.js your-app-name
   ```

2. **Configure Environment Variables**
   - Add environment variables through EB Console
   - Include DATABASE_URL and OPENAI_API_KEY

3. **Deploy Application**
   ```bash
   eb create your-environment-name
   ```

4. **Configure Health Checks**
   - Set up application health monitoring
   - Configure auto-scaling rules

#### Monitoring and Maintenance
- Use EB Console for monitoring
- Configure Enhanced Health Reporting
- Setup CloudWatch alarms
- Regular platform updates

## Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose (optional)
- Access to Docker registry

### Step-by-Step Instructions

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t your-app-name .
   ```

3. **Configure Environment**
   Create a `.env` file or pass environment variables:
   ```bash
   docker run -e OPENAI_API_KEY=your_key -e DATABASE_URL=your_db_url -p 5000:5000 your-app-name
   ```

4. **Run Container**
   ```bash
   docker run -d -p 5000:5000 --name your-app your-app-name
   ```

### Docker Compose Setup
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - OPENAI_API_KEY=your_key
    depends_on:
      - db
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
```

### Monitoring and Maintenance
- Use Docker stats for basic monitoring
- Configure container health checks
- Implement Docker logging drivers
- Regular image updates and security scanning

## General Maintenance Tips

1. **Regular Backups**
   - Schedule regular database backups
   - Store application state and configurations
   - Test backup restoration procedures

2. **Security**
   - Keep dependencies updated
   - Regular security audits
   - Monitor for suspicious activities
   - Implement proper access controls

3. **Performance**
   - Monitor application metrics
   - Set up alerting for critical issues
   - Regular performance testing
   - Database optimization

4. **Scaling**
   - Monitor resource usage
   - Implement horizontal scaling when needed
   - Use load balancers for traffic distribution
   - Cache frequently accessed data

## Deployment Verification Steps

Before considering a deployment successful, follow these verification steps:

1. **Server Health Check**
   ```bash
   # Check if the server is running and responding
   curl http://your-domain:5000/health
   ```
   Expected response: `{"status": "healthy", "timestamp": "..."}`

2. **Database Connectivity**
   ```bash
   # The application will automatically verify database connection on startup
   # Check server logs for successful database connection message
   ```
   Expected log: "Database connection established successfully"

3. **API Functionality**
   ```bash
   # Test authentication endpoint
   curl -X POST http://your-domain:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "testpassword"}'
   ```
   Expected: JSON response with auth token

4. **Environment Variables**
   - Verify all required environment variables are set:
     ```bash
     # Check if environment variables are accessible
     node -e 'console.log(process.env.DATABASE_URL && "Database URL is set")'
     node -e 'console.log(process.env.OPENAI_API_KEY && "OpenAI API key is set")'
     ```

5. **Frontend Assets**
   - Visit the application URL in a browser
   - Verify static assets are loading (CSS, JavaScript)
   - Check browser console for any errors
   - Confirm the React application renders properly

6. **Security Verification**
   - Confirm HTTPS is enabled (if applicable)
   - Verify API endpoints require authentication
   - Check CORS settings are properly configured
   - Test rate limiting functionality

7. **Performance Check**
   - Verify response times are within acceptable range
   - Check memory usage is stable
   - Monitor CPU utilization
   - Confirm no memory leaks after extended operation

8. **Error Handling**
   - Test error logging configuration
   - Verify error responses are properly formatted
   - Confirm application handles common errors gracefully

### Troubleshooting Common Issues

1. **Server Not Starting**
   - Check port availability: `lsof -i :5000`
   - Verify Node.js version: `node --version`
   - Check for process conflicts

2. **Database Connection Failures**
   - Verify DATABASE_URL format
   - Check database server is accessible
   - Confirm database user permissions

3. **Frontend Loading Issues**
   - Clear browser cache
   - Check build artifacts in `dist` directory
   - Verify static file serving configuration

4. **API Errors**
   - Check API endpoint URLs
   - Verify request headers and body format
   - Monitor server logs for detailed error messages