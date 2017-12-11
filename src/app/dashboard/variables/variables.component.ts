import { Router, ActivatedRoute } from '@angular/router';
import { AppVariableService } from './../../services/variable.services';
import { UserService } from './../../services/user.service';
import { Project } from './../../shared/interfaces/project';
import { Component, OnInit, ViewChildren } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Branch } from './../../shared/interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { User } from '../../shared/interfaces/user';
import { TimeSegmentComponent } from './time-segment/time.segment.component';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { Variable, TimeSegment } from '../../shared/interfaces/variables';

@Component({
    selector: 'variables',
    templateUrl: './variables.component.html',
    styleUrls: ['./variables.component.css']
})

export class VariablesComponent implements OnInit {
    @ViewChildren(TimeSegmentComponent) timeSegmentWidgets:TimeSegmentComponent[];

    projects:Project[] = Array<Project>();
    branches:Branch[] = Array<Branch>();
    variables: Variable[] = Array<Variable>();

    branchId = '';
    projectId = '';

    selectedProject: String = '';
    selectedBranch: String = '';
    selectedVariable: Variable = null

    users: User[] = Array<User>();

    variableName = '';
    valueType = 'integer';
    variableType = 'actual';
    ownerId: String = '';

    timeSegments: TimeSegment[] = Array<TimeSegment>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private variableService: AppVariableService,
        private modal: ModalDialogService,
        private userService: UserService,
        private projectService:ProjectService,
        private branchService:BranchService) { }

    ngOnInit() {
        this.userService
            .getOwners((users) => {
                this.users = users;
                this.ownerId = (this.users.length > 0) ? this.users[0].id : '';
            })

        this.route.queryParams.subscribe(params => {
            this.projectId = params['projectId'];
            this.branchId = params['branchId'];
            var varId = params['variableId'];
            
            this.variableService
                .getVariables(this.branchId)
                .subscribe(response => {
                    console.log(response);
                    var variables = response.data as Array<Variable>;
                    for (var index = 0; index < variables.length; index++) {
                        var variable = variables[index];
                        if (variable.id == varId) {
                            this.selectVariable(variable);
                            break;
                        }
                    }
                })
        });

        //this.reloadProjects();
    }

    addTimeSegment() {
        this.timeSegments.push({
            constantValue: 0,
            description: '',
            inputMethod: 'constant',
            distributionType: 'none',
            growth: 0,
            mean: '',
            startTime: '',
            stdDeviation: '',
            timeSegmentResponse: {
                resultMap: Array()
            },
            userSelectedParametrics: '',
            userSelectedParametricsStdDeviation: ''
        });
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    selectVariable(variable:Variable) {
        console.log(variable);
        
        this.selectedVariable = variable;
        this.variableName = variable.title.toString();
        this.ownerId = variable.ownerId;
        this.valueType = variable.valueType.toString();
        this.variableType = variable.variableType.toString();

        this.timeSegments.splice(0, this.timeSegments.length);
        variable.timeSegment.forEach(element => {
            this.timeSegments.push(element);
        });
    }

    reloadProjects() {
        this.selectedVariable = null;
        this.variables.splice(0, this.variables.length);

        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status == "OK") {
                    this.projects = result.data;
                    this.selectedProject = '';
                    if (this.projects.length > 0) {
                        this.selectedProject = this.projects[0].id;
                    }
                    this.reloadBranches();
                }
            });
    }

    reloadBranches(projectId:String = null) {
        this.selectedVariable = null;
        this.variables.splice(0, this.variables.length);
        
        var id = projectId;
        if ((projectId == null) && (this.projects.length > 0)) {
            id = this.projects[0].id;
        }

        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedBranch = '';
                    if (this.branches.length > 0) {
                        this.selectedBranch = this.branches[0].id;
                        this.reloadVariables();
                    }
                });
        }
    }
    

    reloadVariables() {
        this.selectedVariable = null;
        this.variableService
            .getVariables(this.selectedBranch)
            .subscribe(response => {
                console.log(response);
                this.variables = response.data as Array<Variable>;
            })
    }


    onDeleteSegment() {
        this.timeSegments.pop();
    }

    onSave() {
        if (this.variableName.length == 0) {
            this.modal.showError('Variable name is mandatory');
        } else if (this.variableType.length == 0) {
            this.modal.showError('Variable type is mandatory');
        } else if (this.ownerId.length == 0) {
            this.modal.showError('Owner Id is mandatory');
        } else {
            var timeSegmentValues = Array();
            this.timeSegmentWidgets.forEach(segment => {
                var result = segment.getTimeSegmentValues();
                if (result.result) {
                    timeSegmentValues.push(result.reason);
                }
            });
    
            if (timeSegmentValues.length != this.timeSegmentWidgets.length) {
                this.modal.showError('Incomplete time segment definition');
            } else {
                let body = {
                    branchId: this.branchId,
                    ownerId: this.ownerId,
                    timeSegment: timeSegmentValues,
                    title: this.variableName,
                    variableType: this.variableType,
                    valueType: this.valueType
                }
                console.log(body);

                if (this.selectedVariable == null) {
                    this.variableService
                    .createVariable(body)
                    .subscribe(response => {
                        console.log(response);
                        this.selectedVariable = null;
                        this.onCancel();
                        //this.router.navigate(['/home/variable-list']);
                    })
                } else {
                    this.variableService
                        .updateVariable(body, this.selectedVariable.id)
                        .subscribe(response => {
                            console.log(response);
                            this.selectedVariable = null;
                            this.onCancel();
                            //this.reloadVariables();
                        })
                }
            }
        }
    }

    onDelete(event) {

    }

    onCancel() {
        this.selectedVariable = null;
        this.router.navigate(['/home/variable-list']);        
        // this.variableName = '';
        // this.ownerId = '';
        // this.valueType = '';
        // this.variableType = '';
        // this.timeSegments.splice(0, this.timeSegments.length);
    }
}