import moment from 'moment';
import { v4 as uuid } from 'uuid';

export interface StandardAttribute {
  ID?: string;
  CreationDateTime?: string;
}

export abstract class Standard {
  private name: string;
  private ID: string;
  private CreationDateTime: string;
  constructor(name: string, id?: string, creationDateTime?: string) {
    this.name = name;
    this.ID = id ?? uuid();
    this.CreationDateTime = creationDateTime ?? moment().format();
  }

  public getName() {
    return this.name;
  }

  public getId() {
    return this.ID;
  }

  public getCreationDateTime() {
    return this.CreationDateTime;
  }

  abstract getProps(): any;
}