import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ExampleComponent } from './example.component';
import { WebStorageModule } from '../index';

@NgModule({
    declarations: [
        ExampleComponent
    ],
    imports: [
        BrowserModule,
        WebStorageModule
    ],
    providers: [],
    bootstrap: [ExampleComponent]
})
export class ExampleModule { }
