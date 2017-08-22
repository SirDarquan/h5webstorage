import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
	selector: 'todo-item',
	template:
	`
		<ng-template [ngIf]="!isEditing">
			<div class="item-status"><input type="checkbox" [(ngModel)]="data.completed"/></div>
			<div class="item-info">
				<h3>{{data.name}}</h3>
				<p>{{data.description}}</p>
			</div>
			<div class="item-actions">
				<i class="material-icons md-48" (click)="editItem()">edit</i>
				<i class="material-icons md-48" (click)="removeItem()">clear</i>
			</div>
		</ng-template>
		<ng-template [ngIf]="isEditing">
			<label>Name</label> <input type="text" [(ngModel)]="data.name" class="form-control"/>
			<label>Description</label> <textarea [(ngModel)]="data.description" class="form-control"></textarea>
			<div>
				<button (click)="switchMode(true)">Update</button>
				<button (click)="switchMode(false)">Cancel</button>
			</div>
		</ng-template>	
	`
})
export class TodoItem implements AfterViewInit {
	@Input() data: TodoItemModel;
	@Output() changed: any = new EventEmitter<TodoItemModel>();
	@Output() removed: any = new EventEmitter<TodoItemModel>();
	@Output() selected: any = new EventEmitter<TodoItemModel>();
	@ViewChild(NgModel) ngModel: NgModel;
	@HostBinding('class.completed') test;
	@HostBinding('class.editing') isEditing = false;
	private oldValue = {};

	constructor() {

	}

	ngAfterViewInit() {
		this.ngModel.update.subscribe(() => {
			this.data.modified = Date.now();
			this.test = this.data.completed;
			this.changed.emit(this.data);
		});
		setTimeout(() => this.test = this.data.completed, 0);
	}

	removeItem() {
		this.removed.emit(this.data);
	}

	editItem() {
		this.isEditing = true;
		Object.assign(this.oldValue, this.data);
	}

	switchMode(updateItem) {
		this.isEditing = false;
		if (updateItem) {
			this.data.modified = Date.now();
			this.changed.emit(this.data);
		} else {
			Object.assign(this.data, this.oldValue);
			this.oldValue = {};
		}
	}
}

export interface TodoItemModel {
	id: string;
	name: string;
	description: string;
	completed: boolean;
	created: number;
	modified: number;
}
