import {bootstrap} from "@angular/platform-browser-dynamic";
import {TodoApp} from "./app/index";
import {ROUTER_PROVIDERS} from "@angular/router-deprecated";

bootstrap(TodoApp, [ROUTER_PROVIDERS]);
