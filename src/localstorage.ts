import { Inject, Injectable, Optional, OpaqueToken, NgZone } from "@angular/core";
import { BaseStorage, StorageOptions, STORAGE_OPTIONS, SERDES_OBJECT } from "./basestorage";

export let LOCAL_STORAGE_OBJECT = new OpaqueToken("localstorage");
@Injectable()
export class LocalStorage extends BaseStorage {
	constructor(ngZone: NgZone, @Inject(LOCAL_STORAGE_OBJECT) storage: Storage, @Inject(SERDES_OBJECT) transformer: JSON, @Inject(STORAGE_OPTIONS) @Optional() options?: StorageOptions) {
		super(ngZone, storage, transformer, options);
	}
}
