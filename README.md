Red Hat IoT Precious Cargo Demo
================================
This is an example IoT demo showing a realtime updating dashboard of data streaming from a
[Red Hat + Eurotech](https://www.redhat.com/en/about/press-releases/eurotech-and-red-hat-collaborate-power-more-secure-and-scalable-internet-things-implementations)
IoT gateway device through the [Eurotech Everyware Cloud](http://www.eurotech.com/en/products/software+services/everyware+device+cloud).
It demonstrates realtime package tracking, alerting, and a telemetry dashboard showing critical measurements of packages in transit,
including temperature, humidity, displacement, light levels, etc.

![Dashboard Screenshot](/../screenshots/screenshots/iot-dashboard.png?raw=true "Dashboard Screenshot")

Requirements to build/run:

1. [Nodejs](http://nodejs.org/)
1. [NPM](https://www.npmjs.com/)
1. [Bower](https://bower.io/)
1. [Maven](https://maven.apache.org/)

Technologies used:

- [EuroTech Everyware Device Cloud](http://www.eurotech.com/en/products/software+services/everyware+device+cloud)
- [AngularJS](http://angularjs.org)
- [Patternfly](http://patternfly.org)
- [JBoss Middleware](https://www.redhat.com/en/technologies/jboss-middleware) (EAP, JDG, and more to come)

Building and running the Dashboard
-----------------------------------------
The dashboard is a Java EE web app built using Maven that can be deployed to JBoss EAP 6.x, 7.x, or later.
Building the project results in a .war file. Once deployed to JBoss EAP (e.g. by copying to the 
`standalone/deployments` directory), access the dashboard at `http://localhost:8180`. It will attempt to 
connect to the EuroTech Device Cloud and start streaming data from selected devices and sensors.

It also relies on a [JBoss Data Grid server](https://www.redhat.com/en/technologies/jboss-middleware/data-grid)
to be available using its built-in REST interface.

There are three steps to build and run the demo:

1. [Download](https://access.redhat.com/products/red-hat-jboss-data-grid) and run JBoss Data Grid 7.0.0 or later:
```
    $ unzip jboss-datagrid-7.0.0-server.zip
    $ jboss-datagrid-7.0.0-server/bin/standalone.sh
```
2. [Download](https://access.redhat.com/products/red-hat-jboss-enterprise-application-platform/) and run JBoss EAP 7.0 or later and specify a port offset to avoid port conflicts with Data Grid:
```
    $ unzip jboss-eap-7.0.0.zip
    $ jboss-eap-7.0.0/bin/standalone.sh -Djboss.socket.binding.port-offset=100 -b 0.0.0.0 -bmanagement=0.0.0.0
```  
3. Clone this repo to `<WORKSPACE>` directory, and build the Data Grid proxy, and deploy to EAP
```
    $ cd <WORKSPACE>/dgproxy
    $ mvn clean package
    $ cp target/dgproxy.war <JBOSS_EAP_HOME>/standlone/deployments
```
4. Supply your Eurotech and Google API credentials, then build and run the dashboard:
```
    $ cd <WORKSPACE>/dashboard
    $ cp app.properties.template app.properties
    $ vi app.properties # make necessary changes to provide credentials and URLs
    $ bower install
    $ mvn package
    $ cp target/ROOT.war <JBOSS_EAP_HOME>/standalone/deployments
```

If it successfully deploys, you should be able to access the dashboard at `http://localhost:8180`.
