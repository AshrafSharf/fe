import { RequestOptions, Headers } from "@angular/http";


export class Utils {

    // base url
    static baseUrl:String = "http://ec2-34-243-45-92.eu-west-1.compute.amazonaws.com:8443";
    static routeProject:String = "project";
    static routeBranch:String = "branch";
    static routeVariable:String = "variable";
    static routeUser:String = "user";
    static routeLogin:String = "login";
    static routeVariableType:String = "variableType";


    // create url for route
    public static createUrl(route:String) {
        return `${this.baseUrl}\\${route}`;
    }

    // get the token
    public static getToken() {
        return "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBbWl0IiwiZXhwIjoxNTE1ODkzMTMyfQ.k2fg04xIIlhRDFKglFInV5YuolsETLkJeT7gfc1vtPKd7f3bCJzpIC_DT3RFmcIypdyWaKE85pyz4BCVHsGqgw";
    }

    public static getShadeOfColor(color, percent) {   
        var f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    public static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    public static getRequestOptions() : RequestOptions {
        let header = new Headers({
            'Content-Type':'application/json', 
            'Authorization': Utils.getToken()
        });
        
        return new RequestOptions( {headers:header} );
    }
}