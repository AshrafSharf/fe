import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { ProjectService } from '../../services/project.service';
import { AppVariableService } from './../../services/variable.services';
import { Project } from  './../../shared/interfaces/project';
import { Branch } from './../../shared/interfaces/branch';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/roles.service';


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
    showLocalCheck:boolean;
    pointToLocalhost:boolean;
    userRole:String;
    private users = [];
    private roles = [];
    checked = true;

    constructor(
        private settingsService:SettingsService,
        private branchService: BranchService,
        private projectService: ProjectService,
        private route: ActivatedRoute,
        private variableService: AppVariableService,
        private roleService: RoleService,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit() {
        // get all defined roles
        this.roleService.getRoles().subscribe(result => {
            let roleData = result.data;
            roleData.forEach(role => {
                this.roles.push(role);
            });

            // get the currently logged in user
            this.userService.getLoggedInUser().subscribe(result => {
                if (result.status == "OK") {
                    let userData = result.data;
                    this.roles.forEach(user => {
                        if (userData.roleId == user.id) {
                            this.userRole = user.roleName;
                        }
                    });

                }
            });
        });

        // get all users
        this.userService.getUsers().subscribe(result => {
            if (result.status == "OK") {
                this.users = result.data;
            }
        });

        this.showLocalCheck = this.settingsService.getLocal();
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

    setRoles(user, role) {
        for(var index = 0; index < this.users.length; index ++) {
            if (this.users[index].userName == user.userName) {
                this.users[index].roleId = role.id;
            }
        }
    }
    
    isChecked(user, role) {
        for(var index = 0; index < this.users.length; index ++) {
            if (this.users[index].userName == user.userName) {
                if (user.roleId == role.id) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
    
    onSave() {
        if (this.pointToLocalhost != null) {
            this.settingsService.setToLocal(this.pointToLocalhost);
        }

        if (this.userRole == "admin") {
            this.users.forEach(user => {
                this.userService
                    .updateUser(user.id, user.userName, user.password, user.roleId, user.projectId, user.branchId)
                    .subscribe(result => {
                        console.log("users updated");
                    });
            });
        }

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