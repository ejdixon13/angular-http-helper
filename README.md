
This is an angular service that wraps the $http service allowing for easy caching and removing of cache.

## Requirements

- AngularJS

## Usage


You can get it from [Bower](http://bower.io/)

```sh
bower install angular-http-helper
```

Load the script files in your application:

```html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-http-helper/dist/angular-http-helper.min.js"></script>
```

Add the specific module to your dependencies:

```javascript
angular.module('myApp', ['angular-http-helper', ...])
```

Example Usage:
```
.controller('MyCtrl' ['HttpHelper', function(HttpHelper) {
    HttpHelper.get('api/some-endpoint', true, 'some-endpoint-cache') // This will also create a cache with name 'some-endpoint-cache'
        .then(function(data){
    //do something with the data returned
    });

    var data = 'Some arbitrary data';
    HttpHelper.put('api/some-endpoint', data, 'some-endpoint-cache'); // This will also delete the cache with the name 'some-endpoint-cache'. You may also pass in an array of caches as well

}
```