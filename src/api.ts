import {OpaqueToken, provide, Type} from 'angular2/core';
import {StorageOptions, STORAGE_OPTIONS} from "./basestorage";
import {LocalStorage, LOCAL_STORAGE_OBJECT} from "./localstorage";
import {SessionStorage, SESSION_STORAGE_OBJECT} from "./sessionstorage";

enum StorageType {
	Local,
	Session
}

function CreateStorageProvider<T extends Type, Storage>(customStorage?: T, storageType?: StorageType) {
	if ((typeof storageType != "undefined" || customStorage) && !(customStorage && typeof storageType != "undefined")) {
		throw new Error("Both customStorage and storageType must be defined");
	}
	let provider = [];
		provider.push(provide(customStorage, { useClass: customStorage }));
		storageType == StorageType.Local ?
			provider.push(provide(LOCAL_STORAGE_OBJECT, { useValue: localStorage })) :
			provider.push(provide(SESSION_STORAGE_OBJECT, { useValue: sessionStorage }));
	return provider;
}

export {LocalStorage, SessionStorage};
/** 
 * The provider necessary to use the LocalStorage service
 * @deprecated - use {@link WEB_STORAGE_PROVIDERS } instead 
 * 
 */
export let LOCAL_STORAGE_PROVIDER = CreateStorageProvider(LocalStorage, StorageType.Local);
/** 
 * The provider necessary to use the SessionStorage service
 * @deprecated - use {@link WEB_STORAGE_PROVIDERS } instead 
 */
export let SESSION_STROAGE_PROVIDER = CreateStorageProvider(SessionStorage, StorageType.Session);
/**
 * The providers necessary to use the LocalStorage and SessionStorage services
 */
export let WEB_STORAGE_PROVIDERS = [].concat(LOCAL_STORAGE_PROVIDER).concat(SESSION_STROAGE_PROVIDER);
export {StorageProperty} from "./storageproperty";
/**
 * Creates a provider for the StorageOptions
 * @param options - A {@link StorageOptions} object
 */
export function ConfigureStorage(options: StorageOptions) {	
	return provide(STORAGE_OPTIONS, { useValue: options });
}



