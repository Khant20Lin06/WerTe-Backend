export type NodeEnvironment = 'development' | 'test' | 'staging' | 'production';
export declare function parseBoolean(value: string | undefined, defaultValue: boolean): boolean;
export declare function parseCsv(value: string | undefined): string[];
