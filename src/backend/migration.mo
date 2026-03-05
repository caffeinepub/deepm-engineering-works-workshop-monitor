import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldContainer = {
    id : Nat;
    teamLeader : Text;
    customerName : Text;
    containerType : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
  };

  type OldCabin = {
    id : Nat;
    teamNo : Text;
    customerName : Text;
    cabinType : Text;
    stage : Text;
    startDate : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
  };

  type OldPainting = {
    id : Nat;
    teamNo : Text;
    customerName : Text;
    interiorColour : Text;
    exteriorColour : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
  };

  type OldParking = {
    id : Nat;
    customerName : Text;
    waitingFor : Text;
    entryDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
  };

  type OldUnderpart = {
    id : Nat;
    teamName : Text;
    customerName : Text;
    workStatus : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {
    containers : Map.Map<Nat, OldContainer>;
    cabins : Map.Map<Nat, OldCabin>;
    paintings : Map.Map<Nat, OldPainting>;
    parkings : Map.Map<Nat, OldParking>;
    underparts : Map.Map<Nat, OldUnderpart>;
    // Other unchanged fields...
  };

  type NewContainer = {
    id : Nat;
    teamLeader : Text;
    customerName : Text;
    containerType : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
    customName : Text;
  };

  type NewCabin = {
    id : Nat;
    teamNo : Text;
    customerName : Text;
    cabinType : Text;
    stage : Text;
    startDate : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
    customName : Text;
  };

  type NewPainting = {
    id : Nat;
    teamNo : Text;
    customerName : Text;
    interiorColour : Text;
    exteriorColour : Text;
    stage : Text;
    expectedDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
    customName : Text;
  };

  type NewParking = {
    id : Nat;
    customerName : Text;
    waitingFor : Text;
    entryDate : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
    customName : Text;
  };

  type NewUnderpart = {
    id : Nat;
    teamName : Text;
    customerName : Text;
    workStatus : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    createdAt : Int;
    updatedAt : Int;
    customName : Text;
  };

  type NewActor = {
    containers : Map.Map<Nat, NewContainer>;
    cabins : Map.Map<Nat, NewCabin>;
    paintings : Map.Map<Nat, NewPainting>;
    parkings : Map.Map<Nat, NewParking>;
    underparts : Map.Map<Nat, NewUnderpart>;
    // Other unchanged fields...
  };

  public func run(old : OldActor) : NewActor {
    let newContainers = old.containers.map<Nat, OldContainer, NewContainer>(
      func(_id, oldContainer) {
        { oldContainer with customName = "" };
      }
    );

    let newCabins = old.cabins.map<Nat, OldCabin, NewCabin>(
      func(_id, oldCabin) {
        { oldCabin with customName = "" };
      }
    );

    let newPaintings = old.paintings.map<Nat, OldPainting, NewPainting>(
      func(_id, oldPainting) {
        { oldPainting with customName = "" };
      }
    );

    let newParkings = old.parkings.map<Nat, OldParking, NewParking>(
      func(_id, oldParking) {
        { oldParking with customName = "" };
      }
    );

    let newUnderparts = old.underparts.map<Nat, OldUnderpart, NewUnderpart>(
      func(_id, oldUnderpart) {
        { oldUnderpart with customName = "" };
      }
    );

    {
      containers = newContainers;
      cabins = newCabins;
      paintings = newPaintings;
      parkings = newParkings;
      underparts = newUnderparts;
      // Other unchanged fields...
    };
  };
};
