import { AppVariableTypeService } from './../../services/variable.type.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppVariableService } from './../../services/variable.services';
import { UserService } from './../../services/user.service';
import { Project } from './../../shared/interfaces/project';
import { Component, OnInit, ViewChildren, ElementRef, NgZone, ViewChild } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Branch } from './../../shared/interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { User } from '../../shared/interfaces/user';
import { TimeSegmentComponent } from './time-segment/time.segment.component';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { Variable, TimeSegment, VariableType, Subvariable } from '../../shared/interfaces/variables';
import { Moment, unix } from 'moment';

import {
    D3Service,
    D3,
    Axis,
    BrushBehavior,
    BrushSelection,
    D3BrushEvent,
    ScaleLinear,
    ScaleOrdinal,
    Selection,
    Transition
} from 'd3-ng2-service';
import { Utils } from '../../shared/utils';
  
@Component({
    selector: 'variables',
    templateUrl: './variables.component.html',
    styleUrls: ['./variables.component.css']
})

export class VariablesComponent implements OnInit {
    @ViewChildren(TimeSegmentComponent) timeSegmentWidgets:TimeSegmentComponent[];

    projects:Project[] = Array<Project>();
    branches:Branch[] = Array<Branch>();
    variables: Variable[] = Array<Variable>();

    public lineChartData:Array<any> = [];
    public lineChartLabels:Array<any> = [];
    public lineChartOptions:any = {
        responsive: true
    };

    public lineChartColors:Array<any> = [];
    public lineChartLegend:boolean = true;
    public lineChartType:string = 'line';

    compositeVariableList:Variable[] = Array<Variable>();

    compositType = 'none';
    description = '';
    branchId = '';
    projectId = '';

    @ViewChild('graph') svg;
    @ViewChild('linegraph') graph;

    selectedProject: String = '';
    selectedBranch: String = '';
    selectedVariable: Variable = null

    users: User[] = Array<User>();

    variableName = '';
    valueType = 'integer';
    variableType = 'actual';
    ownerId: String = '';

    variableTypeList: Subvariable[] = Array<Subvariable>();
    selectedVariableTypeList: VariableType[] = Array<VariableType>();
    
    subvariableName:string = '';
    subvariableValue:string = '';
    subvariablePercentage:string = '';

    subvariableList: Subvariable[];
    compositVariableIds: {id:String}[] = Array<{id:String}>();
    

    private d3: D3;
    private parentNativeElement: any;
    private d3Svg: Selection<SVGSVGElement, any, null, undefined>;  

    timeSegments: TimeSegment[] = Array<TimeSegment>();

    editSubvariableIndex = -1;
    myDataSets = null;


    clearVariable() {
        this.editSubvariableIndex = -1;
        this.subvariableName = '';
        this.subvariableValue = '';
        this.subvariablePercentage = '';
    }

    editVariable(index) {
        console.log('edit : ', index);

        this.editSubvariableIndex = index;
        this.subvariableName = this.subvariableList[index].name.toString();
        this.subvariableValue = this.subvariableList[index].value.toString();
        if (this.valueType == 'discrete') {
            this.subvariablePercentage = this.subvariableList[index].percentageTime.toString();
        }
    }

    addVariable() {
        if (this.subvariableList == undefined) {
            this.subvariableList = [];
        }

        if (this.editSubvariableIndex != -1) {
            console.log('editing');
            // // edit variable
            // for (var index = 0; index < this.subvariableList.length; index++) {
            //     if (this.subvariableList[index].name == this.subvariableName) {
            //         return;
            //     }
            // }

            this.subvariableList[this.editSubvariableIndex].name = this.subvariableName;
            this.subvariableList[this.editSubvariableIndex].value = this.subvariableValue;
            if (this.valueType == 'discrete') {        
                this.subvariableList[this.editSubvariableIndex].percentageTime = this.subvariablePercentage;
            }
        } else {
            console.log('adding');
            // add new 
            for (var index = 0; index < this.subvariableList.length; index++) {
                if (this.subvariableList[index].name == this.subvariableName) {
                    return;
                }
            }

            this.subvariableList.push({
                name: this.subvariableName, 
                value: this.subvariableValue, 
                percentageTime: this.subvariablePercentage
            });
        }

        this.clearVariable();        
    }

    deleteVariable(s) {
        for (var index = 0; index < this.subvariableList.length; index++) {
            if (this.subvariableList[index].name == s.name) {
                this.subvariableList.splice(index, 1);
                break;
            }
        }
    }
    
    formatXAxisValue(colIndex: number) {
        if (this.selectedVariable || this.selectedVariable == undefined) {
            return '';
        }

        if (this.selectedVariable.timeSegment.length > 0) {
            var element = this.selectedVariable.timeSegment[0];
            if (element.timeSegmentResponse != null || element.timeSegmentResponse != undefined) {
                if (element.timeSegmentResponse.resultMap.length > 0) {
                    var value = element.timeSegmentResponse.resultMap[0];

                    if (value.data.length > 0) {
                        console.log(value.data);
                        return value.data[colIndex].title;
                    }
                }
            } 
        }
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private variableService: AppVariableService,
        private variableTypeService: AppVariableTypeService,
        private modal: ModalDialogService,
        private userService: UserService,
        private projectService:ProjectService,
        private branchService:BranchService,
        element: ElementRef, 
        private ngZone: NgZone, 
        d3Service: D3Service) {

        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
    }

    isTypeSelected(id) {
        for (var index = 0; index < this.compositeVariableList.length; index++) {
            if (this.compositeVariableList[index].id == id) {
                return this.compositeVariableList[index];
            }
        }        

        return null;
    }

    onVariableTypeSelectionChange(event) {
        let id = event.target.value;
        let status = event.target.checked;

        for (var index = 0; index < this.compositeVariableList.length; index++) {
            if (this.compositeVariableList[index].id == id) {
                this.compositeVariableList[index].isSelected = status;
                break;
            }
        }
    }

    ngOnInit() {
        this.userService
            .getOwners((users) => {
                this.users = users;
                this.ownerId = (this.users.length > 0) ? Utils.getUserId() : '';
            })

        this.route.queryParams.subscribe(params => {
            console.log(params);
            this.projectId = params['projectId'];
            this.branchId = params['branchId'];
            var varId = params['variableId'];
            
            this.variableService
                .getVariables(this.branchId)
                .subscribe(response => {
                    console.log(response);
                    var variables = response.data as Array<Variable>;
                    for (var index = 0; index < variables.length; index++) {
                        var variable = variables[index];
                        if (variable.id == varId) {
                            this.selectVariable(variable);
                            break;
                        }
                    }
                })
        });
    }

    onCompositTypeChanged(event) {
        let type = event.target.value;
        if (type != 'none') {
            this.loadCompositeVariables(type);
        }
    }

    loadCompositeVariables(type) {
        this.variableService
            .getBreakdownVariables(this.branchId, type)
            .subscribe(response => {
                if (response.status == 'OK') {
                    this.variableTypeList.splice(0, this.variableTypeList.length);
                    let types:Variable[] = response.data as Array<Variable>;
                    for (var index = 0; index < types.length; index++) {
                        let varType = types[index];
                        if (this.isCompositeVariableSelectedInVariable(varType.id.toString()) != null) {
                            varType.isSelected = true;
                        }
                        this.compositeVariableList.push(varType);
                    }
                }
            });
    }

    isCompositeVariableSelectedInVariable(id) {
        for (var index = 0; index < this.compositVariableIds.length; index++) {
            if (this.compositVariableIds[index].id == id) {
                return this.compositVariableIds[index];
            }
        }

        return null;
    }

    createLineChartData() {
        
        var values = [];
        if (this.selectedVariable.timeSegment.length > 0) {
            var element = this.selectedVariable.timeSegment[0];
            if (element.timeSegmentResponse != null || element.timeSegmentResponse != undefined) {
                if (element.timeSegmentResponse.resultMap.length > 0) {
                    var value = element.timeSegmentResponse.resultMap[0];

                    if (value.data.length > 0) {
                        var index = 0;
                        value.data.forEach(tmpValue => {
                            values.push({x: index, y: tmpValue.value})
                            index += 1; 
                        });
                    }

                    console.log("====values====");
                    console.log(values);
                    
                    this.myDataSets = [{
                        name: 'Forecast Values',
                        points: values
                    }];
                }
            } 
        }

    }

    addTimeSegment() {
        this.timeSegments.push({
            constantValue: 0,
            description: '',
            inputMethod: 'constant',
            distributionType: 'none',
            growth: 0,
            tableInput: null,
            mean: '',
            startTime: '',
            stdDeviation: '',
            timeSegmentResponse: {
                resultMap: Array()
            },
            userSelectedParametrics: '',
            userSelectedParametricsStdDeviation: '',
            growthPeriod: 0,
            breakdownInput: [],
            completedWordsArray: [],
            subVariables: []
        });
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    selectVariable(variable:Variable) { 
        this.selectedVariable = variable;
        this.description = variable.description.toString();
        this.variableName = variable.title.toString();
        this.ownerId = variable.ownerId;
        this.valueType = variable.valueType.toString();
        this.variableType = variable.variableType.toString();
        this.subvariableList = variable.subVariables;
        this.compositVariableIds = variable.compositeVariables;
        this.timeSegments.splice(0, this.timeSegments.length);
        this.compositType = variable.compositeType.toString();

        if (this.compositType.length > 0) {
            this.loadCompositeVariables(this.compositType);
        }

        for (var timeSegmentIndex = 0; timeSegmentIndex < variable.timeSegment.length; timeSegmentIndex++) {
            let element = variable.timeSegment[timeSegmentIndex];

            this.timeSegments.push(element);
            if (element.timeSegmentResponse != undefined || element.timeSegmentResponse != null) {

                // get all the labels
                element.timeSegmentResponse.resultMap.forEach(resultMap => {
                    resultMap.data.forEach(dataPair => {
                        if (!this.isLabelAdded(dataPair.title)) {                            
                            this.lineChartLabels.push(dataPair.title);
                        }
                    });
                });

                var color = '';
                var shade = 0.1;

                // collect all the values
                for (var resultMapIndex = 0; resultMapIndex < element.timeSegmentResponse.resultMap.length; resultMapIndex++) {
                    let resultMap = element.timeSegmentResponse.resultMap[resultMapIndex];
                    if (resultMapIndex == 0) {
                        color = Utils.getRandomColor();
                        shade = 0;
                    }

                    let borderColor = resultMapIndex == 0 ? color : Utils.getShadeOfColor(color, shade)
                    this.lineChartColors.push({ borderColor: borderColor });
                    console.log("borderColor: " + resultMapIndex + ", " + resultMap.title, borderColor);
                    shade += 0.1;

                    var labelTitle = `Time Segment: ${timeSegmentIndex + 1} - ${resultMap.title}`;
                    var dataValues = [];

                    let labelPosition = 0;
                    let lastValue:Number = 0;
                    
                    for (var dataIndex = 0; dataIndex < resultMap.data.length; dataIndex++) {
                        let dataPair = resultMap.data[dataIndex];

                        for (var index = labelPosition; index < this.lineChartLabels.length; index++) {
                            let label = this.lineChartLabels[index];
                            if (label == dataPair.title) {
                                dataValues.push(dataPair.value.toFixed(2));
                                labelPosition = index + 1;
                                if (index == this.lineChartLabels.length - 1) {
                                    console.log("adding new entry");

                                    // add the last value from next timesegment
                                    let tempElement = variable.timeSegment[timeSegmentIndex + 1];
                                    if (tempElement != undefined) {
                                        let resultMapTemp = tempElement.timeSegmentResponse.resultMap[0];
                                        console.log("resultMapTemp", resultMapTemp);
                                        if (resultMapTemp != undefined) {
                                            let entry = resultMapTemp.data[0];
                                            dataValues.push(entry.value.toFixed(2));
                                        }
                                    }
                                }
                                break;
                            } else {
                                dataValues.push(undefined);
                            }
                        }
                    }

                    this.lineChartData.push({
                        data: dataValues,
                        label: labelTitle
                    });
                }
            }
        }
    }

    isLabelAdded(title):Boolean {
        
        let result: Boolean = false;
        for (var index = 0; index < this.lineChartLabels.length; index++) {
            if (this.lineChartLabels[index] == title) {
                result = true;
                break;
            }
        }

        return result;
    }

    reloadProjects() {
        this.selectedVariable = null;
        this.variables.splice(0, this.variables.length);

        this.projectService
            .getProjects()
            .subscribe(result => {
                if (result.status == "OK") {
                    this.projects = result.data;
                    this.selectedProject = '';
                    if (this.projects.length > 0) {
                        this.selectedProject = this.projects[0].id;
                    }
                    this.reloadBranches();
                }
            });
    }

    reloadBranches(projectId:String = null) {
        this.selectedVariable = null;
        this.variables.splice(0, this.variables.length);
        
        var id = projectId;
        if ((projectId == null) && (this.projects.length > 0)) {
            id = this.projects[0].id;
        }

        if (id != null) {
            this.branchService
                .getBranches(id)
                .subscribe(result => {
                    this.branches = result.data;
                    this.selectedBranch = '';
                    if (this.branches.length > 0) {
                        this.selectedBranch = this.branches[0].id;
                        this.reloadVariables();
                    }
                });
        }
    }
    

    reloadVariables() {
        this.selectedVariable = null;
        this.variableService
            .getVariables(this.selectedBranch)
            .subscribe(response => {
                this.variables = response.data as Array<Variable>;
            })
    }


    onDeleteSegment() {
        this.timeSegments.pop();
    }

    onSave() {
        let finalValue = 0, finalPercentage = 0;
        if (this.subvariableList != undefined) {
            this.subvariableList.forEach((variable) => {
                finalValue += parseFloat(variable.value.toString());
                if (this.variableType == 'discrete') {
                    finalPercentage += parseFloat(variable.percentageTime.toString());
                }
            });
        }

        if (this.variableName.length == 0) {
            this.modal.showError('Variable name is mandatory');
        } else if (this.variableType.length == 0) {
            this.modal.showError('Variable type is mandatory');
        } else if (this.ownerId.length == 0) {
            this.modal.showError('Owner Id is mandatory');
        } else if (this.variableType == 'breakdown' && finalValue != 1.0) {
            this.modal.showError('All the subvariables value must add upto 1.0');
        } else if (this.variableType == 'discrete' && finalPercentage != 100.0) {
            this.modal.showError('All the subvariables value must add upto 100%');
        } else if ((this.variableType == 'breakdown' || this.variableType == 'discrete') && (this.timeSegmentWidgets == undefined || this.timeSegmentWidgets.length == 0)) {
            this.modal.showError(this.variableType + ' requires at lease one time segment');
        } else {
            
            var timeSegmentValues = Array();

            let lastResult = null;
            this.timeSegmentWidgets.forEach(segment => {
                var result = segment.getTimeSegmentValues();
                if (result.result) {
                    timeSegmentValues.push(result.reason);
                } else {
                    lastResult = result;
                }
            });
    
            if (timeSegmentValues.length != this.timeSegmentWidgets.length) {
                this.modal.showError(lastResult.reason.toString(), 'Incomplete definition');
            } else {

                let tempCompositeVariables:{id:String}[] = Array<{id:String}>();
                this.compositeVariableList.forEach(variable => {
                    if (variable.isSelected) {
                        tempCompositeVariables.push({id: variable.id});
                    }
                });

                let body = {
                    description: this.description,
                    branchId: this.branchId,
                    ownerId: this.ownerId,
                    timeSegment: timeSegmentValues,
                    title: this.variableName,
                    variableType: this.variableType,
                    valueType: this.valueType,
                    subVariables: this.subvariableList,
                    compositeVariables: tempCompositeVariables,
                    compositeType: this.compositType
                }

                if (this.selectedVariable == null) {
                    this.variableService
                    .createVariable(body)
                    .subscribe(response => {
                        this.selectedVariable = null;
                        this.onCancel();
                    })
                } else {
                    this.variableService
                        .updateVariable(body, this.selectedVariable.id)
                        .subscribe(response => {
                            console.log(response);
                            this.selectedVariable = null;
                            this.onCancel();
                        })
                }
            }
        }
    }

    onDelete(event) {

    }

    onCancel() {
        this.selectedVariable = null;
        this.router.navigate(['/home/variable-list'], {
            queryParams: {
                projectId: this.projectId,
                branchId: this.branchId
            }
        });        
        // this.variableName = '';
        // this.ownerId = '';
        // this.valueType = '';
        // this.variableType = '';
        // this.timeSegments.splice(0, this.timeSegments.length);
    }

    onVariableTypeChanged() {
        if (this.subvariableList != undefined) {
            this.subvariableList.splice(0, this.subvariableList.length);
        }
    }
}