import {provide, NgZone} from "@angular/core";
import {inject, addProviders} from "@angular/core/testing";
import {MockOptions, MockStorage, MockStore} from "../test/mocks";

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

		beforeEach(() => {
			addProviders([
				MockStorage,
				provide(NgZone, { useValue: new NgZone({}) }),
				provide(MockStore, { useValue: createBacking() }),
				provide(MockOptions, { useValue: scenario.options })

			]);
		});

		it("should load all keys from storage",inject ([MockStorage], (mockStorage) => {
			expect(mockStorage.length).toBe(scenario.totalKeys);
		}));

		it("can delete a key with delete keyword", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			delete mockStorage[scenario.keyName];
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).not.toBeDefined();
		}));

		it("can delete a key with removeItem", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			mockStorage.removeItem(scenario.keyName);
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).not.toBeDefined();
		}));

		it("can clear all keys", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			let totalStored = mockStore.length;
			expect(mockStorage.length).toBe(scenario.totalKeys);
			mockStorage.clear();
			mockStorage.detectChanges();
			let found = Object.keys(mockStore).some((key) => key.startsWith(scenario.options.prefix));
			expect(found).toBe(false);
			expect(mockStore.length).toBe(totalStored - scenario.totalKeys);
		}));

		it("can create a key", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).not.toBeDefined();
			mockStorage["brandNewKey"] = { valueType: "complex" };
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).toBeDefined();
		}));

		it("can create a key with setItem", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).not.toBeDefined();
			mockStorage.setItem("brandNewKey", "simple");
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).toBeDefined();
		}));

		it("will pass-thru pre-stringified objects", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			let value = JSON.stringify({ valueType: "complex" });
			mockStorage.setItem("brandNewKey", value);
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + "brandNewKey"]).toBe(value);
		}));

		it("can retieve a value", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			let expected = JSON.parse(mockStore[scenario.options.prefix + scenario.keyName]);
			expect(mockStorage[scenario.keyName]).toBe(expected);
		}));

		it("can retireve a key with getItem", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			let expected = JSON.parse(mockStore[scenario.options.prefix + scenario.keyName]);
			expect(mockStorage.getItem(scenario.keyName)).toBe(expected);
		}));

		it("can retireve a key", inject([MockStorage], (mockStorage) => {
			expect(mockStorage.key(scenario.keyIndex)).toBe(scenario.keyName);
		}));

		it("can update a value", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			mockStorage[scenario.keyName] = { valueType: "complex" };
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).toBe(JSON.stringify({ valueType: "complex" }));
		}));

		it("will sync on storage event", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			expect(mockStorage["otherKey"]).not.toBeDefined();
			mockStore[scenario.options.prefix + "otherKey"] = '"newValue"';
			mockStorage
				.createStorageEvent()
				.detectChanges();
			expect(mockStorage["otherKey"]).toBe("newValue");
		}));

		if (scenario.options.prefix) {
			it("will not sync on storage event without prefix", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
				expect(mockStorage["otherKey"]).not.toBeDefined();
				mockStore["otherKey"] = '"newValue"';
				mockStorage
					.createStorageEvent()
					.detectChanges();
				expect(mockStorage["otherKey"]).not.toBeDefined();
			}));
		}

		it("will return undefined for an unknow key", inject([MockStorage], (mockStorage) => {
			expect(mockStorage["otherKey"]).not.toBeDefined();
		}));

		it("will return null for improperly encoded values", inject([MockStorage, MockStore], (mockStorage, mockStore) => {
			mockStore[scenario.options.prefix + "badValue"] = "this is not a JSON string";
			mockStorage
				.createStorageEvent()
				.detectChanges();
			expect(mockStorage["badValue"]).toBeNull();
		}));

		it("will return 'undefined' when index is out of range", inject([MockStorage], (mockStorage) => {
			expect(mockStorage.key(-1)).not.toBeDefined();
			expect(mockStorage.key(10)).not.toBeDefined();
		}));
	});
});