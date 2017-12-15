import { AppVariableService } from './../../services/variable.services';
import { Component, OnInit } from '@angular/core';
import { Project } from '../../shared/interfaces/project';
import { Branch } from '../../shared/interfaces/branch';
import { ProjectService } from '../../services/project.service';
import { BranchService } from '../../services/branch.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { TableViewHeader } from '../../shared/interfaces/tableview-header';
import { TableViewRow } from '../../shared/interfaces/tableview-row';
import { TableViewColumn } from '../../shared/interfaces/tableview-column';
import { Variable, KeyValuePair } from '../../shared/interfaces/variables';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: 'variable-list',
    templateUrl: './variable-list.component.html'
})

export class VariableListComponent implements OnInit {
    projects:Project[] = Array<Project>();
    branches:Branch[] = Array<Branch>();
    variables: Variable[] = Array<Variable>();

    columns: Array<TableViewHeader>;
    rows: TableViewRow[] = new Array<TableViewRow>();
    
    selectedProject: String = null;
    selectedBranch: String = null;

    selectedProjectId = null;
    selectedBranchId = null;

    constructor(
        private route: ActivatedRoute,
        private modalDialog:Modal, 
        private variableService: AppVariableService,
        private modal: ModalDialogService,
        private router: Router,
        private projectService:ProjectService,
        private branchService:BranchService) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'];
            this.selectedBranchId = params['branchId'];

            this.reloadProjects();
        });

        this.columns = new Array<TableViewHeader>();
        this.columns.push(new TableViewHeader("name", "Variable Name", "col-md-3", "", ""));
        this.columns.push(new TableViewHeader("owner", "Owner", "col-md-2", "", ""));
        this.columns.push(new TableViewHeader("varType", "Variable Type", "col-md-2", "", ""));
        this.columns.push(new TableViewHeader("valueType", "Value Type", "col-md-2", "", ""));
        this.columns.push(new TableViewHeader("timesegment", "#Segments", "col-md-1", "", ""));
    }

    addNewVariable() {
        if (this.selectedProject.length == 0) {
            this.modal.showError('Please select a project');
        } else if (this.selectedBranch.length == 0) {
            this.modal.showError('Please select a branch');            
        } else {
            this.router.navigate(['/home/create-variable'], {
                queryParams: {
                    projectId: this.selectedProject,
                    branchId: this.selectedBranch
                }
            });
        }
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    calculateValues() {
        this.variableService
            .calculateVariableValues(this.selectedBranch)
            .subscribe(response => {
                this.modal.showError('Calculations are done', '');
                this.reloadVariables();
            });
    }

    reloadVariables() {
        this.variableService
            .getVariables(this.selectedBranch)
            .subscribe(response => {
                console.log(response);
                this.variables = response.data as Array<Variable>;

                this.rows = new Array<TableViewRow>();
                this.variables.forEach(variable => {
                    var row = new TableViewRow(variable.id);
                    row.addColumn(new TableViewColumn("name", variable.title));
                    row.addColumn(new TableViewColumn("owner", variable.ownerName));
                    row.addColumn(new TableViewColumn("varType", variable.variableType));
                    row.addColumn(new TableViewColumn("valueType", variable.valueType));
                    row.addColumn(new TableViewColumn("timesegment", variable.timeSegment.length.toString()));
                    this.rows.push(row);
                });
            })
    }

    reloadProjects() {
        // clear rows
        this.rows.splice(0, this.rows.length);
        this.variables.splice(0, this.variables.length);

        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status == "OK") {
                    this.projects = result.data;
                    console.log(this.projects);

                    this.selectedProject = '';
                    if (this.selectedProjectId != null) {
                        this.selectedProject = this.selectedProjectId;
                    } else if (this.projects.length > 0) {
                        this.selectedProject = this.projects[0].id;
                    }
                    console.log("project id: " + this.selectedProject);
                    this.reloadBranches();
                }
            });
    }

    reloadBranches(projectId:String = null) {
        // clear rows
        this.rows.splice(0, this.rows.length);
        this.variables.splice(0, this.variables.length);
        
        var id = projectId;
        if (projectId == null) { 
            if (this.selectedProjectId != null) {
                id = this.selectedProjectId;
            } else if (this.projects.length > 0) {
                id = this.projects[0].id;
            }
        }
        console.log("project id: " + id);
        
        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedBranch = '';
                    if (this.selectedBranchId != null) {
                        this.selectedBranch = this.selectedBranchId;
                    } else if (this.branches.length > 0) {
                        this.selectedBranch = this.branches[0].id;
                    }

                    this.reloadVariables();
                });
        }
    }

    onRowEdit(id) {
        this.router.navigate(['/home/create-variable'], {
            queryParams: {
                projectId: this.selectedProject,
                branchId: this.selectedBranch,
                variableId: id
            }
        });
    }

    onRowDelete(id) {
        const dialog =
        this.modalDialog
            .confirm()
            .title('Confirmation')
            .body('Are you sure you want to delete this variable?')
            .okBtn('Yes').okBtnClass('btn btn-danger')
            .cancelBtn('No')
            .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.variableService
                    .deleteVariable(id)
                    .subscribe(result => {
                        if (result.status == 'OK') {
                            this.reloadVariables();
                        }
                
                    });
            });
        });
    }

    showInfo(id) {
        var variable:Variable = null;
        for (var index = 0; index < this.variables.length; index++) {
            if (this.variables[index].id == id) {
                variable = this.variables[index];
                break;
            }
        }

        if (variable != null) {
            var info = '';

            var panels = '';
            for (index = 0; index < variable.timeSegment.length; index++) {
                var segment = variable.timeSegment[index];
                var keys = Object.keys(segment);
                var panelBody = '';

                keys.forEach(key => {

                    if (key != 'timeSegmentResponse') {
                        panelBody += `
                            <div><strong>${key}:</strong> ${segment[key]}</div>
                        `;
                    }
                });

                panels += `
                    
                        <div class="col-md-4">
                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Time Segment - ${index + 1}</h4>
                                </div>
                                <div class="panel-body">
                                    ${panelBody}
                                </div>
                            </div>
                        </div>
                `;
            }
            panels += '';

            info = `
                <div class="row">
                    <div class="col-md-12">
                        <div><strong>Name:</strong> ${variable['title']}</div>
                        <div><strong>Owner:</strong> ${variable['ownerName']}</div>
                        <div><strong>Variable Type:</strong> ${variable['variableType']}</div>
                        <div><strong>Value type:</strong> ${variable['valueType']}</div>
                    </div>
                </div>
                <div>&nbsp;</div>
                <div style="padding: 20px;">
                    <div class="panel-container row"> 
                        ${panels}
                    </div>
                </div>
            `;

            this.modalDialog
                .alert()
                .size('lg')
                .title(variable.title.toString())
                .body(info)
                .open();
        }



          // showValues(id) {
        //     var variable:Variable = null;
        //     for (var index = 0; index < this.variables.length; index++) {
        //         if (this.variables[index].id == id) {
        //             variable = this.variables[index];
        //             break;
        //         }
        //     }

        //     if (variable != null) {
        //         var table = '';
        //         for (index = 0; index < variable.timeSegment.length; index++) {
        //             table += `<h4>Time Segment - ${index + 1}</h4>`;
        //             var resultMap = variable.timeSegment[index].timeSegmentResponse.resultMap;
        //             resultMap.forEach(obj => {
        //                 if (obj['title'] != '0') {
        //                     table += `<h5 class="text-danger text-center" style="margin-top: 10px;">${obj['title']}</h5>`;
        //                 }

        //                 var header = '<tr>'; 
        //                 var body = '<tr>';

        //                 var data = obj['data'] as Array<{title:String, value:String}>;
        //                 data.forEach(element => {
        //                     header += `<th>${element['title']}</th>`;
        //                     body += `<td>${element['value']}</td>`;
        //                 });

        //                 header += '</tr>';
        //                 body += '</tr>';

        //                 table += '<table class="table table-striped table-bordered">';
        //                 table += '<thead>';
        //                 table += header;
        //                 table += '</thead>';

        //                 table += '<tbody>';
        //                 table += body;
        //                 table += '</tbody>';
        //                 table += '</table>';
        //             });
        //         }

        //         this.modalDialog
        //             .alert()
        //             .size('lg')
        //             .title(variable.title.toString())
        //             .body(table)
        //             .open();
        //     }
        // }

        /*
        showValues(id) {
            var variable:Variable = null;
            for (var index = 0; index < this.variables.length; index++) {
                if (this.variables[index].id == id) {
                    variable = this.variables[index];
                    break;
                }
            }

            var table = '';
            if (variable != null) {
                console.log(variable);
                for (index = 0; index < variable.timeSegment.length; index++) {
                    var segment = variable.timeSegment[index];
                    if (segment.resultMap == undefined) continue;
                    var topKeys = Object.keys(segment.resultMap);
                    var count = 1;
                    topKeys.forEach(topKey => {
                        var valuesObj = segment.resultMap[topKey];
                        console.log(valuesObj);

                        table += `<h3>Time Segment - ${count}</h3><table class="table table-striped">`;
                        table += '<tbody>';

                        count += 1;

                        var header = '<tr>'; 
                        var body = '<tr>';
                        var innerKeys = Object.keys(valuesObj);
                        innerKeys.forEach(innerKey => {
                            console.log(valuesObj[innerKey]);
                            header += `<th>${innerKey}</th>`;
                            body += `<td>${valuesObj[innerKey]}</td>`;
                        });

                        header += '</tr>';
                        body += '</tr>';
                        table += header + body + '</tbody>';
                        table += '</table>';
                    });
                }

                this.modalDialog
                    .alert()
                    .size('lg')
                    .title(variable.title.toString())
                    .body(table)
                    .open();
            }        
        }
        */

    }

}