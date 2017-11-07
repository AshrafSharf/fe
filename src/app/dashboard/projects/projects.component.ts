import { Component } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: 'projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
export class ProjectsComponent  { 

    projects = [];

    constructor(public modal:Modal) {
        
    }

    onSubmit(projectInfo) {
        this.projects.push(projectInfo);
        
    }

    onDelete(event) {
        const dialog =
            this.modal
                .confirm()
                .size('lg')
                .isBlocking(true)
                .title('Confirmation')
                .body('Are you sure you want to delete this project?')
                .okBtn('Yes')
                .okBtnClass('btn btn-danger')
                .cancelBtn('No')
                .open();
        dialog.then(promise => {
            promise.result.then(result => {
                this.projects.forEach((item, index) => {
                    if (item.id == event.id) {
                        this.projects.splice(index, 1);
                    }
                });
            });
        });
    }
}