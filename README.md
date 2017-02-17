Red Hat IoT Precious Cargo Demo
================================
This is an example IoT demo showing a realtime updating dashboard of data streaming from a
[Red Hat + Eurotech](https://www.redhat.com/en/about/press-releases/eurotech-and-red-hat-collaborate-power-more-secure-and-scalable-internet-things-implementations)
IoT gateway device through the [Eurotech Everyware Cloud](http://www.eurotech.com/en/products/software+services/everyware+device+cloud).
It demonstrates realtime package tracking, alerting, and a telemetry dashboard showing critical measurements of packages in transit,
including temperature, humidity, displacement, light levels, etc.

![Dashboard Screenshot](/../screenshots/screenshots/iot-dashboard.png?raw=true "Dashboard Screenshot")

Technologies used:

- [EuroTech Everyware Device Cloud](http://www.eurotech.com/en/products/software+services/everyware+device+cloud)
- [AngularJS](http://angularjs.org)
- [Patternfly](http://patternfly.org)
- [JBoss Middleware](https://www.redhat.com/en/technologies/jboss-middleware) (EAP, JDG, and more to come)

Running on OpenShift
--------------------

The demo deploys as an Angular.js app running on a Node.js runtime, along with JBoss Data Grid and a Data Grid
proxy component that properly handles browser-based REST requests and relays to JBoss Data Grid via the Hotrod
protocol.

Follow these steps to build and run the demo:

1. Install and have access to an [OpenShift Container Platform](https://www.openshift.com/container-platform/) 3.2 or later or [OpenShift Origin](https://www.openshift.org/) 1.2 or later. You must be able to use the `oc` command line tool.

2. Clone this repo
```
git clone https://github.com/redhat-iot/iot/cargo/demo
```

3. Issue the following commands to create a new OpenShift project and deploy the demo components:
```
oc new-project myproject
oc policy add-role-to-user view system:serviceaccount:$(oc project -q):default -n $(oc project -q)
oc process -f openshift-template.yaml | oc create -f -
```

You can monitor the build with `oc status` or watch the deployments using the OpenShift web console.

Once everything is up and running, you can access the demo using the URL of the `dashboard` route,
for example `http://dashboard-myproject.domain`

Options
-------

If you have a maven mirror (e.g. Nexus), you can specify it with the `MAVEN_MIRROR_URL` environment variable when deploying the demo:
```
oc process -f openshift-template.yaml MAVEN_MIRROR_URL=http://nexus.ci:8081/repository/maven-public-all| oc create -f -
```

If you have a Google Maps API Key, specify it similarly with `GOOGLE_MAPS_API_KEY` environment variable.
