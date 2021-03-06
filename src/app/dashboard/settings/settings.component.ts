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
import { Utils } from '../../shared/utils';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

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
    userName:String;

    constructor(
        private settingsService:SettingsService,
        private branchService: BranchService,
        private projectService: ProjectService,
        private route: ActivatedRoute,
        private variableService: AppVariableService,
        private roleService: RoleService,
        private userService: UserService,
        private router: Router,
        private modalDialog: Modal
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
                    this.userName = userData.userName;
                    this.roles.forEach(role => {
                        if (userData.roleId == role.id) {
                            this.userRole = role.roleName;
                        }
                    });

                }
            });
        });

        this.getUsers();

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

    getUsers() {
        // get all users
        this.users.splice(0, this.users.length);
        this.userService.getUsers().subscribe(result => {
            if (result.status == "OK") {
                this.users = result.data;
            }
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

        if (this.userRole == "Admin") {
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
    
    createUser(){
        this.router.navigate(['/home/users']);
    }

    editUser(){
        this.router.navigate(['home/users'], { queryParams: {
            id: Utils.getUserId()
        }});
    }

    deleteUser(user){
        const dialog = this.modalDialog
            .confirm()
            .title("Confirmation")
            .body("Are you sure you want to delete this user")
            .okBtn("Yes").okBtnClass("btn btn-danger")
            .cancelBtn("No")
            .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.userService.deleteUser(user.id).subscribe(result => {
                    if (result.status == "OK") {
                        console.log('"'+user.userName+'" deleted');

                        if (user.userName == this.userName) {
                            sessionStorage.removeItem('user_auth_status');
                            this.router.navigate(['login']);
                        }
                        else {
                            this.getUsers();
                        }
                    }
                });
            });
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