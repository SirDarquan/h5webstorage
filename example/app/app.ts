import {Component, ViewChild, AfterViewInit, HostBinding} from "angular2/core";
import {NgModel, NgClass} from "angular2/common";
import {TodoList} from "./todoList";
import {TodoItemModel} from "./todoItem";
import {TodoHeading} from "./todoHeading";
import {LocalStorage, WEB_STORAGE_PROVIDERS, StorageProperty} from "../../src/api";
import {JsonPipe} from "./JsonPipe";

@Component({
	selector: "todo-app",
	template: `
	<div>
		<todo-heading [options]="settings"></todo-heading>
		<todo-list [listId]="settings.list" [ngClass]="{'do-not-show': settings.hideDoneItems}"></todo-list>
	</div>
	<pre>
		{{localStorage | json}}
	</pre>`,
	directives: [TodoList, NgModel, TodoHeading],
	pipes:[JsonPipe],
	providers: [WEB_STORAGE_PROVIDERS] //this is a shortcut to register all the needed parts to make LocalStorage service work properly
})
export class TodoApp {
	//setup a default value. If a value is already defined, it will not be overwritten
	@StorageProperty() public settings: any = { list: "todolist", hideDoneItems: true };

	constructor(private localStorage: LocalStorage) {
		/*
		 * shows one possible way to initialize the storage.
		 * The 'created' property allows us to show that values are stored and not recreated 
		 */

		if (typeof localStorage["/todolist"] == 'undefined') {
			let list: TodoItemModel[] = localStorage["/todolist"] = [];
			list.push({ name: "Step 1", description: "Collect underpants", completed: true, created: Date.now(), modified: Date.now(), id: window["Guid"].create() });
			list.push({ name: "Step 2", description: "?", completed: false, created: Date.now(), modified: Date.now(), id: window["Guid"].create() });
			list.push({ name: "Step 3", description: "Profit", completed: false, created: Date.now(), modified: Date.now(), id: window["Guid"].create() });
		}
	}

}