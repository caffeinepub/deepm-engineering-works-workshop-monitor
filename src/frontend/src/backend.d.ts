import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Photo = Uint8Array;
export interface Cabin {
    id: bigint;
    createdAt: bigint;
    updatedAt: bigint;
    stage: string;
    notes: string;
    cabinType: string;
    teamNo: string;
    expectedDate: string;
    photos: Array<Photo>;
    startDate: string;
}
export interface PaintingInput {
    customerName: string;
    stage: string;
    exteriorColour: string;
    notes: string;
    teamNo: string;
    expectedDate: string;
    interiorColour: string;
    photos: Array<Photo>;
}
export interface UnderpartInput {
    customerName: string;
    teamName: string;
    notes: string;
    workStatus: string;
    photos: Array<Photo>;
}
export interface Parking {
    id: bigint;
    customerName: string;
    entryDate: string;
    waitingFor: string;
    createdAt: bigint;
    updatedAt: bigint;
    notes: string;
    photos: Array<Photo>;
}
export interface ContainerInput {
    customerName: string;
    containerType: string;
    stage: string;
    teamLeader: string;
    notes: string;
    expectedDate: string;
    photos: Array<Photo>;
}
export interface ParkingInput {
    customerName: string;
    entryDate: string;
    waitingFor: string;
    notes: string;
    photos: Array<Photo>;
}
export interface Container {
    id: bigint;
    customerName: string;
    createdAt: bigint;
    containerType: string;
    updatedAt: bigint;
    stage: string;
    teamLeader: string;
    notes: string;
    expectedDate: string;
    photos: Array<Photo>;
}
export interface Painting {
    id: bigint;
    customerName: string;
    createdAt: bigint;
    updatedAt: bigint;
    stage: string;
    exteriorColour: string;
    notes: string;
    teamNo: string;
    expectedDate: string;
    interiorColour: string;
    photos: Array<Photo>;
}
export interface Underpart {
    id: bigint;
    customerName: string;
    teamName: string;
    createdAt: bigint;
    updatedAt: bigint;
    notes: string;
    workStatus: string;
    photos: Array<Photo>;
}
export interface CabinInput {
    stage: string;
    notes: string;
    cabinType: string;
    teamNo: string;
    expectedDate: string;
    photos: Array<Photo>;
    startDate: string;
}
export interface backendInterface {
    addCabin(input: CabinInput): Promise<bigint>;
    addContainer(input: ContainerInput): Promise<bigint>;
    addPainting(input: PaintingInput): Promise<bigint>;
    addParking(input: ParkingInput): Promise<bigint>;
    addUnderpart(input: UnderpartInput): Promise<bigint>;
    deleteCabin(id: bigint): Promise<boolean>;
    deleteContainer(id: bigint): Promise<boolean>;
    deletePainting(id: bigint): Promise<boolean>;
    deleteParking(id: bigint): Promise<boolean>;
    deleteUnderpart(id: bigint): Promise<boolean>;
    getCabins(): Promise<Array<Cabin>>;
    getContainers(): Promise<Array<Container>>;
    getPaintings(): Promise<Array<Painting>>;
    getParkings(): Promise<Array<Parking>>;
    getUnderparts(): Promise<Array<Underpart>>;
    login(email: string, password: string): Promise<string | null>;
    updateCabin(id: bigint, input: CabinInput): Promise<boolean>;
    updateContainer(id: bigint, input: ContainerInput): Promise<boolean>;
    updatePainting(id: bigint, input: PaintingInput): Promise<boolean>;
    updateParking(id: bigint, input: ParkingInput): Promise<boolean>;
    updateUnderpart(id: bigint, input: UnderpartInput): Promise<boolean>;
}
