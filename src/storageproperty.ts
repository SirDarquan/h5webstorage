import {LocalStorage} from "./localstorage";
import {SessionStorage} from "./sessionstorage";

/**
 * Associates a property with a key in storage
 * @param options - An object containing properties to determine how the property behaves
 * - storageKey {string} [optional]: The name of the key in storage to use. If not supplied or null, the name of the property is used
 * - storage ("Local" | "Session"): Chooses the type of storage to use (default: "Local")
 * - readOnly {boolean}: determines if the property is read/write or readOnly (default: read/write)
 */
export function StorageProperty(options: { storageKey?: string, storage?: "Local" | "Session", readOnly?: boolean });
/**
 * Associates a property with a key in storage
 * @param storageKey: The name of the key in storage to use. If not supplied or null, the name of the property is used
 * @param storage: Chooses the type of storage to use (default: "Local")
 */
export function StorageProperty(storageKey?: string, storage?: "Local" | "Session");
export function StorageProperty(...params: any[]) {
	return (target: Object, decoratedPropertyName: string): void => {
		let options: { storageKey: string, storage: "Local" | "Session", readOnly: boolean };
		if (params[0] && typeof params[0] == "object") {
			options = Object.assign({}, { storageKey: decoratedPropertyName, storage: "Local", readOnly: false }, params[0]);
		}
		else {
			options = Object.assign({}, { storageKey: params[0] || decoratedPropertyName, storage: params[1] || "Local", readOnly: false });
		}
		let storeObject: LocalStorage = null;
		let initializing: boolean = !options.readOnly;

		/*in the current context, 'this' is the module containing the StorageProperty but what we
		 * actually want is the object with the proerty we're defining. So we create this function
		 * to be bound with the correct 'this' so we can have access to its properies. Of which,
		 * one should be an instance of LocalStorage or SessionStorage
		 */
		var findStore = function (obj: any) {
			if (!storeObject) {
				let storeKey = Object.keys(obj).find(function (key) {
					return options.storage == "Local" ? obj[key] instanceof LocalStorage : obj[key] instanceof SessionStorage;
				});
				storeKey && (storeObject = obj[storeKey]);
				if (!storeObject) {
					throw new Error("Object must have a property that is an instance of " + options.storage + "Storage.")
				}
			}
			return storeObject;
		}

		var propertyObj = {
			get: function () {
				initializing = false;
				findStore(this);
				return storeObject.getItem(options.storageKey);
			},
			enumerable: false
		}

		//if requesting a readOnly property don't create the set
		if (!options.readOnly) {
			propertyObj["set"] = function (value) {
				if (initializing) {
					initializing = false;
					findStore(this);
					let storedValue = storeObject.getItem(options.storageKey);
					if (typeof storedValue != "undefined") {
						return;
					}
				}
				storeObject.setItem(options.storageKey, value);
			}
		}

		Object.defineProperty(target, decoratedPropertyName, propertyObj);

	};
}