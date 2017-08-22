import { NgModule, Provider } from '@angular/core';
import { StorageOptions, STORAGE_OPTIONS, SERDES_OBJECT } from './basestorage';
import { LocalStorage, LOCAL_STORAGE_OBJECT } from './localstorage';
import { SessionStorage, SESSION_STORAGE_OBJECT } from './sessionstorage';

/**
 * Makes the  LocalStorage and SessionStorage objects available throught the application. Should be
 * added to the RootModule imports list.
 */
@NgModule({
	providers: [LocalStorage, SessionStorage]
})
export class WebStorageModule { }

/**
 * The objects necessary to use Web Storage in the browser
 */
export let BROWSER_STORAGE_PROVIDERS: Provider[] = [
	{ provide: LOCAL_STORAGE_OBJECT, useValue: localStorage },
	{ provide: SESSION_STORAGE_OBJECT, useValue: sessionStorage },
	{ provide: SERDES_OBJECT, useValue: { stringify: JSON.stringify, parse: JSON.parse } },
	ConfigureStorage({prefix: ''})
];

export { LocalStorage, SessionStorage };
export { StorageProperty } from './storageproperty';
/**
 * Creates a provider for the StorageOptions
 * @param options - A {@link StorageOptions} object
 */
export function ConfigureStorage(options: StorageOptions): Provider {
	return { provide: STORAGE_OPTIONS, useValue: options };
}



