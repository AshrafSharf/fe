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
        return "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBbWl0IiwiZXhwIjoxNTEzNTk3OTYwfQ.OQW69mQA1gMxS41Aott2XnHeuglV-6Z9bja0yKamidl7nB1iQq-t9FOZpS65taP6TiMzKVjt658AkBD0wpDESA";
    }

    public static getRequestOptions() : RequestOptions {
        let header = new Headers({
            'Content-Type':'application/json', 
            'Authorization': Utils.getToken()
        });
        
        return new RequestOptions( {headers:header} );
    }
}