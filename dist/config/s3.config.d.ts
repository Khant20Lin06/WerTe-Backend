declare const s3Config: (() => {
    bucket: string;
    region: string;
    endpoint: string | undefined;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    publicBaseUrl: string | undefined;
    upload: {
        maxFileSizeBytes: number;
        allowedMimeTypes: string[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    bucket: string;
    region: string;
    endpoint: string | undefined;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    publicBaseUrl: string | undefined;
    upload: {
        maxFileSizeBytes: number;
        allowedMimeTypes: string[];
    };
}>;
export type S3Config = ReturnType<typeof s3Config>;
export default s3Config;
