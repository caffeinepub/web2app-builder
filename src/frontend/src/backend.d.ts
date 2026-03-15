import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface DownloadRecord {
    id: string;
    userId: Principal;
    projectId: string;
    timestamp: bigint;
    format: string;
}
export interface Project {
    id: string;
    outputFormat: string;
    packageName: string;
    features: Features;
    websiteUrl: string;
    appName: string;
    userId: Principal;
    createdAt: bigint;
    minSdk: bigint;
    updatedAt: bigint;
    splashColor: string;
    iconKey?: string;
}
export interface Features {
    fileUpload: boolean;
    pullToRefresh: boolean;
    pushNotifications: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDownloadRecord(projectId: string, format: string): Promise<DownloadRecord>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(appName: string, websiteUrl: string, packageName: string, splashColor: string, outputFormat: string, minSdk: bigint, features: Features, iconKey: string | null): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: string): Promise<Project>;
    getProjectIcon(_projectId: string): Promise<ExternalBlob>;
    isCallerAdmin(): Promise<boolean>;
    listMyDownloadHistory(): Promise<Array<DownloadRecord>>;
    listMyProjects(): Promise<Array<Project>>;
    updateProject(id: string, appName: string, websiteUrl: string, packageName: string, splashColor: string, outputFormat: string, minSdk: bigint, features: Features, iconKey: string | null): Promise<Project>;
}
