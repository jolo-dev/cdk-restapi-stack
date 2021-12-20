import moment from 'moment';

export interface StandardAttribute {
  name: string;
  creationDateTime?: string;
}

export abstract class Standard {
  private name: string;
  private creationDateTime: string;
  private tableName: string;
  constructor(tableName: string, name: string, creationDateTime?: string) {
    this.tableName = tableName;
    this.name = name;
    this.creationDateTime = creationDateTime ?? moment().format();
  }

  public getTableName() {
    return this.tableName;
  }

  public getName() {
    return this.name;
  }

  public getCreationDateTime() {
    return this.creationDateTime;
  }

  abstract getProps(): any;
}