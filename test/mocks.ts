import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { BaseStorageService, StorageOptions } from '../src/base-storage.service';


export class MockStore implements Storage {

	constructor(initData: any = {}) {
		Object.assign(this, initData);
	}

	getItem(key: string): string {
		return this[key];
	}

	setItem(key: string, value: string) {
		this[key] = value;
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

export class MockOptions implements StorageOptions {
	prefix: string;
	serializeOnException: boolean;
}

export class MockSerdes implements JSON {
	readonly [Symbol.toStringTag]: 'JSON';
	stringify = (...args): string => JSON.stringify.apply(null, args);
	parse = (...args): any => JSON.parse.apply(null, args);
}

@Injectable()
export class MockStorage extends BaseStorageService {
	constructor(ngZone: NgZone, store: MockStore, transformer: MockSerdes, options: MockOptions) {
		super(ngZone, store, transformer, options);
		// we don't use private ngZone because that will add an extra key in the class
		this.setProperty('zone', ngZone);
	}

	detectChanges() {
		this.getProperty<NgZone>('zone').run(() => { });
		return this;
	}

	createStorageEvent() {
		this.setProperty('fromStorage', true);
		return this;
	}
}

export class MockObject {
	public TestProperty;
	public SessionKey;
	public NewProperty = 'default value';
	public NewerProperty = 'another default value';
	public _b: boolean;
	public _c = true;

	constructor(private storage: Storage) {

	}
}
