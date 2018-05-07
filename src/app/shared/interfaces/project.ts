import { User } from "./user";

export interface Project {
    id: String;
    title: String;
    description: String;
    ownerName: String;
    ownerId: String;   
    isPrivate: Boolean;  
    usersWithAccess: Array<User>;
 
}