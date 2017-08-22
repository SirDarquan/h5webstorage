import { NgZone } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { MockOptions, MockStorage, MockStore, MockSerdes } from '../test/mocks';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

const scenarios = [{
	name: 'basestorage',
	totalKeys: 4,
	keyName: 'baseKey2',
	keyIndex: 1,
	options: { prefix: '', serializeOnException: false }	// this is the value assigned when no options are specified
},
{
	name: 'basestorage with prefix',
	totalKeys: 2,
	keyName: 'Key2',
	keyIndex: 1,
	options: { prefix: 'prefix-', serializeOnException: true }
}];

let mockStorage: MockStorage, mockStore: MockStore;

scenarios.forEach((scenario) => {
	TestBed.resetTestEnvironment();
	describe(scenario.name, () => {
		// create a new backing store for each call. Otherwise all tests will share the same backing.
		const createBacking = () => {
			return new MockStore({
				baseKey1: '"value1"',
				baseKey2: '"value2"',
				'prefix-Key1': '"value3"',
				'prefix-Key2': '"value4"'
			});
		};

		TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [
					MockStorage,
					{ provide: MockStore, useValue: createBacking() },
					{ provide: MockOptions, useValue: scenario.options },
					MockSerdes
				]
			});
			mockStorage = TestBed.get(MockStorage);
			mockStore = TestBed.get(MockStore);
		});

		it('should load all keys from storage', () => {
			expect(mockStorage.length).toBe(scenario.totalKeys);
		});

		it('can delete a key with delete keyword', () => {
			delete mockStorage[scenario.keyName];
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).not.toBeDefined();
		});

		it('can delete a key with removeItem', () => {
			mockStorage.removeItem(scenario.keyName);
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).not.toBeDefined();
		});

		it('can clear all keys', () => {
			const totalStored = mockStore.length;
			expect(mockStorage.length).toBe(scenario.totalKeys);
			mockStorage.clear();
			mockStorage.detectChanges();
			const found = Object.keys(mockStore).some((key) => key.startsWith(scenario.options.prefix));
			expect(found).toBe(false);
			expect(mockStore.length).toBe(totalStored - scenario.totalKeys);
		});

		it('can create a key', () => {
			expect(mockStore[scenario.options.prefix + 'brandNewKey']).not.toBeDefined();
			mockStorage['brandNewKey'] = { valueType: 'complex' };
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + 'brandNewKey']).toBeDefined();
		});

		it('can create a key with setItem', () => {
			expect(mockStore[scenario.options.prefix + 'brandNewKey']).not.toBeDefined();
			mockStorage.setItem('brandNewKey', 'simple');
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + 'brandNewKey']).toBeDefined();
		});

		it('will pass-thru pre-stringified objects', () => {
			const value = JSON.stringify({ valueType: 'complex' });
			mockStorage.setItem('brandNewKey', value);
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + 'brandNewKey']).toBe(value);
		});

		it('can retieve a value', () => {
			const expected = JSON.parse(mockStore[scenario.options.prefix + scenario.keyName]);
			expect(mockStorage[scenario.keyName]).toBe(expected);
		});

		it('can retireve a key with getItem', () => {
			const expected = JSON.parse(mockStore[scenario.options.prefix + scenario.keyName]);
			expect(mockStorage.getItem(scenario.keyName)).toBe(expected);
		});

		it('can retireve a key', () => {
			expect(mockStorage.key(scenario.keyIndex)).toBe(scenario.keyName);
		});

		it('can update a value', () => {
			mockStorage[scenario.keyName] = { valueType: 'complex' };
			mockStorage.detectChanges();
			expect(mockStore[scenario.options.prefix + scenario.keyName]).toBe(JSON.stringify({ valueType: 'complex' }));
		});

		it('will sync on storage event', () => {
			expect(mockStorage['otherKey']).not.toBeDefined();
			mockStore[scenario.options.prefix + 'otherKey'] = '"newValue"';
			mockStorage
				.createStorageEvent()
				.detectChanges();
			expect(mockStorage['otherKey']).toBe('newValue');
		});

		if (scenario.options.prefix) {
			it('will not sync on storage event without prefix', () => {
				expect(mockStorage['otherKey']).not.toBeDefined();
				mockStore['otherKey'] = '"newValue"';
				mockStorage
					.createStorageEvent()
					.detectChanges();
				expect(mockStorage['otherKey']).not.toBeDefined();
			});
		}

		it('will return undefined for an unknow key', () => {
			expect(mockStorage['otherKey']).not.toBeDefined();
		});

		it('will handle improperly encoded values', () => {
			mockStore[scenario.options.prefix + 'badValue'] = 'this is not a JSON string';
			mockStorage
				.createStorageEvent()
				.detectChanges();
				scenario.options.serializeOnException ?
					expect(mockStorage['badValue']).toBeTruthy() :
					expect(mockStorage['badValue']).toBeFalsy();
		});

		it('will return \'undefined\' when index is out of range', () => {
			expect(mockStorage.key(-1)).not.toBeDefined();
			expect(mockStorage.key(10)).not.toBeDefined();
		});
	});
});
