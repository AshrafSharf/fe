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
    breakdownDec ="";
    otherDec="";
    sigmaId = "";
    otherDecId = "";
    breakdownDecId = "";
    commaCheck:boolean;
    commaCheckId ="";

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
                        this.sigmaId = setting.id.toString();
                    }
                    else if (setting.key == "VARIABLE_DECIMAL"){
                        this.otherDec = setting.value.toString();
                        this.otherDecId = setting.id.toString();
                    }
                    else if (setting.key == "BREAKDOWN_DECIMAL"){
                        this.breakdownDec = setting.value.toString();
                        this.breakdownDecId = setting.id.toString();
                    }
                    else if (setting.key == "COMMA_CHECK"){
                        var value = setting.value;
                        this.commaCheckId = setting.id.toString();
                        this.commaCheck = (value == "true" ? true : false);
                    }
                });
            });
    }

    onSave() {
        this.settingsService
        .updateSettings([{id:this.otherDecId, key: "VARIABLE_DECIMAL", value:this.otherDec},
                        {id:this.sigmaId, key: "SIGMA", value:this.sigma},
                        {id:this.breakdownDecId, key:"BREAKDOWN_DECIMAL", value:this.breakdownDec},
                    {id:this.commaCheckId,key:"COMMA_CHECK", value:this.commaCheck}])
        .subscribe(result => {
            console.log("settings updated");
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
                var projectId = projects[i].id;
                this.branchService.getBranches(projectId)
                .subscribe(result => {
                    var branches = result.data as Array<Branch>;
                    for (var i = 0; i < branches.length; i++){
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