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

@Component({
    selector: 'variables',
    templateUrl: './variables.component.html',
    styleUrls: ['./variables.component.css']
})

export class VariablesComponent implements OnInit {
    @ViewChildren(TimeSegmentComponent) timeSegmentWidgets:TimeSegmentComponent[];

    branchId = '';
    projectId = '';

    variables = [];
    users: User[] = Array<User>();

    variableName = '';
    valueType = 'integer';
    variableType = 'actual';
    ownerId: String = '';

    timeSegments = [];

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
        });
    }

    addTimeSegment() {
        this.timeSegments.push({});
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

                this.variableService
                    .createVariable(body)
                    .subscribe(response => {
                        console.log(response);
                        this.router.navigate(['/home/variable-list']);
                    })
            }
        }
    }

    onDelete(event) {

    }

    onCancel() {
        this.router.navigate(['/home/variable-list']);        
    }
}