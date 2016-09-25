import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TodoApp } from './app.component';
import { TodoHeading } from './todoHeading';
import { TodoList } from './todoList';
import { TodoItem } from './todoItem';
import { JsonPipe } from './JsonPipe';
import { CreateItem } from './createItem';
import { WebStorageModule, BROWSER_STORAGE_PROVIDERS } from '../../src/index';

@NgModule({
	imports: [BrowserModule, CommonModule, FormsModule, WebStorageModule],
	providers: [BROWSER_STORAGE_PROVIDERS],
	declarations: [TodoApp, TodoHeading, TodoList, TodoItem, CreateItem],
	bootstrap: [TodoApp]
})
export class ToDoAppModule { }