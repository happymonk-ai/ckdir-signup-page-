export interface IEvents{
    
}

export interface IEvent{
    id:string
    type:string
    timestamp:string
    about:string
    score:number
    notified:true
    notifiedList:string[]
    location:string
    subevent:string
    eid:string
    images:string[]
    videos:string[]
    audios:string[]
    sensors:string[]
    relatedIncidents:string[]
    relatedActivity:string
}


export interface IEventBlock{
    
}