



export interface ITopicConfig {
    topic: string;
    numPartitions?: number;
    replicationFactor?: number;
    replicaAssignment?: object[];
    configEntries?: object[];
}
