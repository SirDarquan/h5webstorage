import {NgZone} from "@angular/core";
import {inject, TestBed} from "@angular/core/testing";
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {MockObject, MockStorage, MockStore, MockOptions} from "../test/mocks";
import {LocalStorage, LOCAL_STORAGE_OBJECT} from "./localstorage";
import {SessionStorage, SESSION_STORAGE_OBJECT} from "./sessionstorage";
import {StorageProperty} from "./storageproperty";


function createBacking(type: string) {
	return (): MockStore => {
		if (type == "local") {
			return new MockStore({
				TestProperty: '"value1"',
				baseKey2: '"value2"',
				"prefix-TestProperty": '"value3"',
				"prefix-baseKey2": '"value4"'
			});
		}
		else {
			return new MockStore({
				TestProperty: '"value1"',
				baseKey2: '"value2"',
				"prefix-Key1": '"value3"',
				"prefix-Key2": '"value4"'
			});
		}
	}
};

function storageFactory(type: string) {
	return (ngZone: NgZone, store: MockStore, options: MockOptions): Storage => {
		var storage = type == "local" ? new LocalStorage(ngZone, store, options)
			: new SessionStorage(ngZone, store, options);
		(<any>storage).detectChanges = () => ngZone.run(() => { });
		return storage;
	}
}

let storageType = ["local", "session"];

storageType.forEach((type) => {
	TestBed.resetTestEnvironment();

	describe("StorageProperty", () => {
		let mockObject, transformer;

		TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [
					{ provide: MockStorage, useFactory: storageFactory(type), deps: [NgZone, MockStore, MockOptions] },
					{ provide: NgZone, useValue: new NgZone({}) },
					{ provide: MockOptions, useValue: { prefix: "" } },
					{ provide: MockStore, useFactory: createBacking(type) }]
			});
			transformer = JSON;
		});

		it("should retrieve value from " + type + "Storage", inject([MockStore, MockStorage], (mockStore, mockStorage) => {
			mockObject = new MockObject(mockStorage);
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");

			let actual = transformer.parse(mockStore["TestProperty"]);
			expect(mockObject.TestProperty).toBe(actual);
		}));

		it("should set value in " + type + "Storage", inject([MockStore, MockStorage], (mockStore, mockStorage: MockStorage) => {
			mockObject = new MockObject(mockStorage);
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");

			let actual = transformer.parse(mockStore["TestProperty"]);
			expect(mockObject.TestProperty).toBe(actual);
			mockObject.TestProperty = "newValue";
			mockStorage.detectChanges();
			actual = transformer.stringify("newValue");
			expect(mockStore["TestProperty"]).toBe(actual);
		}));

		it("should set default value in " + type + "Storage", inject([MockStore, MockStorage], (mockStore, mockStorage) => {
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");

			expect(mockStore["NewProperty"]).not.toBeDefined();
			decorator(MockObject.prototype, "NewProperty");
			mockObject = new MockObject(mockStorage);
			let actual = transformer.stringify("default value");
			mockStorage.detectChanges();
			expect(mockStore["NewProperty"]).toBe(actual);
		}));

		it("should not set default value in " + type + "Storage", inject([MockStore, MockStorage], (mockStore, mockStorage) => {
			let decorator = StorageProperty("baseKey2", type == "local" ? "Local" : "Session");

			let actual = transformer.stringify("value2");
			expect(mockStore["baseKey2"]).toBe(actual);
			decorator(MockObject.prototype, "NewerProperty");
			mockObject = new MockObject(mockStorage);
			mockStorage.detectChanges();
			expect(mockStore["baseKey2"]).toBe(actual);
		}));

		it("should retrieve value from " + type + "Storage with alternate key name", inject([MockStore, MockStorage], (mockStore, mockStorage) => {
			mockObject = new MockObject(mockStorage);
			let decorator = StorageProperty("baseKey2", type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");
			let actual = transformer.parse(mockStore["baseKey2"]);
			expect(mockObject.TestProperty).toBe(actual);
		}));

		it("should set value in " + type + "Storage with alternate key name", inject([MockStore, MockStorage], (mockStore, mockStorage) => {
			mockObject = new MockObject(mockStorage);
			let decorator = StorageProperty("baseKey2", type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");

			expect(mockObject.TestProperty).toBe("value2");
			mockObject.TestProperty = "newValue";
			mockStorage.detectChanges();
			let actual = transformer.stringify("newValue");
			expect(mockStore["baseKey2"]).toBe(actual);
		}));

		it("will throw when " + type + "Storage is not a property", inject([MockStorage], (mockStorage) => {
			mockObject = new MockObject(mockStorage);
			let decorator = StorageProperty(null, type == "local" ? "Session" : "Local");
			let prefix = type == "local" ? "Session" : "Local";
			decorator(mockObject, "TestProperty")
			expect(() => mockObject.TestProperty).toThrowError("Object must have a property that is an instance of " + prefix + "Storage.");
		}));

		it("will create a readonly property", inject([MockStorage], (mockStorage) => {
			mockObject = new MockObject(mockStorage);
			let decorator = StorageProperty({ readOnly: true });
			decorator(mockObject, "TestProperty");
			expect(() => mockObject.TestProperty = "disallowed action").toThrow();
		}));

	});
})