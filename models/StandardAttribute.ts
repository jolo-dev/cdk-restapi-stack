import moment from 'moment';
import { v4 as uuid } from 'uuid';

export interface StandardAttribute {
  id?: string;
  creationDateTime?: string;
}

export abstract class Standard {
  private name: string;
  private id: string;
  private creationDateTime: string;
  constructor(name: string, id?: string, creationDateTime?: string) {
    this.name = name;
    this.id = id ?? uuid();
    this.creationDateTime = creationDateTime ?? moment().format();
  }

  public getName() {
    return this.name;
  }

  public getId() {
    return this.id;
  }

  public getCreationDateTime() {
    return this.creationDateTime;
  }

  abstract getProps(): any;
}