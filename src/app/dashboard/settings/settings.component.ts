import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import {Router, ActivatedRoute} from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { ProjectService } from '../../services/project.service';
import { AppVariableService } from './../../services/variable.services';
import {Project} from  './../../shared/interfaces/project';
import { Branch } from './../../shared/interfaces/branch';


@Component({
    selector: 'app-configuration',
    templateUrl: 'settings.component.html',
    styleUrls: [
        'settings.component.css'
    ]
})

export class SettingsComponent implements OnInit {
    sigma = "";

    constructor(
        private settingsService:SettingsService,
        private branchService: BranchService,
        private projectService: ProjectService,
        private route: ActivatedRoute,
        private variableService: AppVariableService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.settingsService
            .getSettings()
            .subscribe(settings => {
                let data = settings.data as {id:String, key:String, value:String}[];
                data.forEach(setting => {
                    if (setting.key == "SIGMA") {
                        this.sigma = setting.value.toString();
                    }
                });
            });
    }

    onSave() {
        this.settingsService
            .saveSettings([{key: 'SIGMA', value:this.sigma}])
            .subscribe(result => {
                console.log("settings saved")
                this.recalculateEveryBranch();
                this.router.navigate(['/home/variable-list']);
            });
    }

    onCancel(){
        this.router.navigate(['/home/variable-list']);
    }

    //recalculate every branch in every project
    recalculateEveryBranch(){
         this.projectService.getProjects()
        .subscribe( result => {
            var projects = result.data as Array<Project>;
            for (var i=0; i< projects.length; i++){
                console.log(projects[i].title);
                var projectId = projects[i].id;
                this.branchService.getBranches(projectId)
                .subscribe(result => {
                    var branches = result.data as Array<Branch>;
                    for (var i = 0; i < branches.length; i++){
                        console.log(branches[i].title);
                        var branchId = branches[i].id;
                        this.variableService.calculateVariableValues(branchId)
                        .subscribe( result =>{
                          
                        });
                    }
                });
            }
        
        });
    } 
}