import { injectAll, InjectionToken, singleton } from "tsyringe";
import EnvConfig from "../config";
import Kafka from "../transporters/kafka";

export const kafkaFactoryDIToken: InjectionToken<KafkaFactory> = "KafkaFactory";
export const kafkaDIToken:InjectionToken<Kafka>="Kafka"


@singleton()
export default class KafkaFactory {
  private config;
  private kafka: Kafka;

  constructor(private readonly envConfig: EnvConfig) {
    this.config = envConfig.transporters.kafka;
  }
  create(): Kafka {
    this.kafka = new Kafka();
    return this.kafka;
  }

  bootstrap(): Promise<void> {
    return;
  }

  start(): Promise<void> {
    return;
  }

  stop(): Promise<void> {
    return;
  }
}
