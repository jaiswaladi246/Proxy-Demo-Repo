# Reverse Proxy Demo

A simple hands-on project to understand **Proxy and Reverse Proxy concepts** using **AWS EC2, Nginx, Node.js, and Express**.

In this project, we will deploy a DevOps Shack web application on a **private EC2 instance** and use a **public EC2 instance running Nginx as a reverse proxy**.

## Architecture

```text
                         Internet
                            |
                            | HTTP :80
                            v
                  +--------------------+
                  |   Proxy EC2        |
                  |   Nginx            |
                  |   Public Subnet    |
                  +---------+----------+
                            |
                            | HTTP :8080
                            v
                  +--------------------+
                  |   Backend EC2      |
                  |   Node.js / Express|
                  |   Private Subnet   |
                  |   No Public IP     |
                  +--------------------+
```

## Technologies

* AWS EC2
* AWS VPC
* AWS Security Groups
* Nginx
* Node.js
* Express.js
* HTML
* CSS
* JavaScript

## Project Structure

```text
.
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## How It Works

The user sends a request to the public Nginx server:

```text
Browser
   |
   v
Nginx Reverse Proxy
   |
   v
Private Node.js Application
```

Nginx receives the request and forwards it to the Node.js application running on the private EC2 instance.

The backend EC2 instance does not have a public IP and accepts traffic on port `8080` only from the proxy Security Group.

## Security Model

### Proxy EC2

Allows:

```text
HTTP :80  → Internet
SSH  :22  → Your IP
```

### Backend EC2

Allows:

```text
TCP :8080 → proxy-sg
```

The backend is **not directly exposed to the internet**.

## API Endpoints

### Health Check

```text
GET /api/health
```

Example response:

```json
{
  "status": "ok"
}
```

### Backend Information

```text
GET /api/info
```

Example response:

```json
{
  "application": "DevOps Shack",
  "environment": "production",
  "server": "private-backend",
  "status": "healthy"
}
```

## Running the Application

Install dependencies:

```bash
npm install
```

Start the application:

```bash
node server.js
```

The application runs on:

```text
http://localhost:8080
```

For production-style process management, we can use PM2:

```bash
npm install -g pm2
pm2 start server.js --name devops-shack
pm2 save
```

## Nginx Configuration

The reverse proxy forwards requests to the private backend:

```nginx
server {
    listen 80;

    server_name _;

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://<BACKEND_PRIVATE_IP>:8080;
    }
}
```

Test the configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

## Testing

Access the application using the proxy's public IP:

```text
http://<PROXY_PUBLIC_IP>
```

The request flow should be:

```text
Browser
   ↓
Nginx
   ↓
Private EC2
   ↓
Node.js / Express
   ↓
DevOps Shack Application
```

We can also monitor Nginx requests using:

```bash
sudo tail -f /var/log/nginx/access.log
```

## Key Concepts Covered

* What is a Proxy?
* Forward Proxy
* Reverse Proxy
* Proxy vs Reverse Proxy
* How Nginx works as a reverse proxy
* Public vs Private EC2
* AWS Security Groups
* Proxy-to-backend communication
* Proxy headers
* Nginx access logs
* Reverse Proxy vs Load Balancer
* Reverse Proxy vs NAT
* Reverse Proxy vs API Gateway
* Basic load balancing with Nginx

## Learning Goal

The main goal of this project is to understand the **concept and request flow of a reverse proxy** through a practical AWS implementation rather than simply configuring Nginx.

```text
Client
  ↓
Proxy
  ↓
Private Backend
```
