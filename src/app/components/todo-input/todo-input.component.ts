import { Todo } from 'src/app/models/todo.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-todo-input',
  templateUrl: './todo-input.component.html',
  styleUrls: ['./todo-input.component.scss'],
})
export class TodoInputComponent implements OnInit {
  @Input() todoCount: number;
  @Input() todos: Todo[];
  @Output() changeTime: EventEmitter<string> = new EventEmitter();
  @Output() addTodo: EventEmitter<Todo> = new EventEmitter();

  public todoForm: FormGroup;

  alertMsg: string = '';

  constructor() {}

  ngOnInit(): void {
    this.todoForm = new FormGroup({
      title: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (this.getData('title')?.errors?.['required']) {
      this.alertMsg = 'Please enter a title for task';
      return;
    }
    if (this.getData('date')?.errors?.['required']) {
      this.alertMsg = 'Please pick a valid date for task';
      return;
    }
    const todo = {
      id: this.todos.length + 1,
      title: this.getData('title')?.value,
      completed: false,
      deadline: this.getData('date')?.value,
    };
    this.todoForm.reset();
    this.addTodo.emit(todo);
    this.changeTime.emit(todo.deadline);
    this.alertMsg = '';
  }

  getData(controlName: string) {
    return this.todoForm.get(controlName) as FormGroup;
  }
}
