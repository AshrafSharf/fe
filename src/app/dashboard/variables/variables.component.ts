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
import { Variable, TimeSegment } from '../../shared/interfaces/variables';

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

    private d3: D3;
    private parentNativeElement: any;
    private d3Svg: Selection<SVGSVGElement, any, null, undefined>;  

    timeSegments: TimeSegment[] = Array<TimeSegment>();

    myDataSets = null;
    
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

    ngOnInit() {
        this.userService
            .getOwners((users) => {
                this.users = users;
                this.ownerId = (this.users.length > 0) ? this.users[0].id : '';
            })

        this.route.queryParams.subscribe(params => {
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
                            this.createLineChartData();
                            break;
                        }
                    }
                })
        });

        //this.reloadProjects();

        // if (this.selectedVariable != null) {
        //     this.renderGraph();
        // }
    }

    createLineChartData() {
        
        var values = [];
        
        // this.selectedVariable.timeSegment.forEach(element => {

        // });

        if (this.selectedVariable.timeSegment.length > 0) {
            var element = this.selectedVariable.timeSegment[0];
            if (element.timeSegmentResponse != null || element.timeSegmentResponse != undefined) {
                // element.timeSegmentResponse.resultMap.forEach(value => {
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
                    
                // });
            } 
        }

    }

    renderGraph() {
        let self = this;
        let d3 = this.d3;
        let d3ParentElement: any;
        let svg: any;
        let name: string;
        let yVal: number;
        let colors: any = [];
        let data: {name: string, yVal: number}[] = [];
        let padding: number = 25;
        let width: number = 500;
        let height: number = 150;
        let xScale: any;
        let yScale: any;
        let xColor: any;
        let xAxis: any;
        let yAxis: any;

        if (this.parentNativeElement !== null) {
            // svg = d3.select(this.parentNativeElement)
            //     .append('svg')        // create an <svg> element
            //     .attr('width', width) // set its dimensions
            //     .attr('height', height);

            svg = d3.select('#graph');

            colors = ['red', 'yellow', 'green', 'blue'];
            
            data = [
                {name : 'A', yVal : 1},
                {name : 'B', yVal : 4},
                {name : 'C', yVal : 2},
                {name : 'D', yVal : 3}
            ];
    
            xScale = d3.scaleBand()
                .domain(data.map(function(d){ return d.name; }))
                .range([0, 200]);
    
            yScale = d3.scaleLinear()
                .domain([0,d3.max(data, function(d) {return d.yVal})])
                .range([100, 0]);
    
            xAxis = d3.axisBottom(xScale) // d3.js v.4
                .ticks(5)
                .scale(xScale);
    
            yAxis = d3.axisLeft(xScale) // d3.js v.4
                .scale(yScale)
                .ticks(7);
    
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + (padding) + "," + padding + ")")
                .call(yAxis);

            svg.append('g')            // create a <g> element
                .attr('class', 'axis')   // specify classes
                .attr("transform", "translate(" + padding + "," + (height - padding) + ")")
                .call(xAxis);            // let the axis do its thing

            // var rects = svg.selectAll('rect')
            //     .data(data);
            //     rects.size();
    
            // var newRects = rects.enter();
    
            // newRects.append('rect')
            //     .attr('x', function(d,i) {
            //         return xScale(d.name );
            //     })
            //     .attr('y', function(d) {
            //         return yScale(d.yVal);
            //     })
            //     .attr("transform","translate(" + (padding -5  + 25) + "," + (padding - 5) + ")")
            //     .attr('height', function(d) {
            //         return height - yScale(d.yVal) - (2*padding) + 5})
            //     .attr('width', 10)
            //     .attr('fill', function(d, i) {
            //         return colors[i];
            //     });
        }      

    }

    addTimeSegment() {
        this.timeSegments.push({
            constantValue: 0,
            description: '',
            inputMethod: 'constant',
            distributionType: 'none',
            growth: 0,
            mean: '',
            startTime: '',
            stdDeviation: '',
            timeSegmentResponse: {
                resultMap: Array()
            },
            userSelectedParametrics: '',
            userSelectedParametricsStdDeviation: ''
        });
    }

    selectBranch(event) {
        this.reloadBranches(event.target.value);
    }

    selectVariable(variable:Variable) {        
        this.selectedVariable = variable;
        this.variableName = variable.title.toString();
        this.ownerId = variable.ownerId;
        this.valueType = variable.valueType.toString();
        this.variableType = variable.variableType.toString();

        this.timeSegments.splice(0, this.timeSegments.length);
        variable.timeSegment.forEach(element => {
            this.timeSegments.push(element);
        });
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
        if (this.variableName.length == 0) {
            this.modal.showError('Variable name is mandatory');
        } else if (this.variableType.length == 0) {
            this.modal.showError('Variable type is mandatory');
        } else if (this.ownerId.length == 0) {
            this.modal.showError('Owner Id is mandatory');
        } else {
            var timeSegmentValues = Array();
            this.timeSegmentWidgets.forEach(segment => {
                var result = segment.getTimeSegmentValues();
                if (result.result) {
                    timeSegmentValues.push(result.reason);
                }
            });
    
            if (timeSegmentValues.length != this.timeSegmentWidgets.length) {
                this.modal.showError('Incomplete time segment definition');
            } else {
                let body = {
                    branchId: this.branchId,
                    ownerId: this.ownerId,
                    timeSegment: timeSegmentValues,
                    title: this.variableName,
                    variableType: this.variableType,
                    valueType: this.valueType
                }

                if (this.selectedVariable == null) {
                    this.variableService
                    .createVariable(body)
                    .subscribe(response => {
                        this.selectedVariable = null;
                        this.onCancel();
                        //this.router.navigate(['/home/variable-list']);
                    })
                } else {
                    this.variableService
                        .updateVariable(body, this.selectedVariable.id)
                        .subscribe(response => {
                            console.log(response);
                            this.selectedVariable = null;
                            this.onCancel();
                            //this.reloadVariables();
                        })
                }
            }
        }
    }

    onDelete(event) {

    }

    onCancel() {
        this.selectedVariable = null;
        this.router.navigate(['/home/variable-list']);        
        // this.variableName = '';
        // this.ownerId = '';
        // this.valueType = '';
        // this.variableType = '';
        // this.timeSegments.splice(0, this.timeSegments.length);
    }
}