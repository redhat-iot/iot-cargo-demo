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
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.addServer()
              .host("localhost")
              .port(11222);
        cacheManager = new RemoteCacheManager(builder.build());
        cache = cacheManager.getCache("default");
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
