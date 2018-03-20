import { Router, ActivatedRoute } from '@angular/router';
import { Project } from './../../shared/interfaces/project';
import { TimeSegmentComponent } from './../variables/time-segment/time.segment.component';
import { Component, OnInit } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { ProjectService } from '../../services/project.service';
import { User } from '../../shared/interfaces/user';
import { UserService } from '../../services/user.service';
import { Utils } from '../../shared/utils';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { ModelService } from '../../services/model.service';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { ComponentModel } from '../../shared/interfaces/component.model';

@Component({
    selector: 'app-model-list',
    templateUrl: 'model.list.component.html'
})

export class ComponentModelListComponent implements OnInit {
    models:Array<ComponentModel> = new Array<ComponentModel>();
    columns: TableViewHeader[];
    rows: TableViewRow[] = new Array<TableViewRow>();
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modal:Modal,
        private userService: UserService,
        private modelService: ModelService) {
    }

    public ngOnInit() {
        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Model Title", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("owner", "Owner", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("description", "Description", "col-md-5", "", ""));

        this.reloadModels();
    }

    public onRowDelete(id) {
        const dialog =
            this.modal
                .confirm()
                .title('Confirmation')
                .body('Are you sure you want to delete this model?')
                .okBtn('Yes').okBtnClass('btn btn-danger')
                .cancelBtn('No')
                .open();

        dialog.then(promise => {
            promise.result.then(result => {
                this.modelService
                    .deleteModel(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {
                            this.reloadModels();
                        }                     
                    });
            });
        });
    }
    
    public onRowEdit(id) {
        for (var index = 0; index < this.models.length; index++) {
            var model = this.models[index];
            if (model.id == id) {
                this.router.navigate(['home/create-component-model'], { queryParams: {
                    id: model.id
                }});
                break;
            }
        }
    }

    public reloadModels() {
        this.modelService
            .getModels('test-branch')
            .subscribe(result => {
                if (result.status = 'OK') {
                    this.models = result.data as Array<ComponentModel>;
                    this.rows = new Array<TableViewRow>();
                    this.models.forEach(model => {
                        var row = new TableViewRow(model.id);
                        row.addColumn(new TableViewColumn("name", model.title));
                        row.addColumn(new TableViewColumn("owner", model.ownerName));
                        row.addColumn(new TableViewColumn("description", model.description));
                        this.rows.push(row);
                    });
                }
            });
    }
     
    public addNewModel() {
        this.router.navigate(['home/create-component-model']);
    }
}