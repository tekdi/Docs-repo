# NGINX Configuration Documentation for HTTPS Redirection and Proxy Pass

**Purpose**:
This document provides a detailed explanation of the NGINX configuration for redirecting HTTP traffic to HTTPS and setting up a proxy server for a backend application. The configuration is tailored for a domain, which is replaced here with "Your_Domain" for reference. Additionally, instructions on issuing SSL certificates using Let’s Encrypt are included.

**NGINX Configuration Overview**
The configuration consists of three server blocks:
1. Redirect non-www HTTPS traffic to www HTTPS
2. Redirect HTTP (both www and non-www) traffic to HTTPS www
3. Serve the application via www HTTPS with a proxy pass to backend services



**NGINX Configuration Details**

```
server {
    # Redirect non-www HTTPS to www HTTPS
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name Your_Domain;

    ssl_certificate /etc/letsencrypt/live/Your_Domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/Your_Domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://www.Your_Domain$request_uri;
}

server {
    # Redirect HTTP (www and non-www) to HTTPS www
    listen 80;
    listen [::]:80;
    server_name Your_Domain www.Your_Domain;

    return 301 https://www.Your_Domain$request_uri;
}

server {
    # Main server block for www HTTPS traffic
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.Your_Domain;

    ssl_certificate /etc/letsencrypt/live/Your_Domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/Your_Domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    index index.html index.htm index.nginx-debian.html;

    location / {
        resolver              1.1.1.1 ipv6=off;
        proxy_pass http://127.0.0.1:3003;
        client_max_body_size 30m;
        proxy_read_timeout 700s;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Connection "";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
        proxy_headers_hash_max_size 1024;
        proxy_headers_hash_bucket_size 512;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' '*';
            add_header 'Access-Control-Allow-Headers' '*';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    location /metabase/ {
        resolver              1.1.1.1 ipv6=off;
        proxy_pass http://127.0.0.1:3201/;
    }
}
```



**SSL Certificate Issuance**
Using Let’s Encrypt with Certbot
Install Certbot and NGINX Plugin:

```
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**Obtain SSL Certificates**:
Run the following command to obtain and configure SSL certificates for "Your_Domain" and "www.Your_Domain":
``` 
sudo certbot --nginx -d Your_Domain -d www.Your_Domain
```


Automatic Renewal:
Certbot sets up a cron job for automatic certificate renewal. Verify with:
```
sudo systemctl list-timers
```

Test Renewal:
You can manually test the renewal process:
```
sudo certbot renew --dry-run
```

**How Redirection Works**

1. Non-WWW HTTPS to WWW HTTPS:
  - Listens on port 443 with SSL enabled.
  - Redirects traffic from https://Your_Domain to https://www.Your_Domain.


2. HTTP to HTTPS:
  - Listens on port 80 for both Your_Domain and www.Your_Domain.
  - Redirects all traffic to https://www.Your_Domain.


3. Main Server Block:
  - Handles HTTPS traffic for www.Your_Domain.
  - Configures a proxy pass to backend services running on ports 3003 and 3201.
  - Includes optimizations for buffer sizes and headers.



**Additional Notes**
  - Buffer Settings:
    Adjust buffer settings based on the expected payload size to avoid upstream sent too big header errors.


**CORS Support:**
  The configuration includes headers to handle preflight CORS requests for APIs.






**Logging**:
  Enable logging in NGINX for debugging redirection or proxy issues if needed:
``` 
access_log /var/log/nginx/access.log;
error_log /var/log/nginx/error.log;
```

This configuration ensures secure and efficient traffic management for "Your_Domain" while adhering to best practices for HTTPS and backend service proxies.

------------------------------------------------------------------------------------------------------------

## Checking the Nginx configs

**How to use this script** : 

1. Clone the script on the server or local 
Link to script : Domain_checker_script

2. Give permissions as below : 

```
chmod +x domain_checker.sh
```

3. Run the Script with below command : 

```
./domain_checker.sh <Your_Domain_Name>
```





