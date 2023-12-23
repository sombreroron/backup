interface Message {
    value: Buffer | string | null;
    key?: Buffer | string | null;
}

interface Consumer {
    run({ eachMessage }: { eachMessage({ topic, message }: { topic: string; message: Message }): Promise<void > }): Promise<void>;
}

interface Producer {
    send({ topic, messages }: { topic: string, messages: Message[] }): Promise<any>;
}


export abstract class KafkaClient {
    abstract getConsumer(): Promise<Consumer>;

    abstract getProducer(): Promise<Producer>;
}
