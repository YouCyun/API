export declare class AiMakerVersionCreatorDto {
    id: number;
    name: string;
    email: string;
}
export declare class AiMakerVersionDto {
    id: number;
    projectId: number;
    versionNum: number;
    creatorId: number;
    sessionId?: number | null;
    datasetId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    creator?: AiMakerVersionCreatorDto;
}
