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
export let LOCAL_STORAGE_PROVIDER = CreateStorageProvider(LocalStorage, StorageType.Local);
export let SESSION_STROAGE_PROVIDER = CreateStorageProvider(SessionStorage, StorageType.Session);
export {StorageProperty} from "./storageproperty";
export function ConfigureStorage(options: StorageOptions) {	
	return provide(STORAGE_OPTIONS, { useValue: options });
}



