import {EventEmitter, NgZone, OnDestroy, OpaqueToken} from "angular2/core";

export let STORAGE_OPTIONS = new OpaqueToken("StorageOptions");
export interface StorageOptions {
	prefix: string;
}
enum KeyDirection {
	From,
	To
}

export abstract class BaseStorage implements OnDestroy, Storage {

    constructor(ngZone: NgZone, storage: Storage, options?: StorageOptions) {
		options = Object.assign({}, { prefix: "" }, options);
		this.setProperty("options", options);

		Object.keys(storage).forEach((key)=>{
			if (!key.startsWith(options.prefix)) {
				return;
			}
			var _key = this.normalizeStorageKey(key, KeyDirection.From);
			try {
				this[_key] = JSON.parse(storage[key]);
			}
			catch (e) {
				this[_key] = null;
			}
		});
        var subscription = ngZone.onMicrotaskEmpty.subscribe(() => this.WriteToStorage());
		var listener = (event) => this.UpdateFromStorage(event);
		window.addEventListener("storage", listener);

		this.setProperty("prevValue", JSON.stringify(this));
		this.setProperty("subscription", subscription);
		this.setProperty("storage", storage);
		this.setProperty("listener", listener);
    }

	private normalizeStorageKey(name: string, dir: KeyDirection): string {
		var options = this.getProperty<StorageOptions>("options");
		return dir == KeyDirection.From ? name.replace(options.prefix, "") : options.prefix + name;
	}

	private WriteToStorage() {
		var prevValue = this.getProperty<string>("prevValue");
		var currValue = JSON.stringify(this);
		if (prevValue != currValue) {
			var storage = this.getProperty<Storage>("storage");
			var prevStorage = JSON.parse(prevValue);
			Object.keys(this).forEach((key) => {
				var _key = this.normalizeStorageKey(key, KeyDirection.To);
				var value = this[key];
				if (typeof this[key] != "undefined") {
					storage.setItem(_key, JSON.stringify(this[key]));
					delete prevStorage[key];
				}
			}, this);

			for (var key in prevStorage) {
				storage.removeItem(this.normalizeStorageKey(key, KeyDirection.To));
			}

			this.setProperty("prevValue", JSON.stringify(this));
		}
	}

	private UpdateFromStorage(event: StorageEvent) {
		var options = this.getProperty<StorageOptions>("options");
		if (!event.key || !event.key.startsWith(options.prefix)) {
			return;
		}
		var _key = this.normalizeStorageKey(event.key, KeyDirection.From);
		event.newValue ? this[_key] = JSON.parse(event.newValue) : delete this[_key];
		this.setProperty("prevValue", JSON.stringify(this));
	}

    ngOnDestroy() {
		this.getProperty<EventEmitter<any>>("subscription").unsubscribe();
		var listener = this.getProperty<any>("listener");
		window.removeEventListener("storage", listener);
    }

	protected getProperty<T>(name: string): T {
		return name in this ? this[name] : undefined;
	}

	protected setProperty(name: string, value: any) {
		if (!(name in this)) {
			Object.defineProperty(this, name, { writable: true });
		}
		this[name] = value;
	}

	getItem(key: string): string {
		return this[key];
	}

	setItem(key: string, value: string) {
		try{
			//since the value of set item has to be a string, the value may already be stringified Json.
			//so we parse it to allow the WriteToStorage function to properly stringify object values.
			this[key] = JSON.parse(value);
		}
		catch(e){
			this[key] = value;
		}
	}

	removeItem(key: string) {
		delete this[key];
	}

	clear() {
		Object.keys(this).forEach((key) => {
			delete this[key];
		});
	}

	key(index: number): string {
		return Object.keys(this)[index];
	}

	get length() {
		return Object.keys(this).length;
	}

	[key: string]: any;
}
