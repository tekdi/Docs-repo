To access grafana via domain name we need to do below configuration on server.

We have to upstream the Grafana in Nginx.conf file as below: 

```
upstream grafana {
  server 10.20.0.90:3000;
}

server {
  location /grafana {
    proxy_pass http://grafana;
  
    
  }
}
```

And in docker-compose.yml file we have to add root url as below

```services:
  grafana:
    #...
    environment:
      - GF_SERVER_ROOT_URL=https://mydomain.com/grafana
```

To append the grafana external url with the Nginx then you have to add below entries in grafana block in Nginx.conf file

```
         rewrite  ^/grafana/(.*)  /$1 break;
         proxy_set_header X-Forwarded-Server $host;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         include proxy_params;
         proxy_set_header Host $host;
```