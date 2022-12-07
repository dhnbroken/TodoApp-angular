import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor() {}

  isTimeOut = (deadline: string, completed: boolean) =>
    !completed && moment(deadline).isBefore(moment());

  isDeadline = (deadline: string, completed: boolean) => {
    return (
      !completed &&
      moment(deadline).diff(moment(), 'minutes') <= 60 &&
      moment(deadline).isAfter(moment().format())
    );
  };
}
