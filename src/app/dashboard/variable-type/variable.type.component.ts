import { AppVariableTypeService } from './../../services/variable.type.service';
import { Component, OnInit } from '@angular/core';
import { Subvariable, VariableComponentBehavior, ValidationResult, TimeSegment } from '../../shared/interfaces/variables';
import { UserService } from '../../services/user.service';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'variable-type',
    templateUrl: 'variable.type.component.html',
    styleUrls: ['variable.type.component.css']
})

export class VariableTypeComponent implements OnInit {
    selectedVarType;
    title:String = '';
    type:String = 'breakdown';
    description:String = '';

    subvariableName:string = '';
    subvariableValue:string = '';

    subvariableList: Subvariable[];
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modal:ModalDialogService, 
        private userService: UserService,
        private variableTypeService: AppVariableTypeService) { }

    ngOnInit() { 
        this.route
        .queryParams
        .subscribe(params => {
            var id = params["id"];
            if (id == undefined) return;
            
            // this.variableTypeService
            //     .getDetails(id)
            //     .subscribe(result => {
            //         this.selectedProject = result.data as Project;
            //         this.title = this.selectedProject.title;
            //         this.description = this.selectedProject.description;
            //         this.owner = this.selectedProject.ownerId;
            //     });
        });

    }

    addVariable() {
        if (this.subvariableList == undefined) {
            this.subvariableList = [];
        } else {
            for (var index = 0; index < this.subvariableList.length; index++) {
                if (this.subvariableList[index].name == this.subvariableName) {
                    return;
                }
            }
        }

        this.subvariableList.push({name: this.subvariableName, value: this.subvariableValue, percentageTime: '0'});
        this.subvariableName = '';
        this.subvariableValue = '';
    }

    deleteVariable(s) {
        for (var index = 0; index < this.subvariableList.length; index++) {
            if (this.subvariableList[index].name == s.name) {
                this.subvariableList.splice(index, 1);
                break;
            }
        }
    }

    onSave() {
        if (this.title.length == 0) {
            this.modal.showError("Please add title");
            return;
        } else if (this.type == 'breakdown') {
            if (this.subvariableList == undefined || this.subvariableList.length == 0) {
                this.modal.showError("At least one subvariable is required");
                return;
            } else {
                let finalValue = 0;
                this.subvariableList.forEach((variable) => {
                    finalValue += parseFloat(variable.value.toString());
                });
                if (finalValue != 1.0) {
                    this.modal.showError('The addition of values must be equal to 1.0');
                    return;
                }
            }
        } 

        let body = {
            title: this.title,
            type: this.type,
            subVariables: this.subvariableList
        };

        this.variableTypeService
            .createType(body)
            .subscribe(response => {
                this.clearInputs();
            })

    }

    clearInputs() {
        this.title = '';
        this.description = '';
        this.type = 'breakdown';
        
        this.router.navigate(['/home/variable-type-list']);

    }

}