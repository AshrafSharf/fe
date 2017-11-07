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
    ComponentModelComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    RouterModule.forRoot([
      { path:'projects', component: ProjectsComponent },
      { path:'branches', component: BranchesComponent },
      { path:'variables', component: VariablesComponent },
      { path:'forecast_tabular', component: ForecastTabularComponent },
      { path:'forecast_graphical', component: ForecastGraphicalComponent },
      { path:'component_model', component: ComponentModelComponent },
      { path:'data_flow', component: DataFlowComponent },
      { path:'simulation', component: SimulationComponent }
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
