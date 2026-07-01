export declare class AiMakerClassMetricDto {
    precision: number;
    recall: number;
    f1: number;
    mAP: number;
    conf_threshold?: number;
}
export declare class AiMakerClassApDto {
    metrics: Record<string, AiMakerClassMetricDto>;
}
