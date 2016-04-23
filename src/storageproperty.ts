import {LocalStorage} from "./localstorage";
import {SessionStorage} from "./sessionstorage";

export function StorageProperty(storageKey?: string, storage: "Local" | "Session" = "Local") {
	return (target: Object, decoratedPropertyName: string): void => {
		storageKey = storageKey || decoratedPropertyName;
		let storeObject: LocalStorage = null;
		let initializing: boolean = true;

		/*in the current context, 'this' is the module containing the StorageProperty but what we
		 * actually want is the object with the proerty we're defining. So we create this function
		 * to be bound with the correct 'this' so we can have access to its properies. Of which,
		 * one should be an instance of LocalStorage or SessionStorage
		 */
		var findStore = function(obj: any) {
			if (!storeObject) {
				let storeKey = Object.keys(obj).find(function(key){
					return storage == "Local" ? obj[key] instanceof LocalStorage : obj[key] instanceof SessionStorage;
				});
				storeKey && (storeObject = obj[storeKey]);
				if(!storeObject){
					throw new Error("Object must have a property that is an instance of "+ storage +"Storage.")
				}
			}
			return storeObject;
		}

		Object.defineProperty(target, decoratedPropertyName, {
			get: function() {
				initializing = false;
				findStore(this);
				return storeObject.getItem(storageKey);
			},
			set: function(value){
				if (initializing) {
					initializing = false;
					findStore(this);
					let storedValue = storeObject.getItem(storageKey);
					if (typeof storedValue != "undefined") {
						return;
					}
				}
				storeObject.setItem(storageKey, value);
			},
			enumerable: false
		});

	};
}