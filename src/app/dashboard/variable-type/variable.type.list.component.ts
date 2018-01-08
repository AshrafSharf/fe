import { Component, OnInit } from '@angular/core';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { Router } from '@angular/router';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { AppVariableTypeService } from '../../services/variable.type.service';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { VariableType } from '../../shared/interfaces/variables';

@Component({
    selector: 'varable-type-list',
    templateUrl: 'variable.type.list.component.html',
    styleUrls: ['variable.type.list.component.css']
})

export class VariableTypeListComponent implements OnInit {
    columns: TableViewHeader[];
    rows: TableViewRow[] = new Array<TableViewRow>();
    types: VariableType[];
    

    constructor(
        private router: Router,
        private modal:Modal,
        private service: AppVariableTypeService ) {

            this.columns = new Array<TableViewHeader>();
            this.columns.push(new TableViewHeader("title", "Variable Type title", "col-md-3", "", ""));
            this.columns.push(new TableViewHeader("subvariable_count", "Subvariable Count", "col-md-3", "", ""));
            this.columns.push(new TableViewHeader("description", "Description", "col-md-5", "", ""));
    }

    ngOnInit() {
        this.reloadVariableTypes();
    }

    // reload variable types
    reloadVariableTypes() {
        this.service
            .getTypes()
            .subscribe(result => {
                if (result.status = 'OK') {
                    this.types = result.data as Array<VariableType>;
                    this.rows = new Array<TableViewRow>();
                    this.types.forEach(varType => {
                        var row = new TableViewRow(varType.id);
                        row.addColumn(new TableViewColumn("title", varType.title));
                        //row.addColumn(new TableViewColumn("subvariable_count", varType.subVariables.length));
                        row.addColumn(new TableViewColumn("description", varType.description));
                        this.rows.push(row);
                    });
                }
            });
    }

    addNewVariableType() {
        this.router.navigate(['/home/create-variable-type']);
    }

    onRowEdit(id) {
        this.router.navigate(['home/create-variable-type'], { queryParams: {
            id: id
        }});
    }

    onRowDelete(id) {
        const dialog =
        this.modal
            .confirm()
            .title('Confirmation')
            .body('Are you sure you want to delete this variable type?')
            .okBtn('Yes').okBtnClass('btn btn-danger')
            .cancelBtn('No')
            .open();

        dialog.then(promise => {
            promise.result.then(result => {
                this.service
                    .deleteType(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {
                            this.reloadVariableTypes();
                        }
                    });
            });
        });
    }
}