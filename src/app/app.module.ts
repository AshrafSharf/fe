import { LoginComponent } from './login/login.component';
import { BranchService } from './services/branch.service';
import { ProjectService } from './services/project.service';
import { VariableConstantComponent } from './dashboard/variables/constant/constant.variable.component';
import { TimeSegmentComponent } from './dashboard/variables/time-segment/time.segment.component';
import { ComponentModelComponent } from './dashboard/component-model/model.component';
import { SimulationComponent } from './dashboard/simulation/simulation.component';
import { ForecastGraphicalComponent } from './dashboard/forecasts/graphical/forecast.graphical.component';
import { ForecastTabularComponent } from './dashboard/forecasts/tabular/forecast.tabular.component';
import { VariablesComponent } from './dashboard/variables/variables.component';
import { ListItemComponent } from './shared/list-item/list.item.component';
import { AppHeaderComponent } from './shared/app-header/app.header.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { DataFlowComponent } from './dashboard/data-flow/data.flow.component';
import { BranchesComponent } from './dashboard/branches/branches.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NgDatepickerModule } from 'ng2-datepicker';
import { DpDatePickerModule } from 'ng2-date-picker';

import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { AppComponent } from './app.component';
import * as $ from 'jquery';

import { TableViewComponent } from './shared/table-view/table.view.component';
import { ProjectListComponent } from './dashboard/projects/project.list.component';
import { BranchListComponent } from './dashboard/branches/branches-list.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    BranchesComponent,
    DataFlowComponent,
    ProjectsComponent,
    AppHeaderComponent,
    ListItemComponent,
    VariablesComponent,
    ForecastTabularComponent,
    ForecastGraphicalComponent,
    SimulationComponent,
    ComponentModelComponent,
    TimeSegmentComponent,

    VariableConstantComponent,
    TableViewComponent,
    ProjectListComponent,
    BranchListComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    NgDatepickerModule,
    DpDatePickerModule,
    RouterModule.forRoot([
      { path:'project-list', component: ProjectListComponent },
      { path:'create-project', component: ProjectsComponent },
      { path:'branches-list', component: BranchListComponent },
      { path:'create-branch', component: BranchesComponent },
      { path:'variables', component: VariablesComponent },
      { path:'forecast_tabular', component: ForecastTabularComponent },
      { path:'forecast_graphical', component: ForecastGraphicalComponent },
      { path:'component_model', component: ComponentModelComponent },
      { path:'data_flow', component: DataFlowComponent },
      { path:'login', component: LoginComponent },
      { path:'simulation', component: SimulationComponent }
    ]),
  ],
  providers: [
    ProjectService,
    BranchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
