import {Router, ActivatedRoute} from '@angular/router';
import {Project} from './../../shared/interfaces/project';
import {TimeSegmentComponent} from './../variables/time-segment/time.segment.component';
import {Component, OnInit} from '@angular/core';
import {Overlay} from 'ngx-modialog';
import {Modal} from 'ngx-modialog/plugins/bootstrap';
import {ProjectService} from '../../services/project.service';
import {User} from '../../shared/interfaces/user';
import {UserService} from '../../services/user.service';
import {Utils} from '../../shared/utils';
import {UserGroup} from '../../shared/interfaces/user-group';
import {UserGroupService} from '../../services/usergroup.service';


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
  searchName: String = '';
  usersWithAccess: User[] = Array<User>();
  exludedUsergroups: UserGroup[] = Array<UserGroup>();
  privateProject: Boolean = false;
  usergroupaccess: UserGroup[] = Array<UserGroup>();
  isPrivate: Boolean = false;
  isOwner: Boolean = false;
  loggedInUser: String = '';
  projects: Project[] = Array<Project>();




  selectedProject: Project = null;
  createdProject: Project = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modal: Modal,
    private userService: UserService,
    private projectService: ProjectService,
    private usergroupService: UserGroupService) {
  }

  ngOnInit(): void {

    this.loggedInUser = Utils.getUserId();

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
            this.isPrivate = this.selectedProject.isPrivate;
            this.usersWithAccess = this.selectedProject.usersWithAccess;

          });
      });
    this.privateProject = this.isPrivate

    this.userService
      .getOwners((users => {
        this.users = users;
        if (this.ownerId == "") {
          this.ownerId = Utils.getUserId();
        }
        if (this.ownerId !== "" && this.ownerId == Utils.getUserId()) {
          this.isOwner = true;
        }
        else if (this.ownerId == "") {
          this.isOwner = true;
        }
      }));


    let roles = [];
    this.usergroupService
      .getUserGroup().subscribe(result => {
        let usergroupData = result.data;
        usergroupData.forEach(role => {
          this.exludedUsergroups.push(role);
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
    else if (this.title.match(/[^0-9a-zA-Z_-]/)) {
      this.modal.alert()
        .title('Warning')
        .body('Names can only include Alphanumerical characters, underscores and hyphens')
        .open();

    } else if (this.ownerId.length == 0) {
      this.modal.alert()
        .title('Warning')
        .body('Please select project owner')
        .open();
    } else {
      if (this.selectedProject != null) {
        // update existing
        this.projectService
          .updateProject(this.selectedProject.id, this.title, this.description, this.ownerId, this.isPrivate, this.usersWithAccess)
          .subscribe(result => {
            console.log('result', result);
            if (result.status == "UNPROCESSABLE_ENTITY") {
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
          .createProject(this.title, this.description, this.ownerId, this.ownerName, this.isPrivate, this.usersWithAccess)
          .subscribe(result => {
            console.log('result', result);

            if (result.status == "UNPROCESSABLE_ENTITY") {
              this.modal.alert()
                .title("Warning")
                .body("Failed to create project called \"" + this.title +
                "\". This name is already associated with another project")
                .open();
            } else {
              this.projectService.getProjectByName(this.title)
                .subscribe(result => {
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
    if (this.createdProject != null) {
      Utils.selectProject(this.createdProject.id);
      this.router.navigate(['/home/branches-list'], {
        queryParams: {
          projectId: this.createdProject.id
        }
      });
    } else {
      this.router.navigate(['/home/project-list']);
    }
  }

  isPrivateProject(event) {
    this.privateProject = event.target.checked;
    if (this.privateProject == true) {
      if (this.isOwner) {
        this.users.forEach(user => {
          if (user.id == this.ownerId && this.usersWithAccess.length == 0) {
            this.usersWithAccess.push(user);
          }
        });
      }
    }
    else if (!this.isOwner) {
      this.usersWithAccess.splice(0, this.usersWithAccess.length);
    }
  }

  hasAccess(user) {
    for (var index = 0; index < this.usersWithAccess.length; index++) {
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
    if (this.usersWithAccess.length == 1) {
      this.isPrivate = false;
      this.privateProject = false;
    }

  }

  setUsergroupRole(event, value) {
    var access = event.target.checked;
    //if (access == true) {
    this.usergroupaccess.push(value);
    //}
    // else {
    // var position = this.usergroupaccess.findIndex(accessUser => accessUser.id == value.id);

    // this.usergroupaccess.splice(0, 1);

    //}
  }

  filterResult(event, type) {
    this.filteredUsers.splice(0, this.filteredUsers.length);

    for (var index = 0; index < this.users.length; index++) {
      var usr = this.users[index];
      if (usr.userName.toLowerCase().indexOf(this.searchName.toLowerCase()) >= 0) {

        if (this.shouldSkipUser(usr) == true) {
          continue;
        }
        this.filteredUsers.push(usr);
      }
    }
  }

  shouldSkipUser(usr): Boolean {
    if (usr.id == this.ownerId) {
      return true;
    }

    return false;
  }

  onAdd() {

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
    else if (this.title.match(/[^0-9a-zA-Z_-]/)) {
      this.modal.alert()
        .title('Warning')
        .body('Names can only include Alphanumerical characters, underscores and hyphens')
        .open();

    } else if (this.ownerId.length == 0) {
      this.modal.alert()
        .title('Warning')
        .body('Please select project owner')
        .open();
    }

    else {
      if (this.usersWithAccess.length > 0) {
        if (this.usergroupaccess.length > 0) {
          this.isPrivate = true;
          this.privateProject = true;
          if (this.privateProject) {
            this.usersWithAccess.forEach(user => {
              user.usergroupId = this.usergroupaccess[0].id;
            });
            //            if (this.isOwner) {
            //              this.users.forEach(user => {
            //                if (user.id == this.ownerId) {
            //                  this.usersWithAccess.push(user);
            //
            //                }
            //              });
            //            }
          }

        }
        else {

          this.modal.alert()
            .title("Warning")
            .body("no access defined\" " + this.title +
            "\". please select an access")
            .open();
        }
      }

      else {

        this.modal.alert()
          .title("Warning")
          .body("no username defined\" " + this.title +
          "\". please select a username")
          .open();
      }

    }
  }

}
