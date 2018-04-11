import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableViewHeader } from '../interfaces/tableview-header';
import { TableViewRow } from '../interfaces/tableview-row';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/roles.service';
import { User } from '../../shared/interfaces/user';
import { Utils } from '../../shared/utils';

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
	@Input('extra-buttons') extraButtons = [];
    @Input('rows') set rows(rows: TableViewRow[]) {
        this.originalRows = rows;
        this.filteredRows = rows;
    }
    
    // for filtering
    originalRows:TableViewRow[];
    filteredRows:TableViewRow[];
    filterCols = [];
    userRole:String;
    usersWithAccess = [];

    constructor(private roleService: RoleService,
                private userService: UserService) { }

    ngOnInit() {
        let roles = [];
        this.roleService.getRoles().subscribe(result => {
            let roleData = result.data;
            roleData.forEach(role => {
                roles.push(role);
            });

            this.userService.getLoggedInUser().subscribe(result => {
                if (result.status == "OK") {
                    let userData = result.data;
                    roles.forEach(user => {
                        if (userData.roleId == user.id) {
                            this.userRole = user.roleName;
                        }
                    });

                }
            });
        });
        
        for (var index = 0; index < this.cols.length; index++) {
            this.filterCols[index] = "";
        }
    }

    onRowSelected(event, id) {
        event.preventDefault();
        this.rowSelected.emit(id);
    }

    filterResult(event, col:TableViewHeader) {
        var push = false;
        for (var index = 0; index < this.cols.length; index++) {
            if (index == this.cols.indexOf(col)) {
                this.filterCols[index] = event.target.value;
            }
        }
        this.filteredRows = new Array<TableViewRow>();
        this.originalRows.forEach(row => {
            for (var index = 0; index < row.columns.length; index++) {
                    if (row.columns[index].value != undefined && row.columns[index].value.toLowerCase().indexOf(this.filterCols[index].toLowerCase()) >= 0) {
                        push = true;
                    }
                    else {
                        push = false;
                        break;
                    }
            }
            if (push == true) {
                this.filteredRows.push(row);
            }

        });
    }

    onDeleteRow(id) {
        this.rowDeleted.emit(id);
    }

    onEditRow(id) {
        this.rowEdited.emit(id);        
    }
    
    getUserAccess(users) {
        let hasAccess = false;
        users.forEach(user => {
            if (Utils.getUserId() == user.id) {
                hasAccess = true;
            }
        });
        return hasAccess;
    }
}
