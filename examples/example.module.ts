import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { ExampleComponent } from './example.component';
import { TodoApp } from "./app.component";
import { TodoHeading } from './todoHeading';
import { TodoList } from './todoList';
import { TodoItem } from './todoItem';
import { JsonPipe } from './JsonPipe';
import { CreateItem } from './createItem';
import { WebStorageModule, BROWSER_STORAGE_PROVIDERS } from '../index';

@NgModule({
    declarations: [
        ExampleComponent,
        TodoApp,
        TodoHeading,
        TodoItem,
        TodoList,
        CreateItem
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        WebStorageModule
    ],
    providers: [BROWSER_STORAGE_PROVIDERS],
    bootstrap: [TodoApp]
})
export class ExampleModule { }
