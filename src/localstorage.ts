import { Inject, Injectable, Optional, OpaqueToken, NgZone } from "@angular/core";
import { BaseStorage, StorageOptions, STORAGE_OPTIONS, SERDES_OBJECT } from "./basestorage";

/**
 * Token used to inject an object as the storage backend of the SessionStorage object. By default, the storage
 * backend is the native localStorage object but can be substituted to allow for testing or customized storage
 * like to remote storage.
 */
export let LOCAL_STORAGE_OBJECT = new OpaqueToken("localstorage");

/**
 * Represents the native {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} object.
 * Can be injected into a component that needs access to localStorage. 
 */
@Injectable()
export class LocalStorage extends BaseStorage {
	constructor(ngZone: NgZone, @Inject(LOCAL_STORAGE_OBJECT) storage: Storage, @Inject(SERDES_OBJECT) transformer: JSON, @Inject(STORAGE_OPTIONS) @Optional() options?: StorageOptions) {
		super(ngZone, storage, transformer, options);
	}
}
