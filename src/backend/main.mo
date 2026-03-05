import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type Photo = Storage.ExternalBlob;

  public type Container = {
    id : Nat;
    teamLeader : Text;
    customerName : Text;
    containerType : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
    customName : Text; // new field
  };

  public type Cabin = {
    id : Nat;
    teamNo : Text;
    customerName : Text;
    cabinType : Text;
    stage : Text;
    startDate : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
    customName : Text; // new field
  };

  public type Painting = {
    id : Nat;
    teamNo : Text;
    customerName : Text;
    interiorColour : Text;
    exteriorColour : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
    customName : Text; // new field
  };

  public type Parking = {
    id : Nat;
    customerName : Text;
    waitingFor : Text;
    entryDate : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
    customName : Text; // new field
  };

  public type Underpart = {
    id : Nat;
    teamName : Text;
    customerName : Text;
    workStatus : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
    customName : Text; // new field
  };

  public type Delivery = {
    vehicleNo : Text;
    customerName : Text;
    deliveryDate : Text;
    driverName : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    teamName : Text; // new field
    customName : Text; // new field
  };

  public type WorkOrder = {
    id : Nat;
    title : Text;
    section : Text;
    customerName : Text;
    assignedTeam : Text;
    description : Text;
    status : Text;
    weekLabel : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
  };

  public type DailyUpdate = {
    id : Nat;
    date : Text;
    shiftType : Text;
    section : Text;
    workDone : Text;
    stageProgress : Text;
    delays : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    status : Text;
    weekLabel : Text;
    monthLabel : Text;
  };

  public type WeeklyReport = {
    id : Nat;
    weekLabel : Text;
    weekStart : Text;
    weekEnd : Text;
    monthLabel : Text;
    year : Nat;
    month : Nat;
    weekNumber : Nat;
    containerSummary : Text;
    cabinSummary : Text;
    paintingSummary : Text;
    parkingSummary : Text;
    underpartsSummary : Text;
    overallNotes : Text;
    totalUpdates : Nat;
    status : Text;
    createdAt : Int;
    archivedAt : Int;
  };

  public type MonthlyArchive = {
    id : Nat;
    year : Nat;
    month : Nat;
    monthLabel : Text;
    weekLabels : [Text];
    totalContainers : Nat;
    totalCabins : Nat;
    totalPaintings : Nat;
    totalParkings : Nat;
    totalUnderparts : Nat;
    totalDelays : Nat;
    overallSummary : Text;
    createdAt : Int;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type ContainerInput = {
    teamLeader : Text;
    customerName : Text;
    containerType : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    customName : Text;
  };

  public type CabinInput = {
    teamNo : Text;
    customerName : Text;
    cabinType : Text;
    stage : Text;
    startDate : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    customName : Text;
  };

  public type PaintingInput = {
    teamNo : Text;
    customerName : Text;
    interiorColour : Text;
    exteriorColour : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    customName : Text;
  };

  public type ParkingInput = {
    customerName : Text;
    waitingFor : Text;
    entryDate : Text;
    notes : Text;
    photos : [Photo];
    customName : Text;
  };

  public type UnderpartInput = {
    teamName : Text;
    customerName : Text;
    workStatus : Text;
    notes : Text;
    photos : [Photo];
    customName : Text;
  };

  public type DeliveryInput = {
    vehicleNo : Text;
    customerName : Text;
    deliveryDate : Text;
    driverName : Text;
    notes : Text;
    photos : [Photo];
    teamName : Text;
    customName : Text;
  };

  public type WorkOrderInput = {
    title : Text;
    section : Text;
    customerName : Text;
    assignedTeam : Text;
    description : Text;
    status : Text;
    weekLabel : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
  };

  // New input types for extended functionality
  public type DailyUpdateInput = {
    date : Text;
    shiftType : Text;
    section : Text;
    workDone : Text;
    stageProgress : Text;
    delays : Text;
    notes : Text;
    photos : [Photo];
    status : Text;
    weekLabel : Text;
    monthLabel : Text;
  };

  public type WeeklyReportInput = {
    weekLabel : Text;
    weekStart : Text;
    weekEnd : Text;
    monthLabel : Text;
    year : Nat;
    month : Nat;
    weekNumber : Nat;
    containerSummary : Text;
    cabinSummary : Text;
    paintingSummary : Text;
    parkingSummary : Text;
    underpartsSummary : Text;
    overallNotes : Text;
    totalUpdates : Nat;
    status : Text;
  };

  public type MonthlyArchiveInput = {
    year : Nat;
    month : Nat;
    monthLabel : Text;
    weekLabels : [Text];
    totalContainers : Nat;
    totalCabins : Nat;
    totalPaintings : Nat;
    totalParkings : Nat;
    totalUnderparts : Nat;
    totalDelays : Nat;
    overallSummary : Text;
  };

  // ID Counters
  var nextContainerId = 1;
  var nextCabinId = 1;
  var nextPaintingId = 1;
  var nextParkingId = 1;
  var nextUnderpartId = 1;
  var nextWorkOrderId = 1;
  var nextDeliveryId = 1;

  var nextDailyUpdateId = 1;
  var nextWeeklyReportId = 1;
  var nextMonthlyArchiveId = 1;

  // Persistent Maps
  let containers = Map.empty<Nat, Container>();
  let cabins = Map.empty<Nat, Cabin>();
  let paintings = Map.empty<Nat, Painting>();
  let parkings = Map.empty<Nat, Parking>();
  let underparts = Map.empty<Nat, Underpart>();
  let workOrders = Map.empty<Nat, WorkOrder>();
  let deliveries = Map.empty<Nat, Delivery>();

  let dailyUpdates = Map.empty<Nat, DailyUpdate>();
  let weeklyReports = Map.empty<Nat, WeeklyReport>();
  let monthlyArchives = Map.empty<Nat, MonthlyArchive>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Containers
  public shared ({ caller }) func addContainer(input : ContainerInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add containers");
    };
    let id = nextContainerId;
    nextContainerId += 1;
    let now = Time.now();
    let container : Container = {
      id;
      teamLeader = input.teamLeader;
      customerName = input.customerName;
      containerType = input.containerType;
      stage = input.stage;
      expectedDate = input.expectedDate;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
      customName = input.customName;
    };
    containers.add(id, container);
  };

  public shared ({ caller }) func updateContainer(id : Nat, input : ContainerInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update containers");
    };
    switch (containers.get(id)) {
      case (null) { Runtime.trap("Container ID " # id.toText() # " does not exist. ") };
      case (?existing) {
        let container : Container = {
          existing with
          teamLeader = input.teamLeader;
          customerName = input.customerName;
          containerType = input.containerType;
          stage = input.stage;
          expectedDate = input.expectedDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
          customName = input.customName;
        };
        containers.add(id, container);
      };
    };
  };

  public shared ({ caller }) func deleteContainer(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete containers");
    };
    if (containers.containsKey(id)) {
      containers.remove(id);
    } else {
      Runtime.trap("Container ID " # id.toText() # " does not exist. ");
    };
  };

  public query ({ caller }) func getContainers() : async [Container] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view containers");
    };
    containers.values().toArray();
  };

  // Cabins
  public shared ({ caller }) func addCabin(input : CabinInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cabins");
    };
    let id = nextCabinId;
    nextCabinId += 1;
    let now = Time.now();
    let cabin : Cabin = {
      id;
      teamNo = input.teamNo;
      customerName = input.customerName;
      cabinType = input.cabinType;
      stage = input.stage;
      startDate = input.startDate;
      expectedDate = input.expectedDate;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
      customName = input.customName;
    };
    cabins.add(id, cabin);
  };

  public shared ({ caller }) func updateCabin(id : Nat, input : CabinInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cabins");
    };
    switch (cabins.get(id)) {
      case (null) { Runtime.trap("Cabin ID " # id.toText() # " does not exist. ") };
      case (?existing) {
        let cabin : Cabin = {
          existing with
          teamNo = input.teamNo;
          customerName = input.customerName;
          cabinType = input.cabinType;
          stage = input.stage;
          startDate = input.startDate;
          expectedDate = input.expectedDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
          customName = input.customName;
        };
        cabins.add(id, cabin);
      };
    };
  };

  public shared ({ caller }) func deleteCabin(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete cabins");
    };
    if (cabins.containsKey(id)) {
      cabins.remove(id);
    } else {
      Runtime.trap("Cabin ID " # id.toText() # " does not exist. ");
    };
  };

  public query ({ caller }) func getCabins() : async [Cabin] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cabins");
    };
    cabins.values().toArray();
  };

  // Paintings
  public shared ({ caller }) func addPainting(input : PaintingInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add paintings");
    };
    let id = nextPaintingId;
    nextPaintingId += 1;
    let now = Time.now();
    let painting : Painting = {
      id;
      teamNo = input.teamNo;
      customerName = input.customerName;
      interiorColour = input.interiorColour;
      exteriorColour = input.exteriorColour;
      stage = input.stage;
      expectedDate = input.expectedDate;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
      customName = input.customName;
    };
    paintings.add(id, painting);
  };

  public shared ({ caller }) func updatePainting(id : Nat, input : PaintingInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update paintings");
    };
    switch (paintings.get(id)) {
      case (null) { Runtime.trap("Painting ID " # id.toText() # " does not exist. ") };
      case (?existing) {
        let painting : Painting = {
          existing with
          teamNo = input.teamNo;
          customerName = input.customerName;
          interiorColour = input.interiorColour;
          exteriorColour = input.exteriorColour;
          stage = input.stage;
          expectedDate = input.expectedDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
          customName = input.customName;
        };
        paintings.add(id, painting);
      };
    };
  };

  public shared ({ caller }) func deletePainting(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete paintings");
    };
    if (paintings.containsKey(id)) {
      paintings.remove(id);
    } else {
      Runtime.trap("Painting ID " # id.toText() # " does not exist. ");
    };
  };

  public query ({ caller }) func getPaintings() : async [Painting] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view paintings");
    };
    paintings.values().toArray();
  };

  // Parking
  public shared ({ caller }) func addParking(input : ParkingInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add parking records");
    };
    let id = nextParkingId;
    nextParkingId += 1;
    let now = Time.now();
    let parking : Parking = {
      id;
      customerName = input.customerName;
      waitingFor = input.waitingFor;
      entryDate = input.entryDate;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
      customName = input.customName;
    };
    parkings.add(id, parking);
  };

  public shared ({ caller }) func updateParking(id : Nat, input : ParkingInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update parking records");
    };
    switch (parkings.get(id)) {
      case (null) { Runtime.trap("Parking ID " # id.toText() # " does not exist. ") };
      case (?existing) {
        let parking : Parking = {
          existing with
          customerName = input.customerName;
          waitingFor = input.waitingFor;
          entryDate = input.entryDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
          customName = input.customName;
        };
        parkings.add(id, parking);
      };
    };
  };

  public shared ({ caller }) func deleteParking(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete parking records");
    };
    if (parkings.containsKey(id)) {
      parkings.remove(id);
    } else {
      Runtime.trap("Parking ID " # id.toText() # " does not exist. ");
    };
  };

  public query ({ caller }) func getParkings() : async [Parking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view parking records");
    };
    parkings.values().toArray();
  };

  // Underparts
  public shared ({ caller }) func addUnderpart(input : UnderpartInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add underparts");
    };
    let id = nextUnderpartId;
    nextUnderpartId += 1;
    let now = Time.now();
    let underpart : Underpart = {
      id;
      teamName = input.teamName;
      customerName = input.customerName;
      workStatus = input.workStatus;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
      customName = input.customName;
    };
    underparts.add(id, underpart);
  };

  public shared ({ caller }) func updateUnderpart(id : Nat, input : UnderpartInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update underparts");
    };
    switch (underparts.get(id)) {
      case (null) { Runtime.trap("Underpart ID " # id.toText() # " does not exist. ") };
      case (?existing) {
        let underpart : Underpart = {
          existing with
          teamName = input.teamName;
          customerName = input.customerName;
          workStatus = input.workStatus;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
          customName = input.customName;
        };
        underparts.add(id, underpart);
      };
    };
  };

  public shared ({ caller }) func deleteUnderpart(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete underparts");
    };
    if (underparts.containsKey(id)) {
      underparts.remove(id);
    } else {
      Runtime.trap("Underpart ID " # id.toText() # " does not exist. ");
    };
  };

  public query ({ caller }) func getUnderparts() : async [Underpart] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view underparts");
    };
    underparts.values().toArray();
  };

  // Deliveries (New Section)
  public shared ({ caller }) func addDelivery(input : DeliveryInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add deliveries");
    };
    let id = nextDeliveryId;
    nextDeliveryId += 1;
    let now = Time.now();
    let delivery : Delivery = {
      vehicleNo = input.vehicleNo;
      customerName = input.customerName;
      deliveryDate = input.deliveryDate;
      driverName = input.driverName;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      teamName = input.teamName;
      customName = input.customName;
    };
    deliveries.add(id, delivery);
  };

  public query ({ caller }) func getDeliveries() : async [Delivery] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deliveries");
    };
    deliveries.values().toArray();
  };

  // WorkOrders
  public shared ({ caller }) func addWorkOrder(input : WorkOrderInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add work orders");
    };
    let id = nextWorkOrderId;
    nextWorkOrderId += 1;
    let now = Time.now();
    let workOrder : WorkOrder = {
      id;
      title = input.title;
      section = input.section;
      customerName = input.customerName;
      assignedTeam = input.assignedTeam;
      description = input.description;
      status = input.status;
      weekLabel = input.weekLabel;
      expectedDate = input.expectedDate;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
    };
    workOrders.add(id, workOrder);
  };

  public shared ({ caller }) func updateWorkOrder(id : Nat, input : WorkOrderInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update work orders");
    };
    switch (workOrders.get(id)) {
      case (null) { Runtime.trap("WorkOrder ID " # id.toText() # " does not exist. ") };
      case (?existing) {
        let workOrder : WorkOrder = {
          existing with
          title = input.title;
          section = input.section;
          customerName = input.customerName;
          assignedTeam = input.assignedTeam;
          description = input.description;
          status = input.status;
          weekLabel = input.weekLabel;
          expectedDate = input.expectedDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
        };
        workOrders.add(id, workOrder);
      };
    };
  };

  public shared ({ caller }) func deleteWorkOrder(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete work orders");
    };
    if (workOrders.containsKey(id)) {
      workOrders.remove(id);
    } else {
      Runtime.trap("WorkOrder ID " # id.toText() # " does not exist. ");
    };
  };

  public query ({ caller }) func getWorkOrders() : async [WorkOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work orders");
    };
    workOrders.values().toArray();
  };

  // Daily Updates
  public shared ({ caller }) func addDailyUpdate(input : DailyUpdateInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add daily updates");
    };
    let id = nextDailyUpdateId;
    nextDailyUpdateId += 1;
    let now = Time.now();
    let dailyUpdate : DailyUpdate = {
      id;
      date = input.date;
      shiftType = input.shiftType;
      section = input.section;
      workDone = input.workDone;
      stageProgress = input.stageProgress;
      delays = input.delays;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      status = input.status;
      weekLabel = input.weekLabel;
      monthLabel = input.monthLabel;
    };
    dailyUpdates.add(id, dailyUpdate);
  };

  public query ({ caller }) func getDailyUpdates() : async [DailyUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily updates");
    };
    dailyUpdates.values().toArray();
  };

  public query ({ caller }) func getDailyUpdatesByDate(date : Text) : async [DailyUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily updates");
    };
    dailyUpdates.values().toArray().filter(func(update) { update.date == date });
  };

  public query ({ caller }) func getDailyUpdatesByWeek(weekLabel : Text) : async [DailyUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily updates");
    };
    dailyUpdates.values().toArray().filter(func(update) { update.weekLabel == weekLabel });
  };

  public query ({ caller }) func getDailyUpdatesByStatus(status : Text) : async [DailyUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily updates");
    };
    dailyUpdates.values().toArray().filter(func(update) { update.status == status });
  };

  public shared ({ caller }) func archiveDailyUpdatesForWeek(weekLabel : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can archive daily updates");
    };
    let updatesIter = dailyUpdates.entries();
    updatesIter.forEach(
      func((id, update)) {
        if (update.weekLabel == weekLabel) {
          let updatedUpdate = { update with status = "archived_weekly" };
          dailyUpdates.add(id, updatedUpdate);
        };
      }
    );
  };

  // Weekly Reports
  public shared ({ caller }) func addWeeklyReport(input : WeeklyReportInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add weekly reports");
    };
    let id = nextWeeklyReportId;
    nextWeeklyReportId += 1;
    let now = Time.now();
    let weeklyReport : WeeklyReport = {
      id;
      weekLabel = input.weekLabel;
      weekStart = input.weekStart;
      weekEnd = input.weekEnd;
      monthLabel = input.monthLabel;
      year = input.year;
      month = input.month;
      weekNumber = input.weekNumber;
      containerSummary = input.containerSummary;
      cabinSummary = input.cabinSummary;
      paintingSummary = input.paintingSummary;
      parkingSummary = input.paintingSummary;
      underpartsSummary = input.underpartsSummary;
      overallNotes = input.overallNotes;
      totalUpdates = input.totalUpdates;
      status = input.status;
      createdAt = now;
      archivedAt = 0;
    };
    weeklyReports.add(id, weeklyReport);
  };

  public query ({ caller }) func getWeeklyReports() : async [WeeklyReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weekly reports");
    };
    weeklyReports.values().toArray();
  };

  public query ({ caller }) func getWeeklyReportsByMonth(year : Nat, month : Nat) : async [WeeklyReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weekly reports");
    };
    weeklyReports.values().toArray().filter(func(report) { report.year == year and report.month == month });
  };

  public shared ({ caller }) func archiveWeeklyReportToMonth(weekLabel : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can archive weekly reports");
    };
    let reportsIter = weeklyReports.entries();
    reportsIter.forEach(
      func((id, report)) {
        if (report.weekLabel == weekLabel and report.status == "active") {
          let updatedReport = { report with status = "archived_monthly" };
          weeklyReports.add(id, updatedReport);
        };
      }
    );
  };

  // Monthly Archives
  public shared ({ caller }) func addMonthlyArchive(input : MonthlyArchiveInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add monthly archives");
    };
    let id = nextMonthlyArchiveId;
    nextMonthlyArchiveId += 1;
    let now = Time.now();
    let monthlyArchive : MonthlyArchive = {
      id;
      year = input.year;
      month = input.month;
      monthLabel = input.monthLabel;
      weekLabels = input.weekLabels;
      totalContainers = input.totalContainers;
      totalCabins = input.totalCabins;
      totalPaintings = input.totalPaintings;
      totalParkings = input.totalParkings;
      totalUnderparts = input.totalUnderparts;
      totalDelays = input.totalDelays;
      overallSummary = input.overallSummary;
      createdAt = now;
    };
    monthlyArchives.add(id, monthlyArchive);
  };

  public query ({ caller }) func getMonthlyArchives() : async [MonthlyArchive] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view monthly archives");
    };
    monthlyArchives.values().toArray();
  };

  public shared ({ caller }) func updateMonthlyArchive(id : Nat, input : MonthlyArchiveInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update monthly archives");
    };
    switch (monthlyArchives.get(id)) {
      case (null) { Runtime.trap("Monthly archive not found") };
      case (?existing) {
        let updatedArchive = {
          id = existing.id;
          year = input.year;
          month = input.month;
          monthLabel = input.monthLabel;
          weekLabels = input.weekLabels;
          totalContainers = input.totalContainers;
          totalCabins = input.totalCabins;
          totalPaintings = input.totalPaintings;
          totalParkings = input.totalParkings;
          totalUnderparts = input.totalUnderparts;
          totalDelays = input.totalDelays;
          overallSummary = input.overallSummary;
          createdAt = existing.createdAt;
        };
        monthlyArchives.add(id, updatedArchive);
      };
    };
  };
};
