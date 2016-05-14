import {Inject, Injectable, Optional, OpaqueToken, NgZone} from "@angular/core";
import {BaseStorage, StorageOptions, STORAGE_OPTIONS} from "./basestorage";

export let SESSION_STORAGE_OBJECT = new OpaqueToken("sessionstorage");

@Injectable()
export class SessionStorage extends BaseStorage {
	constructor(ngZone: NgZone, @Inject(SESSION_STORAGE_OBJECT) storage: Storage, @Inject(STORAGE_OPTIONS) @Optional() options?: StorageOptions) {
		super(ngZone, storage, options);
	}
}
