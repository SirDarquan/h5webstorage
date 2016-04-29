# h5webstorage [![Build Status][]][bsl] [![Test Coverage][]][tcl] [![Code Climate][]][ccl] 
#### Html5 WebStorage API for Angular2
[![Sauce Test Status](https://saucelabs.com/browser-matrix/SirDarquan.svg)](https://saucelabs.com/u/SirDarquan)
- [Use](#use)
- [Overview](#overview)
  - [LocalStorage](#localstorage) (service)
  - [SessionStorage](#sessionstorage) (service)
  - [@StorageProperty](#storageproperty) (decorator)
  - [ConfigureStorage](#configurestorage) (function)
  
## Use
1. Download the library:

  `npm install h5webstorage --save`	
2.  Import the Service and the Provider:

  ```typescript
		import {LocalStorage, WEB_STORAGE_PROVIDERS} from "h5webstorage/api";
  ```
3. Register the provider:

  ```typescript
		@Component({
			...
			providers:[WEB_STORAGE_PROVIDERS]	
		})
  ```
4. Inject the service into you class and use:

  ```typescript
		constructor(private localStorage: LocalStorage){
			...	
		}
  ```
		
## Overview
The [angular2-localStorage][] project is what inspired this project with
its use of a decorator to access the values in the storage area. 
Unfortunately, the implementation was difficult to test do to the use of
hard references to static classes. The intention of this project was to 
determine if a higly testable version of webstorage access was possible.

There is an example application that shows the various ways to use the 
webstorage apis but overall the classes were designed to work just like
the native storage objects. In fact, the `BaseStorage` object implements
the Storage interface to give it nearly one-to-one compatibility. The 
LocalStorage/SessionStorage objects were meant to be used as you would the native
localStorage/sessionStorage objects. Here's a quick example:
```typescript
	constructor(private localStorage: LocalStorage){
		this.localStorage["firstKey"] = "This value will appear in storage";
		this.localStorage.setItem("secondKey", "This will also");
		var retrieved = this.localStorage["storedKey"]; //if there is a value in storage it would be retrieved
		console.log(retrieved); 	
	}
```
There is one minor exception: Native storage objects can use a number index
while the wrappers can't. I've never actually seen them used this way so I
can't imagine it's a widely used feature and I'm OK with that missing piece.

Finally, the storage objects are bound both ways, so if a change occurs in
storage, the WebStorage objects receives the change and the application is
immediately updated.
 

### LocalStorage
The `LocalStorage` object is the service that uses the [localStorage][] object
as its backing. To keep the library testable, the native localStorage object
is injected. Normally this would mean importing two items from the library
and placing them both in the providers array which you can do if you 
want to but to simplify this common scenario, the `LOCAL_STORAGE_PORVIDER`
was created which does this job for you.

### SessionStorage
The `SessionStorage` object is just like the `LocalStorage` object except
for using the native [sessionStorage][] object for backing. There is also a
`SESSION_STORAGE_PROVIDER` to simplify registration, just like `LocalStorage`.

### @StorageProperty
`StorageProperty` is a decorator used to simplifiy access to the stored values.
It's able to accept two parameters:
- storageKey: an alternate name for the key in storage
- storage: a string that determines which backing to associate the field with.
	Possible values are "Local"(default) and "Session"

**Note**: In order to use the `@StorageProperty` decorator, you **MUST**
inject the storage service and make it a field of the class. See /example/app/app.ts
for and example.

###ConfigureStorage
The `ConfigureStorage` function creates a provider which allows you to 
inject configuration options for the storage object(s) to be used. 
One thing to remember is that the ConfigureStorage provider will only 
inject into new instances of LocalStorage/SessionStorage. So if you inject 
`LocalStorage` into the root component and only provide `ConfigureStorage`
in a sub-component, it will never be used. But inversely, if the Root
component contains the `ConfigureStorage` provider, then all sub-components
that inject `LocalStorage`/`SessionStorage` will have the options configured.
Here's an example of `ConfigureStorage` being used:
```typescript
import {ConfigureStorage} from "h5webstorage/api";
@Component({
	providers:[ConfigureStorage({ prefix: "myPrefix-" })]	
})
class myClass{}
```

#### - prefix
The storage key prefix has some handy uses. With the angular2
injector hierarchy, the root component can inject a LocalStorage object
that can 'see' all the available keys. Then a sub-component can inject
another LocalStorage object that can only see keys that start with a
specific prefix. This technique is used in the example app included to
allow use to have multiple to do lists.

#### - transformer
By default, values are stored in JSON formatted string using the browsers
JSON.stringify method. This 'serializer' has a limitation of not handling
cylic refrences very well. This easiest way to get around this is just not
to have those types of refrences but sometime that can't be avoided. The
`transformer` property enables replacement of the stringify/parse implementations
used to serialize and deseralize the data from storage.

[angular2-localStorage]: https://github.com/marcj/angular2-localStorage
[localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[sessionStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[Test Coverage]: https://codeclimate.com/github/SirDarquan/h5webstorage/badges/coverage.svg
[tcl]: https://codeclimate.com/github/SirDarquan/h5webstorage/coverage
[Build Status]: https://travis-ci.org/SirDarquan/h5webstorage.svg?branch=master
[bsl]: https://travis-ci.org/SirDarquan/h5webstorage
[Code Climate]: https://codeclimate.com/github/SirDarquan/h5webstorage/badges/gpa.svg
[ccl]: https://codeclimate.com/github/SirDarquan/h5webstorage