Red Hat IoT Precious Cargo Demo
================================
This is an example IoT demo showing a realtime updating dashboard of data streaming from a Red Hat + Eurotech IoT gateway device through the Eurotech Everyware Cloud. It demonstrates realtime package tracking, alerting, and a telemetry dashboard showing critical measurements of packages in transit, including temperature, humidity, displacement, light levels, etc.

Requirements to build/run

# Nodejs
# NPM
# Bower
# Maven

Technologies used:

- AngularJS
- Patternfly
- Websockets
- JBoss Middleware (EAP, and more to come)

Building and running the Data Streamer
-----------------------------------------

	$ cd [datastream/](datastream/)
	$ npm install && npm start

You will see:

	Listening to 0.0.0.0:8081...
	Sun Jun 12 2016 14:51:12 GMT-0400 (EDT) Server is listening on port 8081

This starts a Websocket server listening on the above port. Leave this server running and build/run the dashboard in the next step.

Building and running the Dashboard
-----------------------------------------
The dashboard is a Java EE web app built using Maven that can be deployed to JBoss EAP 7 or later. Building the project results in a .war file. Once deployed to JBoss EAP (e.g. by copying to the `standalone/deployments` directory), access the dashboard at `http://localhost:8080`. It will attempt to connect to the Data streamer server at `ws://localhost:8081` and start streaming data.

To build:

	$ bower install
	$ mvn package
	$ cp target/ROOT.war /my/jboss/standalone/deployments

