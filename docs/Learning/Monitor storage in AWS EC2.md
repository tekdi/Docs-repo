# MOnitore Storage in AWS EC2
`**Step 1**`
![AWS](../../static/AWS%20/img1.png)
![AWS](../../static/AWS%20/img2.png)
![AWS](../../static/AWS%20/img3.png)
![AWS](../../static/AWS%20/img4.png)
![AWS](../../static/AWS%20/img5.png)
![AWS](../../static/AWS%20/img6.png)


`**Step 2**`

**Install CloudWatch agent**

1. In EC2 instance Terminal 

```
cd /tmp
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```


2. Configure CloudWatch agent

```
sudo vi /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```
enter the following snippet in the above file
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
     }
   }
 }
}
```

```
sudo systemctl restart amazon-cloudwatch-agent     (restarts the cloudwatch agent)
tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

![AWS](../../static/AWS%20/img7.png)
![AWS](../../static/AWS%20/img8.png)
![AWS](../../static/AWS%20/img9.png)
![AWS](../../static/AWS%20/img10.png)
![AWS](../../static/AWS%20/img11.png)
![AWS](../../static/AWS%20/img12.png)
![AWS](../../static/AWS%20/img13.png)