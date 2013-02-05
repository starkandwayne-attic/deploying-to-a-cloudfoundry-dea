# Deploying to a CloudFoundry DEA

Cloud Foundry is a Platform-as-a-Service that you can either run in your own datacenter/private cloud or use a publicly hosted version. It is [entirely open source](github.com/cloudfoundry/).

To understand how Cloud Foundry works it is useful to dissect it and look at its parts.

This repository aims to demonstrate how to use the Droplet Execution Agent (DEA) in isolation to deploy an application. We will run a DEA on your local machine (no databases or persistent storage required) to deploy a simple prepared Ruby application.

## Quick demo

Running `foreman start` will start the two main parts of Cloud Foundry we need (nats & dea) and a 3rd process to automatically "deploy" an application into the DEA via nats.

```
$ cd /tmp
$ git clone git://github.com/StarkAndWayne/deploying-to-a-cloudfoundry-dea.git
$ cd deploying-to-a-cloudfoundry-dea
$ rake bundle_install
$ foreman start
22:58:27 nats.1   | started with pid 29227
22:58:27 dea.1    | started with pid 29228
22:58:27 deploy.1 | started with pid 29229
22:58:29 dea.1    |  INFO -- Starting VCAP DEA (0.99)
22:58:29 dea.1    |  INFO -- Pid file: /tmp/deploying-to-a-cloudfoundry-dea/var/run/dea.pid
22:58:29 dea.1    |  INFO -- Using ruby @ /Users/drnic/.rvm/rubies/ruby-1.9.3-p286/bin/ruby
22:58:29 dea.1    |  INFO -- Using network: 192.168.1.70
22:58:29 dea.1    |  INFO -- Socket Limit:256
22:58:29 dea.1    |  INFO -- Max Memory set to 4.0G
22:58:29 dea.1    |  INFO -- Utilizing 1 cpu cores
22:58:29 dea.1    |  INFO -- Allowing multi-tenancy
22:58:29 dea.1    |  INFO -- Using directory: /tmp/deploying-to-a-cloudfoundry-dea/var/dea/
22:58:29 dea.1    |  INFO -- Initial usage of droplet fs is: 0%
22:58:29 dea.1    |  INFO -- File service started on port: 
22:58:29 dea.1    | DEBUG -- Took 0.000573 to snapshot application state.
...
22:58:30 dea.1    | DEBUG -- Requested Limits: mem=256M, fds=1024, disk=256M
22:58:30 dea.1    | DEBUG -- reserved_mem = 256 MB, max_memory = 4096 MB
22:58:30 dea.1    | DEBUG -- Found staged bits in local cache.
22:58:30 dea.1    | DEBUG -- Took 0.017542 to stage the app directory
22:58:30 dea.1    | DEBUG -- Completed download
22:58:30 dea.1    |  INFO -- Starting up instance (name=sinatra app_id=sinatra ... index=0) on port:58607 debuger:58608
...
22:58:31 deploy.1 | New app registered at: http://192.168.1.70:58607
```

The terminal will display `New app registered at: http://192.168.1.70:58607`. If you open that URL in your browser you will see `Hello World`! Yay!

It will then start displaying internal NATS traffic from the DEA advertising its availability for more apps and the health of the one app that has been deployed.

```
22:58:44 deploy.1 | Msg received on [dea.advertise] : '{"id":"3a83bd3351928bc9e144d04dc678f526","available_memory":3840,"runtimes":["ruby19"],"prod":null}'
22:58:49 deploy.1 | Msg received on [dea.heartbeat] : '{"droplets":[{"droplet":"sinatra","version":"1-1","instance":"8691bf1cdd4a63a7c11faa6ec326c013","index":0,"state":"RUNNING","state_timestamp":1352789911,"cc_partition":"default"}],"dea":"3a83bd3351928bc9e144d04dc678f526","prod":null}'
```

To clean up after this experiment:

```
rm -rf /tmp/deploying-to-a-cloudfoundry-dea
```

## Overview

Deploying an application to a DEA has a few simple requirements.

* Run a NATS server
* Run a DEA using a simple YAML configuration
* Create a startup script and a copy of your application together in a folder
* Publish NATS message dea.DEA_UUID.start to tell the application to deploy the application from its local cached/pre-staged version (or a remote tar)

## What is going on?

During the running demo above, if you view the running processes:

```
$ ps ax
...
31440 s012  S+     0:02.09 ruby ./deploying-to-a-cloudfoundry-dea/nats/bin/nats-server
31441 s012  S+     0:02.79 ruby ./deploying-to-a-cloudfoundry-dea/dea/bin/dea -c config/dea-laptop.yml
31442 s012  S+     0:02.00 ruby ./deploying-to-a-cloudfoundry-dea/bin/dea_deploy sinatra
31467 s012  S+     0:00.07 /bin/sh
31468 s012  S+     0:00.00 /bin/bash ./startup -p 58808
31471 s012  S+     0:01.11 /Users/drnic/.rvm/rubies/ruby-1.9.3-p286/bin/ruby app.rb -p 58808
```

The last line is the running Sinatra app with a port number (58808) provided to it. This application-specific process was invoked from `./startup -p 58808` which is the script that a DEA runs to start any application.
