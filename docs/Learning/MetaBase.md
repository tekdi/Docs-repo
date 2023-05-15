
Metabase is an open-source business intelligence platform. You can use Metabase to ask questions about your data, or embed Metabase in your app to let your customers explore their data on their own.

# Metabase setup installation guide

**Running Metabase on Docker**

To run the matabase on docker you must have docker installed.

https://docs.docker.com/engine/install/ubuntu/

Metabase provides an official Docker image via Dockerhub that can be used for deployments on any system that is running Docker.

Visit this link:
https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker

Assuming you have Docker installed and running, get the latest Docker image:

```
docker pull metabase/metabase:latest
```
Then start the Metabase container:
```
docker run -d -p 3000:3000 --name metabase metabase/metabase

```
This will launch an Metabase server on port 3000 by default.

Once startup completes, you can access your Open Source Metabase at http://localhost:3000.

You can create the service using docker comspose file. Just create `docker-compose.yml` file and paste below script

```
version: '3'
services:
  metabase:
    image: metabase/metabase
    ports:
      - "3006:3000"
```


Create your admin account

Connect to database by selecting `ADD DATABASE`

Select database type, host, port, db name, username, password, schemas.

**Answer the questions**:

What is your preferred language : English

Then you will get the following table. In that you will have to accurate details as Name, Last name, Email-ID, Company name, Password Etc.

![mb_img](../../static/metabase%20img/image1.png)

Then add Database in it.

If you want to add PostgresDB then directly select it from option or if you want to add another database like clickhouse then select `I’ll add my data late`
![mb_img](../../static/metabase%20img/image2.png)

After selecting required database (here I have selected PostgresDB) Then add details of database in the next step in which you have to add 

Display name **PostgresDB**

Hostname http://127.0.0.1

Port (Port of DB) ex. 8432

Database Name (ex.Postgres)

Password of DB (ex.AS@#779LSJ!gh)
Then save and add DB

![mb_img](../../static/metabase%20img/image3.png)


**Creating Dashboards**: 

`Step 1` :
Home > New > SQL Query

![mb_img](../../static/metabase%20img/image4.png)


`Step 2` : 
Add Database (postgres_DB) and run a query in the box after that click on play button in the right bottom corner 


![mb_img](../../static/metabase%20img/image5.png)


`Step 3` : 
In the left Bottom click on Visualization and select a visual (here i have selected gauges)
And click on Done 

![mb_img](../../static/metabase%20img/image6.png)


`Step 4` : 
Click on right top corner Save button
After that you will find out the following window in which you have to add Name of the query and Save

![mb_img](../../static/metabase%20img/image7.png)


`Step 5` : 
Click on Yes!please to add this on Dashboard and choose a Dashboard if exist or add new Dashboards
(here selected ULP_DEV)

![mb_img](../../static/metabase%20img/image8.png)

![mb_img](../../static/metabase%20img/image9.png)


`Step 6` :
After that add multiple queries and add to same Dashboards then final Dashboard will be of following type

![mb_img](../../static/metabase%20img/image10.png)

