import {bootstrap} from "@angular/platform-browser-dynamic";
import { provide } from '@angular/core';
import {TodoApp} from "./app/index";
import {ROUTER_PROVIDERS} from "@angular/router-deprecated";
import {BROWSER_STORAGE_PROVIDERS} from  "../src/index";

bootstrap(TodoApp, [ROUTER_PROVIDERS, BROWSER_STORAGE_PROVIDERS]);
