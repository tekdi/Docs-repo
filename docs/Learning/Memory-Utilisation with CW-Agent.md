**To set up the amazon cloudwatch agent on the server** 


**`Step 1`** : 


To set up the Amazon cloudwatch agent for the Memory utilization on the server first check the cloudwatch agent package is installed on the server or not with the following command : 



```
	sudo systemctl status amazon-cloudwatch-agent.service 
```


If the cloudwatch agent is not installed on the server then installed it by following commands :  

```
	wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
```

```
sudo dpkg -i amazon-cloudwatch-agent.deb
```

```
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

```
sudo systemctl start amazon-cloudwatch-agent
```

```
sudo systemctl enable amazon-cloudwatch-agent
```

```
sudo systemctl status amazon-cloudwatch-agent
```

Then you will get the output like below : 

```
sudo systemctl status amazon-cloudwatch-agent.service 
● amazon-cloudwatch-agent.service - Amazon CloudWatch Agent
     Loaded: loaded (/etc/systemd/system/amazon-cloudwatch-agent.service; disabled; vendor preset: enabled)
     Active: active (running) since Wed 2024-03-13 05:21:06 UTC; 28min ago
   Main PID: 16741 (amazon-cloudwat)
      Tasks: 13 (limit: 38170)
     Memory: 200.8M
     CGroup: /system.slice/amazon-cloudwatch-agent.service
             └─16741 /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent -config /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.toml -envconfig /opt/aws/amazon-cloudwatch-agent/etc/env-co>
```

**`Step 2`** :


Once your Cloudwatch agent is installed and running fine then for the memory utilization follow the steps below : 

```
	wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
```


```
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```


```
sudo vi /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

And add below content in the file : 

```
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "append_dimensions": {
        "InstanceId": "${aws:InstanceId}"
    },
    "metrics_collected": {
      "disk": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/"
        ]
      },
          "mem": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/"
        ]
      }
     }
  }
}

```



```
sudo systemctl restart amazon-cloudwatch-agent
```

```
sudo systemctl status amazon-cloudwatch-agent
```

```
tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

