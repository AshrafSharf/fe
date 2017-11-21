import { Project } from './../../shared/interfaces/project';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Branch } from './../../shared/interfaces/branch';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { BranchService } from '../../services/branch.service';
import { Moment } from 'moment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'branches',
    templateUrl: './branches.component.html',
    styleUrls: ['./branches.component.css']
})
export class BranchesComponent implements OnInit { 
    isLoading:Boolean = false;

    ownerId: String = 'owner';
    ownerName: String = 'owner';
    selectedProjectId = '';
    selectedProjectTitle = '';

    // time, hour, month
    startDate: Date;
    endDate: Date;
    actualsDate: Date;
    
    // week
    startWeek: String = '';
    endWeek: String = '';
    actualsWeek: String = '';

    selectedBranch:Branch = null;

    datePickerMode: String = 'month';

    title: String = "";
    description: String = "";
    timeUnit: String = 'Month';
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private branchService:BranchService,
        private projectService:ProjectService,
        public modal:Modal) {

        this.startDate = new Date();
        this.endDate = new Date();
        this.actualsDate = new Date();
    }
    
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'];
            this.selectedProjectTitle = params['title'];
            var branchId = params['id'];
            if (branchId == undefined) return;

            this.branchService
                .getDetails(branchId)
                .subscribe(result => {
                    this.selectedBranch = result.data as Branch;

                    this.title = this.selectedBranch.title;
                    this.description = this.selectedBranch.description;
                    this.ownerId = this.selectedBranch.ownerId;
                    this.ownerName = this.selectedBranch.ownerName;
                    this.startDate = new Date('' + this.selectedBranch.startTime);
                    this.endDate = new Date('' + this.selectedBranch.endTime);
                    this.actualsDate = new Date('' + this.selectedBranch.actualsTime);
                });
        });
    }

    onChangeTimeUnit() {
        if (this.timeUnit == 'Month') {
            this.datePickerMode = 'month';
        } else if (this.timeUnit == 'Hour' || this.timeUnit == 'Time') {
            this.datePickerMode = 'time';
        }
    }

    // clear inputs
    clearInputs() {
        this.title = "";
        this.description = "";
        this.selectedBranch = null;

        this.startDate = new Date();
        this.endDate = new Date();
        this.actualsDate = new Date();
        this.startWeek = '';
        this.endWeek = '';
        this.actualsWeek = '';
        this.datePickerMode = 'month';
        this.timeUnit = 'month';

        this.router.navigate(['branches-list']);
    }

    // create branch
    onSave() {
        if (this.title.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter branch name')
                .open();
        } else {
            if (this.selectedBranch != null) {
                // update existing
                this.branchService
                    .updateBranch(this.title, this.description, this.selectedProjectId, 
                        actuals, start, end, this.ownerId, this.timeUnit, this.selectedBranch.id)
                    .subscribe(result => {
                        console.log(result);
                        this.clearInputs();
                    });
            } else {

                var start = new Date(this.startDate).toDateString();
                var end = new Date(this.endDate).toDateString();
                var actuals = new Date(this.actualsDate).toDateString();

                // create new 
                this.branchService
                    .createBranch(this.title, this.description, this.selectedProjectId, 
                            actuals, start, end, this.ownerId, this.timeUnit)
                    .subscribe(result => {
                        this.clearInputs();
                    });
            }
        }
    }


}
