import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

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
  };

  public type Cabin = {
    id : Nat;
    teamNo : Text;
    cabinType : Text;
    stage : Text;
    startDate : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
    createdAt : Int;
    updatedAt : Int;
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
  };

  public type ContainerInput = {
    teamLeader : Text;
    customerName : Text;
    containerType : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
  };

  public type CabinInput = {
    teamNo : Text;
    cabinType : Text;
    stage : Text;
    startDate : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Photo];
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
  };

  public type ParkingInput = {
    customerName : Text;
    waitingFor : Text;
    entryDate : Text;
    notes : Text;
    photos : [Photo];
  };

  public type UnderpartInput = {
    teamName : Text;
    customerName : Text;
    workStatus : Text;
    notes : Text;
    photos : [Photo];
  };

  var nextContainerId = 1;
  var nextCabinId = 1;
  var nextPaintingId = 1;
  var nextParkingId = 1;
  var nextUnderpartId = 1;

  let containers = Map.empty<Nat, Container>();
  let cabins = Map.empty<Nat, Cabin>();
  let paintings = Map.empty<Nat, Painting>();
  let parkings = Map.empty<Nat, Parking>();
  let underparts = Map.empty<Nat, Underpart>();

  public shared ({ caller }) func login(email : Text, password : Text) : async ?Text {
    if (email == "manager@deepam.com" and password == "manager123") {
      return ?("manager");
    };
    if (email == "ceo@deepam.com" and password == "ceo123") {
      return ?("ceo");
    };
    null;
  };

  // Containers
  public shared ({ caller }) func addContainer(input : ContainerInput) : async Nat {
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
    };
    containers.add(id, container);
    id;
  };

  public shared ({ caller }) func updateContainer(id : Nat, input : ContainerInput) : async Bool {
    switch (containers.get(id)) {
      case (null) { false };
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
        };
        containers.add(id, container);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteContainer(id : Nat) : async Bool {
    if (containers.containsKey(id)) {
      containers.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getContainers() : async [Container] {
    containers.values().toArray();
  };

  // Cabins
  public shared ({ caller }) func addCabin(input : CabinInput) : async Nat {
    let id = nextCabinId;
    nextCabinId += 1;
    let now = Time.now();
    let cabin : Cabin = {
      id;
      teamNo = input.teamNo;
      cabinType = input.cabinType;
      stage = input.stage;
      startDate = input.startDate;
      expectedDate = input.expectedDate;
      notes = input.notes;
      photos = input.photos;
      createdAt = now;
      updatedAt = now;
    };
    cabins.add(id, cabin);
    id;
  };

  public shared ({ caller }) func updateCabin(id : Nat, input : CabinInput) : async Bool {
    switch (cabins.get(id)) {
      case (null) { false };
      case (?existing) {
        let cabin : Cabin = {
          existing with
          teamNo = input.teamNo;
          cabinType = input.cabinType;
          stage = input.stage;
          startDate = input.startDate;
          expectedDate = input.expectedDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
        };
        cabins.add(id, cabin);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteCabin(id : Nat) : async Bool {
    if (cabins.containsKey(id)) {
      cabins.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getCabins() : async [Cabin] {
    cabins.values().toArray();
  };

  // Paintings
  public shared ({ caller }) func addPainting(input : PaintingInput) : async Nat {
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
    };
    paintings.add(id, painting);
    id;
  };

  public shared ({ caller }) func updatePainting(id : Nat, input : PaintingInput) : async Bool {
    switch (paintings.get(id)) {
      case (null) { false };
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
        };
        paintings.add(id, painting);
        true;
      };
    };
  };

  public shared ({ caller }) func deletePainting(id : Nat) : async Bool {
    if (paintings.containsKey(id)) {
      paintings.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getPaintings() : async [Painting] {
    paintings.values().toArray();
  };

  // Parking
  public shared ({ caller }) func addParking(input : ParkingInput) : async Nat {
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
    };
    parkings.add(id, parking);
    id;
  };

  public shared ({ caller }) func updateParking(id : Nat, input : ParkingInput) : async Bool {
    switch (parkings.get(id)) {
      case (null) { false };
      case (?existing) {
        let parking : Parking = {
          existing with
          customerName = input.customerName;
          waitingFor = input.waitingFor;
          entryDate = input.entryDate;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
        };
        parkings.add(id, parking);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteParking(id : Nat) : async Bool {
    if (parkings.containsKey(id)) {
      parkings.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getParkings() : async [Parking] {
    parkings.values().toArray();
  };

  // Underparts
  public shared ({ caller }) func addUnderpart(input : UnderpartInput) : async Nat {
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
    };
    underparts.add(id, underpart);
    id;
  };

  public shared ({ caller }) func updateUnderpart(id : Nat, input : UnderpartInput) : async Bool {
    switch (underparts.get(id)) {
      case (null) { false };
      case (?existing) {
        let underpart : Underpart = {
          existing with
          teamName = input.teamName;
          customerName = input.customerName;
          workStatus = input.workStatus;
          notes = input.notes;
          photos = input.photos;
          updatedAt = Time.now();
        };
        underparts.add(id, underpart);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteUnderpart(id : Nat) : async Bool {
    if (underparts.containsKey(id)) {
      underparts.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getUnderparts() : async [Underpart] {
    underparts.values().toArray();
  };
};
