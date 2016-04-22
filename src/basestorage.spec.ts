import {provide, Injectable, NgZone, OpaqueToken, Inject} from "angular2/core";
import {MockNgZone, inject, it, setBaseTestProviders, flushMicrotasks, fakeAsync, beforeEach, beforeEachProviders, describe, tick, expect} from "angular2/testing";
import {AsyncTestCompleter} from "angular2/testing_internal";
import {scheduleMicroTask} from 'angular2/src/facade/lang';
import {BaseStorage, StorageOptions} from "./basestorage";

let storeToken = new OpaqueToken("storageTest");


class MockStore implements Storage {

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

class MockOptions implements StorageOptions {
	prefix: string;
}

@Injectable()
class MockStorage extends BaseStorage {
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

var scenarios = [{
	name: "basestorage",
	totalKeys: 4,
	keyName: "baseKey2",
	keyIndex: 1,
	options: { prefix: "" }	//this is the value assigned when no options are specified
},
	{
		name: "basestorage with prefix",
		totalKeys: 2,
		keyName: "Key2",
		keyIndex: 1,
		options: { prefix: "prefix-" }
	}];

scenarios.forEach((scenario) => {
	describe(scenario.name, () => {
		//create a new backing store for each call. Otherwise all tests will share the same backing.
		let createBacking = () => {
			return new MockStore({
				baseKey1: '"value1"',
				baseKey2: '"value2"',
				"prefix-Key1": '"value3"',
				"prefix-Key2": '"value4"'
			});
		};
		let mockStorage: MockStorage;
		let mockStore: MockStore;
		let zone: NgZone;

		beforeEachProviders(() => [
			MockStorage,
			provide(NgZone, { useValue: new NgZone({}) }),
			provide(MockStore, { useValue: createBacking() }),
			provide(MockOptions, { useValue: scenario.options })
		])

		beforeEach(inject([MockStorage, MockStore], (s: MockStorage, st: MockStore) => {
			mockStorage = s;
			mockStore = st;
		}));

		it("should load all keys from storage", () => {
			expect(mockStorage.length).toBe(scenario.totalKeys);
		});

		it("can delete a key with delete keyword", () => {
			delete mockStorage[scenario.keyName];
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).not.toBeDefined();
		});

		it("can delete a key with removeItem", () => {
			mockStorage.removeItem(scenario.keyName);
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).not.toBeDefined();
		});

		it("can clear all keys", () => {
			let totalStored = mockStore.length;
			expect(mockStorage.length).toBe(scenario.totalKeys);
			mockStorage.clear();
			mockStorage.detectChanges();
			let found = Object.keys(mockStore).some((key) => key.startsWith(scenario.options.prefix));
			expect(found).toBe(false);
			expect(mockStore.length).toBe(totalStored - scenario.totalKeys);
		});

		it("can create a key", () => {
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).not.toBeDefined();
			mockStorage["brandNewKey"] = { valueType: "complex" };
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).toBeDefined();
		});

		it("can create a key with setItem", () => {
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).not.toBeDefined();
			mockStorage.setItem("brandNewKey", "simple");
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).toBeDefined();
		});

		it("will pass-thru pre-stringified objects", () => {
			let value = JSON.stringify({ valueType: "complex" });
			mockStorage.setItem("brandNewKey", value);
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).toBe(value);
		})

		it("can retieve a value", () => {
			let expected = JSON.parse(mockStore[scenario.options.prefix + scenario.keyName]);
			expect(mockStorage[scenario.keyName]).toBe(expected);
		});

		it("can retireve a key with getItem", () => {
			let expected = JSON.parse(mockStore[scenario.options.prefix + scenario.keyName]);
			expect(mockStorage.getItem(scenario.keyName)).toBe(expected);
		});

		it("can retireve a key", () => {
			expect(mockStorage.key(scenario.keyIndex)).toBe(scenario.keyName);
		});

		it("can update a value", () => {
			mockStorage[scenario.keyName] = { valueType: "complex" };
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).toBe(JSON.stringify({ valueType: "complex" }));
		});

		it("will sync on storage event", () => {
			expect(mockStorage["otherKey"]).not.toBeDefined();
			mockStore[scenario.options.prefix + "otherKey"] = '"newValue"';
			mockStorage
				.createStorageEvent()
				.detectChanges();
			expect(mockStorage["otherKey"]).toBe("newValue");
		});

		if (scenario.options.prefix) {
			it("will not sync on storage event without prefix", () => {
				expect(mockStorage["otherKey"]).not.toBeDefined();
				mockStore["otherKey"] = '"newValue"';
				mockStorage
					.createStorageEvent()
					.detectChanges();
				expect(mockStorage["otherKey"]).not.toBeDefined();
			});
		}
	});
});