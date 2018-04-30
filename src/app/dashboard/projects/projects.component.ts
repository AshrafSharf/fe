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
import { UserGroup } from '../../shared/interfaces/user-group';
import { UserGroupService } from '../../services/usergroup.service';


@Component({
    selector: 'projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

    title: String = '';
    description: String = '';
    ownerId: String = '';
    ownerName: String = '';
    users: User[] = Array<User>();
  //newly added
    filteredUsers: User[] = new Array<User>();
    private exludedUsers: String[] = new Array<String>();
    searchName: String = '';
    usersWithAccess: User[] = Array<User>();
    privateProject: Boolean = false;
    nameId: String = '';  
    usergroup: UserGroup[] = Array<UserGroup>();  
    groups: Array<{id: number, text: string}> = [   
                {id: 1, text: 'Admin'},
                {id: 2, text: 'Read Branch'},
                {id: 3, text: 'Create Branch'},
                {id: 4, text: 'Delete Branch'},
                {id: 5, text: 'Read Model'},
                ];
    isOwner:Boolean = false;


    selectedProject: Project = null;
    createdProject: Project = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modal:Modal,
        private userService: UserService,
        private projectService: ProjectService,
        private usergroupService: UserGroupService) {
    }

    ngOnInit(): void {
        this.route
            .queryParams
            .subscribe(params => {
                var id = params["id"];
                if (id == undefined) return;

                this.projectService
                    .getDetails(id)
                    .subscribe(result => {
                        this.selectedProject = result.data as Project;
                        this.title = this.selectedProject.title;
                        this.description = this.selectedProject.description;
                        this.ownerId = this.selectedProject.ownerId;
                    });
            });

        this.userService
            .getOwners((users => {
                this.users = users;
                if (this.ownerId == "") {
                    this.ownerId = Utils.getUserId();
                }
               if (this.ownerId !== "" && this.ownerId == Utils.getUserId()) {
                    this.isOwner = true;
               }
              else if (this.ownerId == "")
                 {
                this.isOwner = true;
               }
            }));
        
       
          let roles = [];
          this.usergroupService
          .getUserGroup().subscribe(result => {
            let usergroupData = result.data;
            usergroupData.forEach(role => {
                this.usergroup.push(role);
            });
      
    });
  }

    // create project
    onSave() {
        this.users.forEach(user => {
            if (user.id == this.ownerId) {
                this.ownerName = user.userName;
            }
        });

        if (this.title.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please enter project name')
                .open();
        }
        //if the title has special characters
        else if (this.title.match(/[^0-9a-zA-Z_-]/)){
              this.modal.alert()
              .title('Warning')
              .body('Names can only include Alphanumerical characters, underscores and hyphens')
              .open();

        }else if (this.ownerId.length == 0) {
            this.modal.alert()
                .title('Warning')
                .body('Please select project owner')
                .open();
        } else {
            if (this.selectedProject != null) {
                // update existing
                this.projectService
                    .updateProject(this.selectedProject.id, this.title, this.description, this.ownerId)
                    .subscribe(result => {
                        console.log('result', result);
                        if (result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                              .title("Warning")
                              .body("Failed to update project called \"" + this.title +
                                    "\". This name is already associated with another project")
                              .open();
                        } else {
                            this.clearInputs();
                        }
                    });
            } else {
                // create new
                this.projectService
                    .createProject(this.title, this.description, this.ownerId, this.ownerName)
                    .subscribe(result => {
                        console.log('result',result);

                        if (result.status == "UNPROCESSABLE_ENTITY"){
                            this.modal.alert()
                              .title("Warning")
                              .body("Failed to create project called \"" + this.title +
                                    "\". This name is already associated with another project")
                              .open();
                        } else {
                          this.projectService.getProjectByName(this.title)
                          .subscribe(result =>{
                                console.log('result', result);
                                this.createdProject = result.data as Project
                                this.clearInputs();
                          }); 
                        }
                    });
            }
        }
    }

    // clear inputs
    clearInputs() {
        this.title = '';
        this.description = '';
        this.ownerId = '';
        this.selectedProject = null;
         if (this.createdProject != null){
             Utils.selectProject(this.createdProject.id);
            this.router.navigate(['/home/branches-list'], { queryParams: {
                projectId: this.createdProject.id
            }});
        } else{
              this.router.navigate(['/home/project-list']);
        }
    }
  
   defineAccess(event) {
        this.privateProject = event.target.checked;
        if (this.privateProject == true) {
            if (this.isOwner) {
                this.users.forEach(user => {
                    if (user.id == this.ownerId) {
                        this.usersWithAccess.push(user);
                    }
                });
            }
        }
        else {
            this.usersWithAccess.splice(0, this.usersWithAccess.length);
        }
    }
  
      hasAccess(user) {
        for(var index = 0; index < this.usersWithAccess.length; index ++) {
            if (this.usersWithAccess[index].id == user.id) {
                return true;
            }
        }
    }

    setAccess(event, user) {
        var access = event.target.checked;
        if (access == true) {
            this.usersWithAccess.push(user);
        }
        else {
            var position = this.usersWithAccess.findIndex(accessUser => accessUser.id == user.id);

            this.usersWithAccess.splice(position, 1);

        }

    }
    filterResult(event, type) {
    this.filteredUsers.splice(0, this.filteredUsers.length);

    for (var index = 0; index < this.users.length; index++) {
      var usr = this.users[index];
      if (usr.userName.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0) 
      {

        if (this.shouldSkipUser(usr) == true) {
          continue;
        }

        this.filteredUsers.push(usr);
      }
    }
  }
    shouldSkipUser(usr): Boolean {
    if (usr == this.isOwner)  {
      return true;
    }

    return false;
  }
    excludeUser(event) {
    if (event.target.checked == false) {
      this.exludedUsers.push(event.target.value);
    } else {
      for (var index = 0; index < this.exludedUsers.length; index++) {
        if (this.exludedUsers[index] == event.target.value) {
          this.exludedUsers.splice(index, 1);
          break;
        }
      }
    }
  }
  selectName(event, type)
{
//this.nameId = this.role.id;
        //this.usergroup.splice(0, this.usergroup.length);
    
    for (var index = 0; index < this.usergroup.length; index++) {
       this.nameId  = this.usergroup[index].id;
//     if (access.userGroupName.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0) 
//      {
//
//        if (this.shouldSkipUser(usr) == true) {
//          continue;
//        }
//
//        this.filteredUsers.push(usr);
//      }
    }

}  
  
 isPrivateVariable(event) {
   alert(this.nameId);

 }
}
