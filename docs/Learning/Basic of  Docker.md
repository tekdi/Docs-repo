
Docker is a container management service.

The keywords of Docker are develop, ship and run anywhere.

The whole idea of Docker is for developers to easily develop applications, ship them into containers which can then be
deployed anywhere.

**Table of contents:**

- [Features of Docker](#features-of-docker)
- [Why Virtualization ??](#why-virtualization-)
- [Installation](#installation)
- [Docker Architecture](#docker-architecture)


## Features of Docker
Docker has the ability to reduce the size of development by providing a smaller footprint of the operating
system via containers.

With containers, it becomes easier for teams across different units, such as development, QA and Operations to
work seamlessly across applications.

You can deploy Docker containers anywhere, on any physical and virtual machines and even on the cloud.

Since Docker containers are pretty lightweight, they are easily scalable.


## Why Virtualization ??

- Hardware Utilization
- To reduce number of physical servers
- Reduce Cost
- More different OS. Your whole design of virtualization is to target the Applications.

## Installation

Before installing Docker, Linux kernal version should be `3.10` Check with below command:
```
uname -r
```
To install docker on RHEL/Centos/Ubuntu:

RHEL & Centos 
```
sudo yum install docker 
```
Ubuntu
```
sudo apt-get install docker 
```
Verify the version with below command:
```
docker --version
```
Once docker get install check the docker service status with below command:
```
service docker status
```
To start the docker service
```
service docker start
```
To enable the docker service
```
chkconfig docker on
```
With the docker installation `dockerroot` group get created where we have to add the userId to dockerroot group.
```
sudo usermod -aG dockerroot <user-name>
```

## Docker Architecture

To learn about docker architecture refer below link:

https://docs.docker.com/get-started/overview/#docker-architecture

![docker_image](../../architecture.svg)


Let’s see do we have any images
```
sudo docker images
```
So where do I get images from ??

https://hub.docker.com/ {ex- nexus, jenkins, tomcat and centos}


Docker pull is a command that helps to download image or dependency from registry on to docker host
```
docker pull <image_name>
```
By default pull command will download latest copy of image. To download the specific version of an image
```
docker pull image_name:tag_info
```
**I want to see how many containers are running ??**
```
sudo docker ps
```
**How to create container?? Let's see**:

To create and run the container
```
docker run -it <image_name or image id > <controller_shell>
```
(controller shell= /bin/bash or /bin/sh)
 
 Below are optional commands for container
```
docker run -it { attached mode runs in foreground }
docker run -dt { detached mode runs in background }
```

To start and stop container
```
sudo docker star <container_id>
sudo docker stop <conatiner_id>
```
To enter into running container
```
docker exec -it <container-id> bash
```
To start and login into the container which is in exit mode
```
docker start -ai <container_id>
```
Naming container
```
sudo docker run --name <CName> <docker_image> /bin/bash
sudo docker rename <old_CName> <new_CName>
sudo docker ps
exit
```
**How to delete container**

To delete a container it should be `EXITED`
```
sudo docker rm <cid>
or
sudo docker rm <cid> --force
```
