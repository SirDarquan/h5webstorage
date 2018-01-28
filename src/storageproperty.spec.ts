import { NgZone } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MockObject, MockStorage, MockStore, MockOptions, MockSerdes } from '../test/mocks';
import { LocalStorageService, LOCAL_STORAGE_OBJECT } from './local-storage.service';
import { SessionStorageService, SESSION_STORAGE_OBJECT } from './session-storage.service';
import { StorageProperty } from './storage-property';


function createBacking(type: string) {
	return (): MockStore => {
		if (type === 'local') {
			return new MockStore({
				TestProperty: '"value1"',
				baseKey2: '"value2"',
				'prefix-TestProperty': '"value3"',
				'prefix-baseKey2': '"value4"'
			});
		} else {
			return new MockStore({
				TestProperty: '"value1"',
				baseKey2: '"value2"',
				'prefix-Key1': '"value3"',
				'prefix-Key2': '"value4"'
			});
		}
	};
}

function storageFactory(type: string) {
	return (ngZone: NgZone, store: MockStore, transformer: MockSerdes, options: MockOptions): Storage => {
		const storage = type === 'local' ? new LocalStorageService(ngZone, store, transformer, options)
			: new SessionStorageService(ngZone, store, transformer, options);
		(<any>storage).detectChanges = () => ngZone.run(() => { });
		return storage;
	};
}

const storageType = ['local', 'session'];

storageType.forEach((type) => {
	TestBed.resetTestEnvironment();

	describe('StorageProperty', () => {
		let mockObject, mockStore: MockStore, mockStorage: MockStorage, transformer: MockSerdes;

		TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [
					{ provide: MockStorage, useFactory: storageFactory(type), deps: [NgZone, MockStore, MockSerdes, MockOptions] },
					{ provide: MockOptions, useValue: { prefix: '' } },
					{ provide: MockStore, useFactory: createBacking(type) },
					MockSerdes
				]
			});
			mockStore = TestBed.get(MockStore);
			mockStorage = TestBed.get(MockStorage);
			transformer = TestBed.get(MockSerdes);
		});

		it('should retrieve value from ' + type + 'Storage', () => {
			mockObject = new MockObject(mockStorage);
			const decorator = StorageProperty(null, type === 'local' ? 'Local' : 'Session');
			decorator(mockObject, 'TestProperty');

			const actual = transformer.parse(mockStore['TestProperty']);
			expect(mockObject.TestProperty).toBe(actual);
		});

		it('should set value in ' + type + 'Storage', () => {
			mockObject = new MockObject(mockStorage);
			const decorator = StorageProperty(null, type === 'local' ? 'Local' : 'Session');
			decorator(mockObject, 'TestProperty');

			let actual = transformer.parse(mockStore['TestProperty']);
			expect(mockObject.TestProperty).toBe(actual);
			mockObject.TestProperty = 'newValue';
			mockStorage.detectChanges();
			actual = transformer.stringify('newValue');
			expect(mockStore['TestProperty']).toBe(actual);
		});

		it('should set default value in ' + type + 'Storage', () => {
			const decorator = StorageProperty(null, type === 'local' ? 'Local' : 'Session');

			expect(mockStore['NewProperty']).not.toBeDefined();
			decorator(MockObject.prototype, 'NewProperty');
			mockObject = new MockObject(mockStorage);
			const actual = transformer.stringify('default value');
			mockStorage.detectChanges();
			expect(mockStore['NewProperty']).toBe(actual);
		});

		it('should not set default value in ' + type + 'Storage', () => {
			const decorator = StorageProperty('baseKey2', type === 'local' ? 'Local' : 'Session');

			const actual = transformer.stringify('value2');
			expect(mockStore['baseKey2']).toBe(actual);
			decorator(MockObject.prototype, 'NewerProperty');
			mockObject = new MockObject(mockStorage);
			mockStorage.detectChanges();
			expect(mockStore['baseKey2']).toBe(actual);
		});

		it('should retrieve value from ' + type + 'Storage with alternate key name', () => {
			mockObject = new MockObject(mockStorage);
			const decorator = StorageProperty('baseKey2', type === 'local' ? 'Local' : 'Session');
			decorator(mockObject, 'TestProperty');
			const actual = transformer.parse(mockStore['baseKey2']);
			expect(mockObject.TestProperty).toBe(actual);
		});

		it('should set value in ' + type + 'Storage with alternate key name', () => {
			mockObject = new MockObject(mockStorage);
			const decorator = StorageProperty('baseKey2', type === 'local' ? 'Local' : 'Session');
			decorator(mockObject, 'TestProperty');

			expect(mockObject.TestProperty).toBe('value2');
			mockObject.TestProperty = 'newValue';
			mockStorage.detectChanges();
			const actual = transformer.stringify('newValue');
			expect(mockStore['baseKey2']).toBe(actual);
		});

		it('will throw when ' + type + 'Storage is not a property', () => {
			mockObject = new MockObject(mockStorage);
			const decorator = StorageProperty(null, type === 'local' ? 'Session' : 'Local');
			const prefix = type === 'local' ? 'Session' : 'Local';
			decorator(mockObject, 'TestProperty');
			mockStorage.detectChanges();
			expect(() => mockObject.TestProperty).toThrowError('Object must have a property that is an instance of ' + prefix + 'Storage.');
		});

		it('will create a readonly property', () => {
			mockObject = new MockObject(mockStorage);
			const decorator = StorageProperty({ readOnly: true });
			decorator(mockObject, 'TestProperty');
			mockStorage.detectChanges();
			expect(() => mockObject.TestProperty = 'disallowed action').toThrow();
		});

		it('should set \'undefined\' in ' + type + 'Storage when property matches backing variable name', () => {
			const decorator = StorageProperty('b', type === 'local' ? 'Local' : 'Session');

			expect(mockStore['b']).not.toBeDefined();
			decorator(MockObject.prototype, '_b');
			mockObject = new MockObject(mockStorage);
			mockStorage.detectChanges();
			expect(mockStore['b']).toBeUndefined();
		});

		it('should set default value in ' + type + 'Storage when property matches backing variable name', () => {
			const decorator = StorageProperty('c', type === 'local' ? 'Local' : 'Session');

			expect(mockStore['c']).not.toBeDefined();
			decorator(MockObject.prototype, '_c');
			mockObject = new MockObject(mockStorage);
			mockStorage.detectChanges();
			const actual = transformer.stringify(true);
			expect(mockStore['c']).toBe(actual);
		});
	});
});
