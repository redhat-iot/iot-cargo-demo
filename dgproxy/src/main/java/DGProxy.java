/*
 * JBoss, Home of Professional Open Source
 * Copyright 2015, Red Hat, Inc. and/or its affiliates, and individual
 * contributors by the @authors tag. See the copyright.txt in the
 * distribution for a full listing of individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import javax.inject.Inject;
import javax.ws.rs.*;
import org.infinispan.client.hotrod.configuration.*;
import org.infinispan.client.hotrod.*;
import javax.inject.Singleton;
import java.util.Properties;

/**
 * A simple REST service which proxies requests to a local datagrid.
 *
 * @author jfalkner@redhat.com
 *
 */

@Path("/")
@Singleton
public class DGProxy {

    private RemoteCacheManager cacheManager;
    private RemoteCache<String, String> cache;

    public DGProxy() {

        String host = System.getenv("DATASTORE_HOST");
        if (host == null) {
            host = "localhost";
        }

        int port = 11333;
        String portStr = System.getenv("DATASTORE_PORT");
        if (portStr != null) {
            port = Integer.parseInt(portStr);
        }

        String cacheName = System.getenv("DATASTORE_CACHE");
        if (cacheName == null) {
            cacheName = "cargo";
        }

        System.out.println("DG Proxy initializing to " + host + ":" + port + " cache:" + cacheName);

        Properties props = new Properties();
        props.setProperty("infinispan.client.hotrod.protocol_version", "1.0");

        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.withProperties(props).addServer()
              .host(host)
              .port(port);
        cacheManager = new RemoteCacheManager(builder.build());
        cache = cacheManager.getCache(cacheName);

        System.out.println("DG Proxy connected to " + host + ":" + port + " cache:" + cacheName);
    }


    @GET
    @Path("/rhiot/{id}")
    @Produces({ "application/json" })
    public String rhiotGet(@PathParam("id") String id) {
    	return cache.get(id);
    }

    @PUT
    @Path("/rhiot/{id}")
    public void rhiotPut(@PathParam("id") String id, String value) {
	cache.put(id, value);

    }


}
