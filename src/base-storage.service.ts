import { EventEmitter, NgZone, OnDestroy, OpaqueToken } from '@angular/core';
/**
 * The token used to allow injection of the {@link StorageOptions} interface. For more information visit the
 * {@link https://angular.io/docs/ts/latest/guide/dependency-injection.html#interface angular2 docs}.
 */
export let STORAGE_OPTIONS = new OpaqueToken('StorageOptions');

/**
 * An object that SERializes and DESeriallizes values for storage. The default implementation for the SerDes object is:
 * `{ provide: SERDES_OBJECT, useValue: { stringify: JSON.stringify, parse: JSON.parse } }` which is essentially the
 * `{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON window.JSON}` object.
 * Due to the fact that the JSON object is also an interface in TypeScript, it couldn't be used as-is. This is the reason
 * the default implementation defines the `stringify` and `parse` methods individually instead of just using the JSON object
 * as the value.
 *
 * Should you want to implement customized serialization and deserialization for something like encrypted storage, simply
 * provide new methods for stringify and parse and you're good to go.
 */
export let SERDES_OBJECT = new OpaqueToken('SerdesObject');

/**
 * Defines options used by the storage classes to determine how they will interact. This will be injected into any Storage classes
 * created with or after creation of the options. Here is a comon usage of StorageOptions:
 *
 *     import {Component} from "@angular/core";
 *     import {ConfigureStorage} from "h5webstorage";
 *
 *     @Component({
 * 	     providers:[ConfigureStorage({ prefix: ''})]
 *     })
 *     export class AppModule{}
 *
 *
 * {@link ConfigureStorage} creates a provider for your configuration options which is injected into the next Storage class instantiated.
 * Since these options were added to the 'AppModule', it will apply globally and all {@link LocalStorage} and {@link SessionStorage} will
 * have these options injected unless overridden by a new set of options.
 *
 * Remember, {@link https://angular.io angular2} has an injection heirarchy and multiple providers for one type can be created. Lets explore
 * how this might work. Using our example above, the prefix '/' is used on all keys for the entire application. This will prevent
 * h5websetorage from assuming it controls all the keys in storage. Let's also assume we have created a wrapper around the `LocalStorage`
 * object to apply business logic to the data and a subset of the keys needs to be read-only admin stuff. How can we set the values if the
 * wrapper of those values are read-only? Here is how I would solve this problem:
 *
 *     import {Component} from "@angular/core";
 *     import {LocalStorage, ConfigureStorage} from "h5webstorage";
 *     import {AppSettings} from "./myApp.settings";
 *     @Component({
 *     	providers: [LocalStorage, ConfigureStorage({ prefix: '/admin/'})]
 *     })
 *     export class AdminPanel{
 *     	constructor(localStorage: LocalStorage, settings: AppSettings){ ... }
 *     }
 *
 * Let me explain what just happened, AdminPanel is a component under AppModule. AppSettings is the global application setting that handles
 * business logic for the storage which has the read-only admin area. AppSettings can see all the application keys that begin with '/' so
 * that includes '/admin/'. AdminPanel takes advantage of the injection heirarcy in angular2 by asking for a new instance of `LocalStorage`.
 * If we stopped there, it would work the exact same way as the `LocalStorage` in AppSettings which is why there is a new `ConfigureStorage`
 * call in the providers array also. This will tell angular2 to inject these new options into the new `LocalStorage` instance which will be
 * scoped to only the '/admin/' keys. `LocalStorage` has no restrictions on which keys it can modify within its scope. Creating, updating,
 * modifying or deleting a key in `LocalStorage` within AdminPanel will reflect immediately in the AppSettings instance.
 */
export interface StorageOptions {
	/**
	 * A string that will proceed the key name in storage. By default, prefix is empty and allows all keys in storage to be accessed.
	 * By setting prefix to a non-empty value, the storage class becomes scoped to values whose keys begin with the specified prefix
	 * and all operations will stay within that scope.
	 */
	prefix?: string;

	/**
	 * Determines what to do when an exception occurs when loading from storage. Setting to true will cause the value retrieved
	 * to be serialized by the loaded transformer. Otherwise, the value will be set to null (default).
	 */
	serializeOnException?: boolean;
}
enum KeyDirection {
	From,
	To
}

/**
 * BaseStorage is where all the implementation of the storage system resides. This can be used to make custom storage objects if needed
 * but more than likely, `LocalStorage` and `SessionStorage` will handle everything you need and creating services around those will
 * be easier than creating a new storage object. But for those situations where something else is needed, this is the class for you.
 *
 * NOTE: BaseStorage is an abstract class but the documentation generator makes no distintion.
 */
export abstract class BaseStorageService implements OnDestroy, Storage {

	/**
	 * Initializes the storage system by attaching to the angular2 change detection system and the Storage event system. Then
	 * syncronizes the object with data from storage while respecting the options set. {@link LocalStorage}
	 *
	 * @param ngZone - The Zone handling angular 2 change detection.
	 * @param storage - An object that implements the Storage interface. Generally [localStorage][] or [sessionStorage][]
	 * [localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
	 * [sessionStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
	 * @param transformer - An object that implements the JSON interface. This is injected using the {@link SERDES_OBJECT}
	 * @param options - Contains the options that will be used with the instance
	 */
	constructor(ngZone: NgZone, storage: Storage, transformer: JSON, options?: StorageOptions) {
		// options = Object.assign({ prefix: "", transformer: JSON }, options);
		this.setProperty('options', options);
		this.setProperty('transformer', transformer);
		this.setProperty('storage', storage);

		this.UpdateFromStorage();

		const subscription = ngZone.onMicrotaskEmpty.subscribe(() => {
			const fromStorage: boolean = this.getProperty<boolean>('fromStorage');
			fromStorage ? this.UpdateFromStorage() : this.WriteToStorage();
		});

		const listener = (event: StorageEvent) => event.storageArea === storage && this.setProperty('fromStorage', true);
		window.addEventListener('storage', listener);

		this.setProperty('subscription', subscription);
		this.setProperty('listener', listener);
	}

	private normalizeStorageKey(name: string, dir: KeyDirection): string {
		const options = this.getProperty<StorageOptions>('options');
		return dir === KeyDirection.From ? name.replace(options.prefix, '') : options.prefix + name;
	}

	private serialize(value: any) {
		const transformer = this.getProperty<JSON>('transformer');
		return transformer.stringify(value);
	}

	private deserialize(value: any) {
		const transformer = this.getProperty<JSON>('transformer');
		return transformer.parse(value);
	}

	private WriteToStorage() {
		const prevValue = this.getProperty<string>('prevValue');
		const currValue = this.serialize(this);
		// tslint:disable-next-line:triple-equals
		if (prevValue != currValue) {
			const storage = this.getProperty<Storage>('storage');
			const prevStorage = this.deserialize(prevValue);
			Object.keys(this).forEach((key) => {
				const _key = this.normalizeStorageKey(key, KeyDirection.To);
				const value = this[key];
				if (typeof this[key] !== 'undefined') {
					storage.setItem(_key, this.serialize(this[key]));
					delete prevStorage[key];
				}
			}, this);

			for (const key in prevStorage) {
				if (prevStorage.hasOwnProperty(key)) {
					storage.removeItem(this.normalizeStorageKey(key, KeyDirection.To));
				}
			}

			this.setProperty('prevValue', this.serialize(this));
		}
	}

	private UpdateFromStorage() {
		const options = this.getProperty<StorageOptions>('options');
		const storage = this.getProperty<Storage>('storage');
		const tmp = Object.assign({}, this);
		Object.keys(storage).forEach((key) => {
			if (!key.startsWith(options.prefix)) {
				return;
			}
			const _key = this.normalizeStorageKey(key, KeyDirection.From);
			try {
				delete tmp[_key];
				this[_key] = this.deserialize(storage[key]);
			} catch (e) {
				this[_key] = options.serializeOnException ?
					this.serialize(storage[key]) :
					null;
			}

		});
		for (const key in tmp) {
			if (tmp.hasOwnProperty(key)) {
				delete this[this.normalizeStorageKey(key, KeyDirection.From)];
			}
		}

		this.setProperty('prevValue', this.serialize(this));
		this.setProperty('fromStorage', false);
	}

	ngOnDestroy() {
		this.getProperty<EventEmitter<any>>('subscription').unsubscribe();
		const listener = this.getProperty<any>('listener');
		window.removeEventListener('storage', listener);
	}

	/**
	 * Retrieves data from the object stored as a property.
	 */
	protected getProperty<T>(name: string): T {
		return name in this ? this[name] : undefined;
	}

	/**
	 * Stores data in a private private property that will not be stored in storage.
	 * This is necessary because creating a class property results in an extra key in
	 * storage.
	 */
	protected setProperty(name: string, value: any) {
		if (!(name in this)) {
			Object.defineProperty(this, name, { writable: true });
		}
		this[name] = value;
	}

	/**
	 * Retrieves data stored is storage.
	 * @param key - The identifier used to locate data in storage.
	 */
	getItem(key: string): string {
		return this[key];
	}

	/**
	 * Stores data in storage
	 * @param key - The identifier to associate stored data with
	 * @param value - The data to place in storage
	 */
	setItem(key: string, value: string) {
		try {
			// since the value of set item has to be a string, the value may already be stringified Json.
			// so we parse it to allow the WriteToStorage function to properly stringify object values.
			this[key] = this.deserialize(value);
		} catch (e) {
			this[key] = value;
		}
	}

	/**
	 * Deletes data stored in storage
	 * @param key - The identifier used to locate the data to be deleted
	 */
	removeItem(key: string) {
		delete this[key];
	}

	/**
	 * Removes all keys managed by the storage object.
	 */
	clear() {
		Object.keys(this).forEach((key) => {
			delete this[key];
		});
	}

	/**
	 * Retrieves an identifier
	 * @param index - The position at which to look for an identifier. Index be at least zero
	 * and must be less than length.
	 */
	key(index: number): string {
		return Object.keys(this)[index];
	}

	/**
	 * The number of values this instance is managing
	 */
	get length() {
		return Object.keys(this).length;
	}

	/**
	 * Gets or set a value from storage. Unlike getItem and setItem, the value is not required
	 * to be a string. All values will be serialized to string prior to being stored. To
	 * specify serialization, {@link StorageOptions#transformer}
	 */
	[key: string]: any;
}
