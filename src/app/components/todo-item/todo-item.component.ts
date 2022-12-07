import { TodoService } from './../../core/services/todo.service';
import { ApiService } from './../../core/services/api.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Todo } from 'src/app/models/todo.model';
import * as moment from 'moment';
import { interval } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
})
export class TodoItemComponent implements OnInit {
  @Input() todo: Todo;
  @Output() changeStatus: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() editTodo: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() deleteTodo: EventEmitter<Todo> = new EventEmitter<Todo>();

  newTask: Todo;

  timeDeadline: string = '';
  isNearDeadline: boolean = false;
  expire: boolean = false;

  isEdit = false;
  alertMsg: string = '';

  public todoForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private todoService: TodoService
  ) {}

  ngOnInit(): void {
    this.newTask = new Todo(0, '');
    this.todoForm = new FormGroup({
      title: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
    });

    interval(1000).subscribe({
      next: () => {
        this.isNearDeadline = this.todoService.isDeadline(
          this.todo.deadline,
          this.todo.completed
        );
        this.timeDeadline = moment(this.todo.deadline).from(new Date());
        this.expire = this.todoService.isTimeOut(
          this.todo.deadline,
          this.todo.completed
        );
      },
    });
  }

  handleDeleteTask(todo: Todo) {
    this.deleteTodo.emit(todo);
  }

  changeTaskStatus(todo: Todo) {
    this.apiService.changeTaskStatus(todo).subscribe();
    this.changeStatus.emit(todo);
  }

  callEdit(todo: Todo) {
    this.isEdit = true;
    this.todoForm.setValue({
      title: todo.title,
      date: moment(todo.deadline).format('YYYY-MM-DDTHH:mm'),
    });
  }

  onSubmit() {
    if (this.todoForm?.get('title')?.errors?.['required']) {
      this.alertMsg = 'Please enter a title for task';
      return;
    }
    if (this.todoForm?.get('date')?.errors?.['required']) {
      this.alertMsg = 'Please pick a valid date for task';
      return;
    }
    const newTodo: Todo = {
      title: this.todoForm.value.title as string,
      completed: false,
      deadline: this.todoForm.value.date as string,
      id: this.todo.id,
    };
    this.editTodo.emit(newTodo);
    this.todo.title = newTodo.title;
    this.todo.deadline = newTodo.deadline;
    this.timeDeadline = moment(this.newTask.deadline).from(new Date());
    this.isEdit = false;
  }
}
