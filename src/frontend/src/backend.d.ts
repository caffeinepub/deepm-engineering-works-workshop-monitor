import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface DeliveryInput {
    customerName: string;
    teamName: string;
    deliveryDate: string;
    notes: string;
    customName: string;
    driverName: string;
    photos: Array<Photo>;
    vehicleNo: string;
}
export interface CabinInput {
    customerName: string;
    stage: string;
    notes: string;
    customName: string;
    cabinType: string;
    teamNo: string;
    expectedDate: string;
    photos: Array<Photo>;
    startDate: string;
}
export interface DailyUpdateInput {
    status: string;
    date: string;
    monthLabel: string;
    section: string;
    delays: string;
    notes: string;
    weekLabel: string;
    shiftType: string;
    stageProgress: string;
    photos: Array<Photo>;
    workDone: string;
}
export interface Cabin {
    id: bigint;
    customerName: string;
    createdAt: bigint;
    updatedAt: bigint;
    stage: string;
    notes: string;
    customName: string;
    cabinType: string;
    teamNo: string;
    expectedDate: string;
    photos: Array<Photo>;
    startDate: string;
}
export interface WeeklyReportInput {
    status: string;
    paintingSummary: string;
    month: bigint;
    weekEnd: string;
    cabinSummary: string;
    totalUpdates: bigint;
    containerSummary: string;
    overallNotes: string;
    underpartsSummary: string;
    year: bigint;
    monthLabel: string;
    weekNumber: bigint;
    parkingSummary: string;
    weekLabel: string;
    weekStart: string;
}
export interface PaintingInput {
    customerName: string;
    stage: string;
    exteriorColour: string;
    notes: string;
    customName: string;
    teamNo: string;
    expectedDate: string;
    interiorColour: string;
    photos: Array<Photo>;
}
export interface WorkOrder {
    id: bigint;
    customerName: string;
    status: string;
    title: string;
    createdAt: bigint;
    section: string;
    description: string;
    updatedAt: bigint;
    notes: string;
    assignedTeam: string;
    expectedDate: string;
    weekLabel: string;
    photos: Array<Photo>;
}
export interface WeeklyReport {
    id: bigint;
    status: string;
    paintingSummary: string;
    month: bigint;
    weekEnd: string;
    cabinSummary: string;
    totalUpdates: bigint;
    containerSummary: string;
    createdAt: bigint;
    overallNotes: string;
    underpartsSummary: string;
    year: bigint;
    monthLabel: string;
    weekNumber: bigint;
    parkingSummary: string;
    weekLabel: string;
    weekStart: string;
    archivedAt: bigint;
}
export interface UnderpartInput {
    customerName: string;
    teamName: string;
    notes: string;
    customName: string;
    workStatus: string;
    photos: Array<Photo>;
}
export interface MonthlyArchive {
    id: bigint;
    weekLabels: Array<string>;
    month: bigint;
    overallSummary: string;
    totalDelays: bigint;
    createdAt: bigint;
    year: bigint;
    monthLabel: string;
    totalUnderparts: bigint;
    totalParkings: bigint;
    totalCabins: bigint;
    totalContainers: bigint;
    totalPaintings: bigint;
}
export interface Parking {
    id: bigint;
    customerName: string;
    entryDate: string;
    waitingFor: string;
    createdAt: bigint;
    updatedAt: bigint;
    notes: string;
    customName: string;
    photos: Array<Photo>;
}
export interface ContainerInput {
    customerName: string;
    containerType: string;
    stage: string;
    teamLeader: string;
    notes: string;
    customName: string;
    expectedDate: string;
    photos: Array<Photo>;
}
export interface ParkingInput {
    customerName: string;
    entryDate: string;
    waitingFor: string;
    notes: string;
    customName: string;
    photos: Array<Photo>;
}
export interface MonthlyArchiveInput {
    weekLabels: Array<string>;
    month: bigint;
    overallSummary: string;
    totalDelays: bigint;
    year: bigint;
    monthLabel: string;
    totalUnderparts: bigint;
    totalParkings: bigint;
    totalCabins: bigint;
    totalContainers: bigint;
    totalPaintings: bigint;
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
    customName: string;
    expectedDate: string;
    photos: Array<Photo>;
}
export interface Delivery {
    customerName: string;
    teamName: string;
    createdAt: bigint;
    deliveryDate: string;
    notes: string;
    customName: string;
    driverName: string;
    photos: Array<Photo>;
    vehicleNo: string;
}
export interface DailyUpdate {
    id: bigint;
    status: string;
    date: string;
    createdAt: bigint;
    monthLabel: string;
    section: string;
    delays: string;
    notes: string;
    weekLabel: string;
    shiftType: string;
    stageProgress: string;
    photos: Array<Photo>;
    workDone: string;
}
export interface WorkOrderInput {
    customerName: string;
    status: string;
    title: string;
    section: string;
    description: string;
    notes: string;
    assignedTeam: string;
    expectedDate: string;
    weekLabel: string;
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
    customName: string;
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
    customName: string;
    workStatus: string;
    photos: Array<Photo>;
}
export type Photo = Uint8Array;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCabin(input: CabinInput): Promise<void>;
    addContainer(input: ContainerInput): Promise<void>;
    addDailyUpdate(input: DailyUpdateInput): Promise<void>;
    addDelivery(input: DeliveryInput): Promise<void>;
    addMonthlyArchive(input: MonthlyArchiveInput): Promise<void>;
    addPainting(input: PaintingInput): Promise<void>;
    addParking(input: ParkingInput): Promise<void>;
    addUnderpart(input: UnderpartInput): Promise<void>;
    addWeeklyReport(input: WeeklyReportInput): Promise<void>;
    addWorkOrder(input: WorkOrderInput): Promise<void>;
    archiveDailyUpdatesForWeek(weekLabel: string): Promise<void>;
    archiveWeeklyReportToMonth(weekLabel: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCabin(id: bigint): Promise<void>;
    deleteContainer(id: bigint): Promise<void>;
    deletePainting(id: bigint): Promise<void>;
    deleteParking(id: bigint): Promise<void>;
    deleteUnderpart(id: bigint): Promise<void>;
    deleteWorkOrder(id: bigint): Promise<void>;
    getCabins(): Promise<Array<Cabin>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContainers(): Promise<Array<Container>>;
    getDailyUpdates(): Promise<Array<DailyUpdate>>;
    getDailyUpdatesByDate(date: string): Promise<Array<DailyUpdate>>;
    getDailyUpdatesByStatus(status: string): Promise<Array<DailyUpdate>>;
    getDailyUpdatesByWeek(weekLabel: string): Promise<Array<DailyUpdate>>;
    getDeliveries(): Promise<Array<Delivery>>;
    getMonthlyArchives(): Promise<Array<MonthlyArchive>>;
    getPaintings(): Promise<Array<Painting>>;
    getParkings(): Promise<Array<Parking>>;
    getUnderparts(): Promise<Array<Underpart>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyReports(): Promise<Array<WeeklyReport>>;
    getWeeklyReportsByMonth(year: bigint, month: bigint): Promise<Array<WeeklyReport>>;
    getWorkOrders(): Promise<Array<WorkOrder>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCabin(id: bigint, input: CabinInput): Promise<void>;
    updateContainer(id: bigint, input: ContainerInput): Promise<void>;
    updateMonthlyArchive(id: bigint, input: MonthlyArchiveInput): Promise<void>;
    updatePainting(id: bigint, input: PaintingInput): Promise<void>;
    updateParking(id: bigint, input: ParkingInput): Promise<void>;
    updateUnderpart(id: bigint, input: UnderpartInput): Promise<void>;
    updateWorkOrder(id: bigint, input: WorkOrderInput): Promise<void>;
}
