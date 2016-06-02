/**
 * Created by ericjohndixon on 3/15/16.
 */
(function () {
    'use strict';

    angular
        .module('angular-http-helper', [])
        .factory('HttpHelper', HttpHelper)
        .factory('UrlCache', UrlCache)
        .factory('cacheSets', cacheSets);

    /*****************************************************************************************************
     * HTTP HELPER
     *****************************************************************************************************/
    HttpHelper.$inject = ['$http', 'UrlCache'];

    function HttpHelper($http, UrlCache) {
        return {
            get: getMethod,
            post: postMethod,
            put: putMethod,
            delete: deleteMethod,
            jsonp: jsonpMethond
        };

        /////////////////////////////////////////////////////////

        /********************************************************************
         * GET
         ********************************************************************/
        function getMethod(url, willCache, cacheSetName) {
            willCache = (willCache) ? willCache : false;
            url = (cacheSetName) ? UrlCache.addUrl(cacheSetName, url) : url;
            return $http.get(url, {cache: willCache});
        }

        /********************************************************************
         * POST
         ********************************************************************/
        function postMethod(url, data, cacheSetNames) {
            (cacheSetNames) ? UrlCache.deleteUrlCache(cacheSetNames) : '';
            return $http.post(url, data);
        }

        /********************************************************************
         * PUT
         ********************************************************************/
        function putMethod(url, data, cacheSetNames) {
            (cacheSetNames) ? UrlCache.deleteUrlCache(cacheSetNames) : '';
            return $http.put(url, data);
        }

        /********************************************************************
         * DELETE
         ********************************************************************/
        function deleteMethod(url, cacheSetNames) {
            (cacheSetNames) ? UrlCache.deleteUrlCache(cacheSetNames) : '';
            return $http.delete(url);
        }

        /*****************************************************************************************************
         * JSONP
         *****************************************************************************************************/
         function jsonpMethond(url, willCache, cacheSetName) {
            willCache = (willCache) ? willCache : false;
            url = (cacheSetName) ? UrlCache.addUrl(cacheSetName, url) : url;
            return $http.jsonp(url, {cache: willCache});
        }
    }

    /*****************************************************************************************************
     * URL CACHE SERVICE
     *****************************************************************************************************/
    UrlCache.$inject = ['$cacheFactory', 'cacheSets'];

    function UrlCache($cacheFactory, cacheSets) {
        var urlCache = cacheSets;

        return {
            deleteUrlCache: deleteUrlCache,
            deleteAllUrlCache: deleteAllUrlCache,
            deleteUrlCacheByUrl: deleteUrlCacheByUrl,
            addUrl: addUrl
        };

        /////////////////////////////////////////////////////////


        //deletes a single url cached within a named set
        function deleteUrlCacheByUrl(name, url) {
            if (urlCache.get(name)) {
                $cacheFactory.get('$http').remove(url);
                urlCache.remove(name, url);
            } else {
                console.log('No cache is currently saved by the name' + name);
            }
        }

        // deletes cache set of urls based on array of names or single name passed
        function deleteUrlCache(urlItems) {
            //if it is array delete the array of names
            if (Array.isArray(urlItems)) {
                for(var i = 0; i < urlItems.length; i++) {
                    deleteUrlCacheByName(urlItems[i]);
                }
            } else { //if it is a single name delete that one
                deleteUrlCacheByName(urlItems);
            }

        }

        function deleteUrlCacheByName(name) {
            if (urlCache.get(name)) {
                urlCache.get(name).forEach(function (url) {
                    $cacheFactory.get('$http').remove(url);
                });
                urlCache.reset(name);
            }
        }


        function deleteAllUrlCache() {
            for (var name in urlCache) {
                deleteUrlCache(name);
            }
        }

        // this function returns the url to cut down on line within the services
        function addUrl(name, url) {
            urlCache.add(name, url);
            return url;
        }
    }

    /*****************************************************************************************************
     * CACHE SETS
     *****************************************************************************************************/
    function cacheSets() {
        var sets = {};
        return {
            get: getSet,
            add: addUrl,
            remove: removeUrl,
            reset: resetSet
        };

        ////////////////////////////////////////////////

        function getSet(name) {
            if(sets[name]) {
                return sets[name];
            } else {
                return [];
            }
        }

        function addUrl(name, url) {
            if (!sets[name]) {
                resetSet(name);
            } else {
                for(var i = 0; i < sets[name].length; i++){
                    if(sets[name][i] == url) {
                        return;
                    }
                }
            }
            sets[name].push(url);
        }

        function removeUrl(name, url) {
            if(sets[name]) {
                for (var i = 0; i < sets[name].length; i++) {
                    if(sets[name][i] == url) {
                        sets[name].splice(i, 1);
                        return;
                    }
                }
            }
        }

        function resetSet(name) {
            sets[name] = [];
        }
    }
})();