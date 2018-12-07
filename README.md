# Phone Home
> Have all of your devices call in, and know when they were online last

## Setup
1. Install deps:
```bash
yarn
```

2. Create some certificates. I like self-signing
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

3. Run the server
```bash
node server
```


## Interacting with the server
Do it lazily with cURL!

### Updating
```bash
curl -X POST -H "authorization: secrets don't go on github" https://SERVER_URL:5001/key/laptop -k
```

### Retrieving All Records
```bash
curl -H "authorization: secrets don't go on github" https://SERVER_URL:5001/all -k
```

## Running on Startup
Create a Systemd service unit:
```ini
[Unit]
Description=Phone Home Service

[Service]
ExecStart=/path/to/curl_script

[Install]
WantedBy=multi-user.target
```

* Save it under `/etc/systemd/system/phone-home.service`
* Start the service `sudo systemctl start phone-home.service`
* Enable it! `sudo systemctl enable phone-home.service`