import { Component, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
import { NgClass } from '@angular/common';
import { TodoList } from './todoList';
import { TodoItemModel } from './todoItem';
import { TodoHeading } from './todoHeading';
import { LocalStorage, StorageProperty } from '../index';
import { JsonPipe } from './JsonPipe';
import cuid from 'cuid';

@Component({
	selector: 'todo-app',
	template: `
	<div>
		<todo-heading [options]="settings"></todo-heading>
		<todo-list [listId]="settings.list" [ngClass]="{'do-not-show': settings.hideDoneItems}"></todo-list>
	</div>
	<pre>
		{{localStorage | json}}
	</pre>`,
	// providers: [LocalStorage], //this is a shortcut to register all the needed parts to make LocalStorage service work properly
})
export class TodoApp {
	// setup a default value. If a value is already defined, it will not be overwritten
	@StorageProperty() public settings: any = { list: 'todolist', hideDoneItems: true };

	constructor(private localStorage: LocalStorage) {
		/*
		 * shows one possible way to initialize the storage.
		 * The 'created' property allows us to show that values are stored and not recreated
		 */

		if (typeof localStorage['/todolist'] === 'undefined') {
			const list: TodoItemModel[] = localStorage['/todolist'] = [];
			list.push({
				name: 'Step 1',
				description: 'Collect underpants',
				completed: true,
				created: Date.now(),
				modified: Date.now(),
				id: cuid()
			});
			list.push({
				name: 'Step 2',
				description: '?',
				completed: false,
				created: Date.now(),
				modified: Date.now(),
				id: cuid()
			});
			list.push({
				name: 'Step 3',
				description: 'Profit',
				completed: false,
				created: Date.now(),
				modified: Date.now(),
				id: cuid()
			});
		}
	}

}
