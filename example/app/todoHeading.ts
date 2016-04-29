import {Component, Output, EventEmitter, ViewChildren, QueryList, AfterViewInit, Input} from "angular2/core";
import {NgFor, NgModel, NgIf} from "angular2/common";
import {LocalStorage, ConfigureStorage} from "../../src/api";

@Component({
	selector: "todo-heading",
	template: `
	<h1>To Do List</h1>
	<div>
		<select [(ngModel)]="settings.list" *ngIf="!isEditing">
			<option value="">New List</option>
			<optgroup label="Your lists">
			<option template="ngFor let list of lists" [value]="list">{{list}}</option>
			</optgroup>
		</select>
		<span *ngIf="isEditing"><input #listName type="text"><button (click)="createList(listName.value)">Add</button><button (click)="isEditing=false">Cancel</button></span>
		<span><input type="checkbox" [(ngModel)]="settings.hideDoneItems"/> <label>Hide Done Items</label></span>
	</div>
	`,
	/*
	 * We take advantage of the injector hirearchy and create a new LocalStorage service but this one will be configured
	 * to deal only with keys with the specified prefix. All todo lists will begin with a '/'
	 */
	providers: [ConfigureStorage({ prefix: "/" })],
	directives: [NgFor, NgModel, NgIf]
})
export class TodoHeading implements AfterViewInit {
	@ViewChildren(NgModel) test: QueryList<NgModel>;
	@Input() private options: { list: string, hideDoneItems: boolean }; //this is a reference so updating is global
	private settings: {list: string, hideDoneItems: boolean};
	private lists: string[];
	private isEditing: boolean = false;

	constructor(private localStorage: LocalStorage) {
		this.lists = Object.keys(localStorage);	//the prefix is removed from the keys and can be accessed normally.
		
		//the settings key in  storage doesn't begin with a '/' so it's not part of this service
		this.settings = <any>{};
	}

	ngAfterViewInit() {
		this.test.forEach((control) =>
			control.update.subscribe(() => {
				if(this.settings.list){
					Object.assign(this.options, this.settings);
				}
				else{
					this.isEditing = true;
				}
			}));
			//copy value to prevent updating by reference after a delay to prevent data binding error
			setTimeout(()=>this.settings = Object.assign({}, this.options), 0);
	}
	
	createList(newList){
		this.localStorage[newList] = [];
		this.settings.list = newList;
		this.isEditing = false;
	}
}