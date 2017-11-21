import { TableViewColumn } from "./tableview-column";

export class TableViewRow {
    id: String;
    columns: TableViewColumn[] = Array<TableViewColumn>();

    constructor(id:String) {
        this.id = id;
    }

    addColumn(item: TableViewColumn) {
        this.columns.push(item);
    }

}