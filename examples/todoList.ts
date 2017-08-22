import { Component, Input } from '@angular/core';
import { LocalStorage, StorageProperty } from '../index';
import { TodoItem, TodoItemModel } from './todoItem';
import { CreateItem } from './createItem';

@Component({
	selector: 'todo-list',
	template: `
	<todo-item *ngFor="let item of todoItems; trackBy:tracker" 
		[data]="item" 
		(changed)="updateData($event)" 
		(removed)="deleteData($event)">
	</todo-item>
	<add-item (created)="addItem($event)"></add-item>
	`
})
export class TodoList {
	@Input() public listId: string;

	get todoItems(): TodoItemModel[] {
		// this is how we would have to create properties if the StorageProperty decorator didn't exist
		return this.localStorage['/' + this.listId];
	}

	constructor(private localStorage: LocalStorage) {
	}

	updateData(newData) {
		const currItem = this.todoItems.find((item) => item.id === newData.id);
		// since todoItems IS the value stored in localStorage, updating values in this array updates the values in localStorage
		Object.assign(currItem, newData);
	}

	deleteData(data) {
		const index = this.todoItems.indexOf(data);
		// the two-way binding allows us to alter the property to change the stored data
		this.todoItems.splice(index, 1);
	}

	addItem(newData) {
		// adding items to the list is as easy as adding items to the array
		this.todoItems.push(newData);
	}

	tracker(index: number, item: TodoItemModel) {
		return item.id;
	}
}
