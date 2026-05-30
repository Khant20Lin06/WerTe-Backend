export declare class S3Service {
    upload(_path: string, _data: Buffer): Promise<{
        key: string;
    }>;
}
