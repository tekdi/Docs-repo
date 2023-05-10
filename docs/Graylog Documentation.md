
# Graylog Documentation 

**`Step 1`** : Install docker on your system 

**`Step 2`** : Perform a command 
```
    sudo docker swarm init
```
**`Step 3`** : Create a file with name `docker-compose.yml`  and add below instructions in it 

```
version: '3.3'
services:
 # MongoDB: https://hub.docker.com/_/mongo/
 mongodb:
   image: mongo:4.2
   volumes:
     - mongo_data:/data/db
  # Elasticsearch: https://www.elastic.co/guide/en/elasticsearch/reference/7.10/docker.html
 elasticsearch:
   image: docker.elastic.co/elasticsearch/elasticsearch-oss:7.10.2
   volumes:
     - es_data:/usr/share/elasticsearch/data
   environment:
     - http.host=0.0.0.0
     - transport.host=localhost
     - network.host=0.0.0.0
     - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
   mem_limit: 1g
 # Graylog: https://hub.docker.com/r/graylog/graylog/
 graylog:
   image: graylog/graylog:4.3
   volumes:
     - graylog_data:/usr/share/graylog/data
   environment:
     # CHANGE ME (must be at least 16 characters)!
     - GRAYLOG_PASSWORD_SECRET=ZSp^5J8t7@hruBqQ
     # Password: admin
     - GRAYLOG_ROOT_PASSWORD_SHA2=ff72eb281ed3039e0fc3c8fd4a92e3809419a384cedff152ba518104d109ed9b
     - GRAYLOG_HTTP_EXTERNAL_URI=http://10.125.13.58:3000/
   entrypoint: /usr/bin/tini -- wait-for-it elasticsearch:9200 --  /docker-entrypoint.sh
   links:
       - mongodb:mongo
       - elasticsearch
   # restart: always
   depends_on:
     - mongodb
     - elasticsearch
   ports:
     # Graylog web interface and REST API
     - 9000:9000
     # Syslog TCP
     - 1514:1514
     # Syslog UDP
     - 1514:1514/udp
     # GELF TCP
     - 12201:12201
     # GELF UDP
     - 12201:12201/udp
# Volumes for persisting data, see https://docs.docker.com/engine/admin/volumes/volumes/
volumes:
 mongo_data:
   driver: local
 es_data:
   driver: local
 graylog_data:
   driver: local
```

**`Step 4`** : Create a GRAYLOG_ROOT_PASSWORD_SHA2 with following command 
echo -n "Enter Password: " && head -1 </dev/stdin | tr -d '\n' | sha256sum | cut -d" " -f1

**`Step 5`** : 
After that put a password you have added in the docker-compose file here 
Ex. ZSp^5J8t7@hruBqQ (as this password is mention in above file)

**`Step 6`** : Then you will get a GRAYLOG_ROOT_PASSWORD Replace this new password with the password present in the docker-compose.yml file

**`Step 7`** : 
	Run a command : 	
 ```      
        sudo docker-compose up -d mongodb
        sudo docker-compose up -d elasticsearch
        sudo docker-compose up -d graylog
```

**`Step 8`** : 
	Go to Browser and search for http://ip:9000 then you will be at Graylog front pages use 
Username : admin
Password : ZSp^5J8t7@hruBqQ (as i have this password in my dockercompose file)




**`Step 9`** : 
	Go to graylog —>system —> inputs


**`Step 10`** : 
	Select GELF TCP —> Launch new input

**`Step 11`** : 
	Put below details 
	Tittle : server-logs (Editable)
	Port : 12201
	And SAVE


**`Step 12`** : 
	Add Logging driver into service docker-file which logs you want 

```
	logging:
      	  driver: 'gelf'
        options:
          gelf-address: "tcp://<IP>:12201"
```


**`Step 13`** :  Recreate a service once again with following command 

            sudo docker-compose up -d --no-deps --force-recreate (servicename)
