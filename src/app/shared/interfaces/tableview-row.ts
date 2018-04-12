import { TableViewColumn } from "./tableview-column";
import { User } from '../../shared/interfaces/user';

export class TableViewRow {
    id: String;
    columns: TableViewColumn[] = Array<TableViewColumn>();
    isPrivate:Boolean;
    usersWithAccess: User[] = Array<User>();


    constructor(id:String) {
        this.id = id;
    }

    addColumn(item: TableViewColumn) {
        this.columns.push(item);
    }
    
    setPrivate(privateStatus) {
        this.isPrivate = privateStatus;
    }

    setUsersWithAccess(users) {
        this.usersWithAccess = users;
    }
}