import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TodoApp } from './app.component';
import { TodoHeading } from './todoHeading';
import { TodoList } from './todoList';
import { TodoItem } from './todoItem';
import { CreateItem } from './createItem';
import { WebStorageModule } from '../index';

@NgModule({
    declarations: [
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
        WebStorageModule.forRoot()
    ],
    bootstrap: [TodoApp]
})
export class ExampleModule { }
