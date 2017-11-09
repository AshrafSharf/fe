import { Project } from './../../shared/interfaces/project';
import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'variables',
    templateUrl: './variables.component.html',
    styleUrls: ['./variables.component.css']
})

export class VariablesComponent implements OnInit {
    projects:Project[] = Array<Project>();
    
    variables =  [{
        "id": "5a01a1396d98d91f588b29f8",
        "branchId": "5a007eaccc7a554883c7d959",
        "title": "Uverse_Platform_Accounts",
        "ownerId": "sm935j",
        "type": "Integer",
        "timeSegment": [{
                "startTime": "1/1/2018/00:00:00 PST",
                "inputMethod": "Constant",
                "constantValue": "5000",
                "distribution": "None"
            }, 
            {
                "startTime": "1/1/2018/00:00:00 PST",
                "inputMethod": "Table",
                "variableInput": [{
                    "name": "Jan-18",
                    "value": "5000"
                }, {
                    "name": "Feb-18",
                    "value": "6000"
                }, {
                    "name": "Mar-18",
                    "value": "7000"
                }]
            }
        ]
    }, 
    {
        "id": "5a01a4cf6d98d91f588b29f9",
        "branchId": "5a007eaccc7a554883c7d959",
        "title": "Users_with_cDVR_service",
        "ownerId": "sm935j",
        "type": "Real",
        "timeSegment": [{
            "startTime": "1/1/2018/00:00:00 PST",
            "inputMethod": "Constant",
            "constantValue": "0.46",
            "distribution": "None"
        }]
    }];

    timeSegments = [];

    constructor() { }

    ngOnInit() { }

    addTimeSegment() {
        this.timeSegments.push({});
    }

    onDeleteSegment() {
        this.timeSegments.pop();
    }

    onDelete(event) {

    }
}