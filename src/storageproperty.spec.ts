import {provide, NgZone} from "angular2/core";
import {inject, beforeEach, beforeEachProviders} from "angular2/testing";
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
		return type == "local" ? new LocalStorage(ngZone, store, options)
			: new SessionStorage(ngZone, store, options);
	}
}

let storageType = ["local", "session"];

storageType.forEach((type) => {

	describe("StorageProperty", () => {
		let mockObject, mockStorage, mockStore, transformer;

		beforeEachProviders(() => [
			provide(MockStorage, { useFactory: storageFactory(type), deps: [NgZone, MockStore, MockOptions] }),
			//provide(SessionStorage, { useFactory: storageFactory("session"), deps: [NgZone, SESSION_STORAGE_OBJECT, MockOptions] }),
			provide(NgZone, { useValue: new NgZone({}) }),
			provide(MockOptions, { useValue: { prefix: "" } }),
			provide(MockStore, { useFactory: createBacking(type) }),
			//provide(SESSION_STORAGE_OBJECT, { useFactory: createBacking("session") })
		]);

		beforeEach(inject([MockStorage, MockStore, NgZone],
			(storage, store, zone: NgZone) => {
				mockStore = store;
				mockStorage = storage;
				mockStorage.detectChanges = () => { zone.run(() => { }) };
				transformer = JSON;

				mockObject = new MockObject(mockStorage);
			}));


		it("should retrieve value from " + type + "Storage", () => {
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");
			let actual = transformer.parse(mockStore["TestProperty"]);
			expect(mockObject.TestProperty).toBe(actual);
		});

		it("should set value in " + type + "Storage", () => {
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");

			let actual = transformer.parse(mockStore["TestProperty"]);
			expect(mockObject.TestProperty).toBe(actual);
			mockObject.TestProperty = "newValue";
			mockStorage.detectChanges();
			actual = transformer.stringify("newValue");
			expect(mockStore["TestProperty"]).toBe(actual);
		});

		it("should set default value in " + type + "Storage", () => {
			/* 
			 * In an angular 2 application, a detorator with a value goes through the following steps:
			 * 	1. Retrieve the current value of the property. If it is not null and not undefined, store the value for later
			 * 	2. Run the decorator code
			 * 	3. Set the newly created property to the stored value of the overwritten property
			 * Since I'm testing the function itself, steps 1 and 3 don't happen automatically. So I recreate that process
			 */
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");

			expect(mockStore["NewProperty"]).not.toBeDefined();
			decorator(mockObject, "NewProperty");
			mockObject.NewProperty = "default value";
			mockStorage.detectChanges();
			let actual = transformer.stringify("default value");
			expect(mockStore["NewProperty"]).toBe(actual);
		});

		it("should not set default value in " + type + "Storage", () => {
			/* 
			 * In an angular 2 application, a detorator with a value goes through the following steps:
			 * 	1. Retrieve the current value of the property. If it is not null and not undefined, store the value for later
			 * 	2. Run the decorator code
			 * 	3. Set the newly created property to the stored value of the overwritten property
			 * Since I'm testing the function itself, steps 1 and 3 don't happen automatically. So I recreate that process
			 */
			let decorator = StorageProperty(null, type == "local" ? "Local" : "Session");

			let actual = transformer.stringify("value2");
			expect(mockStore["baseKey2"]).toBe(actual);
			decorator(mockObject, "baseKey2");
			mockObject.NewProperty = "default value";
			mockStorage.detectChanges();
			expect(mockStore["baseKey2"]).toBe(actual);
		});

		it("should retrieve value from " + type + "Storage with alternate key name", () => {
			let decorator = StorageProperty("baseKey2", type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");
			let actual = transformer.parse(mockStore["baseKey2"]);
			expect(mockObject.TestProperty).toBe(actual);
		});

		it("should set value in " + type + "Storage with alternate key name", () => {
			let decorator = StorageProperty("baseKey2", type == "local" ? "Local" : "Session");
			decorator(mockObject, "TestProperty");

			expect(mockObject.TestProperty).toBe("value2");
			mockObject.TestProperty = "newValue";
			mockStorage.detectChanges();
			let actual = transformer.stringify("newValue");
			expect(mockStore["baseKey2"]).toBe(actual);
		});
		
		it("will throw when "+ type +"Storage is not a property", ()=>{
			let decorator = StorageProperty(null, type == "local" ? "Session" : "Local");
			let prefix = type == "local" ? "Session" : "Local";
			decorator(mockObject, "TestProperty")
			expect(()=> mockObject.TestProperty).toThrowError("Object must have a property that is an instance of " + prefix + "Storage.");
		})
		
		it("will create a readonly property", ()=>{
			let decorator = StorageProperty({readOnly: true});
			decorator(mockObject, "TestProperty");
			expect(()=>mockObject.TestProperty = "disallowed action").toThrow();
		});

	});
})