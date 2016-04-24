import {EventEmitter, NgZone, OnDestroy, OpaqueToken} from "angular2/core";

export let STORAGE_OPTIONS = new OpaqueToken("StorageOptions");
export interface StorageOptions {
	prefix?: string;
	transformer?: JSON
}
enum KeyDirection {
	From,
	To
}

export abstract class BaseStorage implements OnDestroy, Storage {

    constructor(ngZone: NgZone, storage: Storage, options?: StorageOptions) {
		options = Object.assign({}, { prefix: "", transformer: JSON }, options);
		this.setProperty("options", options);
		this.setProperty("storage", storage);

		this.UpdateFromStorage();

        var subscription = ngZone.onMicrotaskEmpty.subscribe(() => {
			let fromStorage: boolean = this.getProperty<boolean>("fromStorage");
			fromStorage ? this.UpdateFromStorage() : this.WriteToStorage();
		});
		
		var listener = (event) => this.setProperty("fromStorage", true);
		window.addEventListener("storage", listener);

		this.setProperty("subscription", subscription);
		this.setProperty("listener", listener);
    }

	private normalizeStorageKey(name: string, dir: KeyDirection): string {
		var options = this.getProperty<StorageOptions>("options");
		return dir == KeyDirection.From ? name.replace(options.prefix, "") : options.prefix + name;
	}
	
	private serialize(value: any){
		let options = this.getProperty<StorageOptions>("options");
		return options.transformer.stringify(value);
	}
	
	private deserialize(value: any){
		let options = this.getProperty<StorageOptions>("options");
		return options.transformer.parse(value);
	}

	private WriteToStorage() {
		var prevValue = this.getProperty<string>("prevValue");
		var currValue = this.serialize(this);
		if (prevValue != currValue) {
			var storage = this.getProperty<Storage>("storage");
			var prevStorage = this.deserialize(prevValue);
			Object.keys(this).forEach((key) => {
				var _key = this.normalizeStorageKey(key, KeyDirection.To);
				var value = this[key];
				if (typeof this[key] != "undefined") {
					storage.setItem(_key, this.serialize(this[key]));
					delete prevStorage[key];
				}
			}, this);

			for (var key in prevStorage) {
				storage.removeItem(this.normalizeStorageKey(key, KeyDirection.To));
			}

			this.setProperty("prevValue", this.serialize(this));
		}
	}

	private UpdateFromStorage() {
		var options = this.getProperty<StorageOptions>("options");
		var storage = this.getProperty<Storage>("storage");
		let tmp = Object.assign({}, this);
		Object.keys(storage).forEach((key) => {
			if (!key.startsWith(options.prefix)) {
				return;
			}
			var _key = this.normalizeStorageKey(key, KeyDirection.From);
			try {
				delete tmp[_key];
				this[_key] = this.deserialize(storage[key]);
			}
			catch (e) {
				this[_key] = null;
			}

		});
		for (var key in tmp) {
			delete this[this.normalizeStorageKey(key, KeyDirection.From)];
		}

		this.setProperty("prevValue", this.serialize(this));
		this.setProperty("fromStorage", false);
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
		try {
			//since the value of set item has to be a string, the value may already be stringified Json.
			//so we parse it to allow the WriteToStorage function to properly stringify object values.
			this[key] = this.deserialize(value);
		}
		catch (e) {
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
