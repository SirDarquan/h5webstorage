import {Inject, Injectable, Optional, OpaqueToken, NgZone} from "angular2/core";
import {BaseStorage, StorageOptions, STORAGE_OPTIONS} from "./basestorage";

export let LOCAL_STORAGE_OBJECT = new OpaqueToken("localstorage");
@Injectable()
export class LocalStorage extends BaseStorage {
	constructor(ngZone: NgZone, @Inject(LOCAL_STORAGE_OBJECT) storage: Storage, @Inject(STORAGE_OPTIONS) @Optional() options?: StorageOptions) {
		super(ngZone, storage, options);
	}
}
