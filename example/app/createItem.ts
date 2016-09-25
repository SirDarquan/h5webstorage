import {Component, EventEmitter, Output} from "@angular/core";
import {TodoItemModel} from "./todoItem";

@Component({
	selector: "add-item",
	template:
	`<fieldset>
		<legend>Add To Do Item</legend>
		<label>Name</label><input type="text" [(ngModel)]="name" />
		<label>Description</label><textarea [(ngModel)]="description"></textarea>
		<button (click)="createItem()">Add</button>
	</fieldset>`
})
export class CreateItem {
	public name: string = "";
	public description: string = "";
	@Output() public created: EventEmitter<TodoItemModel> = new EventEmitter<TodoItemModel>();

	createItem() {
		this.created.emit({
			id: window["Guid"].create(),
			name: this.name,
			description: this.description,
			created: Date.now(),
			modified: Date.now(),
			completed: false
		});
		this.name = "";
		this.description = "";
	}
}