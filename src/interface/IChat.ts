export interface IChat{
    id:string;
    documentdid:string;
    sequence:number;
    message:string;
    messagefrom:string;
    messageto:string;
    incidentid:string
    metadata:any;
    media:string;
    notified:boolean;
}