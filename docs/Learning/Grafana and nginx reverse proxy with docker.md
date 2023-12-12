To access grafana via domain name we need to do below configuration on server.

We have to upstream the Grafana in Nginx.conf file as below: 

```
upstream grafana {
  server 10.10.10.5:3000;
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
