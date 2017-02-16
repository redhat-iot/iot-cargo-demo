var config =
{
  BROKER_WEBSOCKET_ENDPOINT: process.env.BROKER_WEBSOCKET_ENDPOINT || "http://kapua-broker-ws/ws",
  BROKER_USERNAME: process.env.BROKER_USERNAME || "kapua",
  BROKER_PASSWORD: process.env.BROKER_PASSWORD || "kapua",
  DATASTORE_REST_HOSTNAME: process.env.DATASTORE_PROXY_SERVICE + '-' + process.env.OPENSHIFT_BUILD_NAMESPACE,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || ""
};

module.exports = config;
