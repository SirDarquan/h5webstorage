import {bootstrap} from "@angular/platform-browser-dynamic";
import { provide } from '@angular/core';
import {TodoApp} from "./app/index";
import {BROWSER_STORAGE_PROVIDERS} from  "../src/index";

bootstrap(TodoApp, [BROWSER_STORAGE_PROVIDERS]);
