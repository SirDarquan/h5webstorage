import {Injectable, NgZone} from "angular2/core";
import {BaseStorage, StorageOptions} from "../src/basestorage";

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
}

@Injectable()
export class MockStorage extends BaseStorage {
	constructor(ngZone: NgZone, store: MockStore, options: MockOptions) {
		super(ngZone, store, options);
		//we don't use private ngZone because that will add an extra key in the class
		this.setProperty("zone", ngZone);
	}

	detectChanges() {
		this.getProperty<NgZone>("zone").run(() => { });
		return this;
	}

	createStorageEvent() {
		this.setProperty("fromStorage", true);
		return this;
	}
}

export class MockObject{
	private TestProperty;	
	
	constructor(){
		
	}
}
