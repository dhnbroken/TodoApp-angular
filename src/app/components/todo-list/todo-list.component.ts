import { ApiService } from './../../core/services/api.service';
import { Filter, FilterTask } from './../../models/filter.model';
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Todo } from 'src/app/models/todo.model';
import * as moment from 'moment';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent implements OnInit, OnDestroy, DoCheck {
  todos: Todo[];
  todoCount: number;
  activeCount: number;
  deadline: string;
  completed: boolean;
  destroy$: Subject<null> = new Subject<null>();
  filteredTodos: Todo[];
  searchTodo: string;

  private currentFilter: Filter = Filter.All;

  constructor(private apiService: ApiService) {}

  filterButtons: FilterTask[] = [
    { type: Filter.All, label: 'All', isActive: true },
    { type: Filter.Active, label: 'Active', isActive: false },
    { type: Filter.Completed, label: 'Completed', isActive: false },
  ];

  private displayTodosSubject: BehaviorSubject<Todo[]> = new BehaviorSubject<
    Todo[]
  >([]);
  todos$: Observable<Todo[]> = this.displayTodosSubject.asObservable();

  ngOnInit(): void {
    this.apiService.getAllTask().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.todoCount = todos.length;
        this.completed = this.todos.some((t) => t.completed);
        this.filteredTodos = this.todos;
        this.activeCount = this.filteredTodos.filter(
          (t) => !t.completed
        ).length;
      },
      complete: () => {
        this.destroy$.complete();
      },
    });
    this.filterTodos(this.currentFilter, false);
  }
  ngDoCheck() {}

  filter(filter: Filter) {
    this.setActiveFilter(filter);
    this.filterTodos(filter);
  }
  public filterTodos(filter: Filter, isFitler: boolean = true) {
    this.currentFilter = filter;
    switch (filter) {
      case Filter.Active:
        this.filteredTodos = this.todos.filter((todo) => !todo.completed);
        this.completed = false;
        break;
      case Filter.Completed:
        this.filteredTodos = this.todos.filter((todo) => todo.completed);
        this.completed = true;
        break;
      case Filter.All:
        this.filteredTodos = this.todos;
        this.completed = true;
    }
    if (isFitler) {
      this.updateTodoData();
    }
  }

  private setActiveFilter(type: Filter) {
    this.filterButtons.forEach((btn) => {
      btn.isActive = btn.type === type;
    });
  }

  onChangeTaskStatus(todo: Todo) {
    if (todo.completed) {
      this.activeCount++;
    } else {
      this.activeCount--;
    }
    todo.completed = !todo.completed;
    if (this.currentFilter !== Filter.All) {
      const index = this.filteredTodos.findIndex((t) => t.id === todo.id);
      this.filteredTodos.splice(index, 1);
    }
    this.apiService.changeTaskStatus(todo).subscribe({
      complete: () => {
        this.destroy$.complete();
      },
    });
  }

  onHandleEdit(todo: Todo) {
    this.apiService.editTask(todo);
  }

  onHandleDelete(todo: Todo) {
    this.apiService.deleteTask(todo);
    this.todos = this.todos.filter((t) => t.id !== todo.id);
    this.filteredTodos = this.filteredTodos.filter((t) => t.id !== todo.id);
    this.todoCount = this.todos.length;
    if (!todo.completed) {
      this.activeCount--;
    }
  }

  handleChangeTime(date: string) {
    this.deadline = moment(date).format('DD/MM/YYYY');
  }

  addTodo(todo: Todo) {
    this.apiService.addTodo(todo).subscribe({
      next: (todo) => {
        this.todoCount++;
        this.activeCount++;
        this.todos.unshift({
          ...todo,
          id: this.todos.length + 1,
        });
        this.filteredTodos = [...this.todos];
      },
      complete: () => {
        this.destroy$.complete();
      },
    });
  }

  handleCompleteAll() {
    this.todos = this.todos.map((todo) => {
      return {
        ...todo,
        completed: !this.todos.every((task) => task.completed),
      };
    });
    this.filteredTodos = [...this.todos];
    if (this.currentFilter !== Filter.All) {
      this.filteredTodos = [];
    }
    this.activeCount = this.todos.filter((t) => !t.completed).length;
  }

  handleClearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.completed);
    if (this.currentFilter === Filter.Completed) {
      this.filteredTodos = [];
      this.todoCount = this.activeCount;
    } else if (this.currentFilter === Filter.All) {
      this.filteredTodos = [...this.todos];
      this.todoCount = this.filteredTodos.length;
    }
  }

  private updateTodoData() {
    this.displayTodosSubject.next(this.filteredTodos);
  }

  ngOnDestroy(): void {
    this.ngOnInit();
    this.destroy$.complete();
  }
}
