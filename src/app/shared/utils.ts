import { RequestOptions, Headers } from "@angular/http";


export class Utils {

    // base url
    static baseUrl:String = "http://ec2-34-241-101-149.eu-west-1.compute.amazonaws.com:8443";
    static routeProject:String = "project";
    static routeBranch:String = "branch";
    static routeVariable:String = "variable";
    static routeUser:String = "user";
    static routeLogin:String = "login";


    // create url for route
    public static createUrl(route:String) {
        return `${this.baseUrl}\\${route}`;
    }

    // get the token
    public static getToken() {
        return "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBbWl0IiwiZXhwIjoxNTE0NjI5NTUxfQ.IR-cwR5IfvxvI5nzXkMwB5yMf1vUHVyFBAQmMnSNJ6a4a3eiEJtMrbNgOXCRICDvzSVqIG5NJ5niTKL53KlDmQ";
    }

    public static getRequestOptions() : RequestOptions {
        let header = new Headers({
            'Content-Type':'application/json', 
            'Authorization': Utils.getToken()
        });
        
        return new RequestOptions( {headers:header} );
    }
}