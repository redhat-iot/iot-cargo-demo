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

Building and running the Data Streamer (optional)
-------------------------------------------------

Note: this project no longer uses this sample demo streamer, and it may be removed very soon!

	$ cd datastream/
	$ npm install
	$ npm start

You will see:

	Listening to 0.0.0.0:8081...
	Sun Jun 12 2016 14:51:12 GMT-0400 (EDT) Server is listening on port 8081

This starts a WebSocket server listening on the above port. Leave this server running and build/run the dashboard in the next step.

Building and running the Dashboard
-----------------------------------------
The dashboard is a Java EE web app built using Maven that can be deployed to JBoss EAP 6.x, 7.x, or later.
Building the project results in a .war file. Once deployed to JBoss EAP (e.g. by copying to the 
`standalone/deployments` directory), access the dashboard at `http://localhost:8080`. It will attempt to 
connect to the EuroTech Device Cloud and start streaming data from selected devices and sensors.

It also relies on a [JBoss Data Grid server](https://www.redhat.com/en/technologies/jboss-middleware/data-grid)
to be available using its built-in REST interface.

To build:

    $ cd dashboard
    $ cp app.properties.template app.properties
    $ vi app.properties # make necessary changes to provide credentials and URLs
	$ bower install
	$ mvn package
	$ cp target/ROOT.war /my/jboss/standalone/deployments

If it successfully deploys, you should be able to access the dashboard at `http://localhost:8080`.
Click around, and enjoy.
