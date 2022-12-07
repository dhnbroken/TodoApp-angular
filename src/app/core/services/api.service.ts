import { Observable } from 'rxjs';
import { Todo } from 'src/app/models/todo.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

const httpOptions = {
  headers: new HttpHeaders({ 'content-type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  serviceURL: string = 'https://jsonplaceholder.typicode.com/todos';
  todosLimit: string = '?_limit=10';

  constructor(private http: HttpClient) {}

  addTodo(task: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.serviceURL, task, httpOptions);
  }

  getAllTask(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.serviceURL);
  }

  deleteTask(task: Todo): Observable<Todo> {
    const url = `${this.serviceURL}/${task.id}`;
    return this.http.delete<Todo>(url, httpOptions);
  }

  editTask(task: Todo): Observable<Task> {
    return this.http.put<Task>(`${this.serviceURL}/${task.id}`, task);
  }

  changeTaskStatus(todo: Todo): Observable<Object> {
    const url = `${this.serviceURL}/${todo.id}`;
    return this.http.put(url, todo, httpOptions);
  }
}
