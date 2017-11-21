import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableViewHeader } from '../interfaces/tableview-header';
import { TableViewRow } from '../interfaces/tableview-row';

@Component({
    selector: 'table-view',
    templateUrl: './table.view.component.html',
    styleUrls: ['./table.view.component.css']
})

export class TableViewComponent implements OnInit {
    @Input('cols') cols: TableViewHeader[] = Array<TableViewHeader>();
    @Input('delete-required') deleteRequired = true;
    @Input('edit-required') editRequired = true;
    @Output('row-selected') rowSelected = new EventEmitter();
    @Output('row-edited') rowEdited = new EventEmitter();
    @Output('row-deleted') rowDeleted = new EventEmitter();
    
    // for filtering
    originalRows:TableViewRow[];
    filteredRows:TableViewRow[];

    @Input('rows') set rows(rows: TableViewRow[]) {
        this.originalRows = rows;
        this.filteredRows = rows;
    }

    constructor() { }

    ngOnInit() { 
    }

    onRowSelected(event, id) {
        event.preventDefault();
        this.rowSelected.emit(id);
    }

    filterResult(event, col:TableViewHeader) {
        this.filteredRows = new Array<TableViewRow>();
        this.originalRows.forEach(row => {
            for (var index = 0; index < row.columns.length; index++) {
                if (row.columns[index].columnName == col.title) {
                    // found column
                    if (row.columns[index].value != undefined && row.columns[index].value.indexOf(event.target.value) >= 0) {
                        this.filteredRows.push(row);
                    }
                    break;
                }
            }
        });
    }

    onDeleteRow(id) {
        this.rowDeleted.emit(id);
    }

    onEditRow(id) {
        this.rowEdited.emit(id);        
    }
}