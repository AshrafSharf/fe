import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { User } from '../../shared/interfaces/user';
import { Role } from '../../shared/interfaces/role';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/roles.service';
import { Utils } from '../../shared/utils';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

    name:String = '';
    password:String = '';
    projectId:String = '';
    branchId:String = '';
    roleId:String = '';
    roles: Role[] = Array<Role>();

    selectedUser: User = null;
    createdUser: User = null;

    constructor(private route:ActivatedRoute,
                private router:Router,
                private modal:Modal,
                private userService:UserService,
                private roleService:RoleService) {
    }

    ngOnInit(): void {
        this.route
            .queryParams
            .subscribe(params => {
                var id = params["id"];
                if (id == undefined) return;

                this.userService
                    .getDetails(id)
                    .subscribe(result => {
                        this.selectedUser = result.data as User;
                        this.name = this.selectedUser.userName;
                        this.password = this.selectedUser.password;
                        this.projectId = this.selectedUser.projectId;
                        this.branchId = this.selectedUser.branchId;
                        this.roleId = this.selectedUser.roleId;
                    });
            });

        this.roleService.getRoles().subscribe(result => {
            if (result.status = 'OK') {
                this.roles = result.data as Array<Role>;
                if (this.selectedUser == null) {
                     this.roleId = this.roles[0].id;
                }
            }
        });

    }

    // create user
    onSave() {
        if (this.name.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter a username')
                .open();
        }
        else if (this.password.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter a password')
                .open();
        } else {
            if (this.selectedUser != null) {
                // update existing
                this.userService
                    .updateUser(this.selectedUser.id, this.name, this.password, this.roleId, this.projectId, this.branchId)
                    .subscribe(result => {
                        console.log('result', result);
                        if (result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                                .title("Warning")
                                .body("Failed to update user called \"" + this.name +
                                    "\". This name is already associated with another user")
                                .open();
                        } else {
                            this.clearInputs();
                        }
                    });
            } else {
                // create new
                this.userService
                    .createUser(this.name, this.password, this.roleId)
                    .subscribe(result => {
                        console.log('result',result);

                        if (result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                                .title("Warning")
                                .body("Failed to create user called \"" + this.name +
                                    "\". This name is already associated with another user")
                                .open();
                        } else {
                            this.userService.getUserByName(this.name)
                                .subscribe(result =>{
                                    console.log('result', result);
                                    this.createdUser = result.data as User
                                    this.clearInputs();
                                });
                        }
                    });
            }
        }
    }

    // clear inputs
    clearInputs() {
        this.name = '';
        this.password = '';
        this.projectId = '';
        this.branchId = '';
        this.roleId = '';

        if (this.selectedUser == null) {
            this.router.navigate(['/home/settings']);
        }
        else {
            this.selectedUser = null;
            sessionStorage.removeItem('user_auth_status');
            this.router.navigate(['login']);
        }
    }

    cancel() {
        this.name = '';
        this.password = '';
        this.projectId = '';
        this.branchId = '';
        this.roleId = '';
        this.selectedUser = null;

        this.router.navigate(['/home/settings']);
    }
}