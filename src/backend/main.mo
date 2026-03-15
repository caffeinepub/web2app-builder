import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Project = {
    id : Text;
    userId : Principal;
    appName : Text;
    websiteUrl : Text;
    packageName : Text;
    splashColor : Text;
    outputFormat : Text;
    minSdk : Nat;
    features : Features;
    iconKey : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Features = {
    pullToRefresh : Bool;
    pushNotifications : Bool;
    fileUpload : Bool;
  };

  type DownloadRecord = {
    id : Text;
    projectId : Text;
    userId : Principal;
    format : Text;
    timestamp : Int;
  };

  module DownloadRecord {
    public func compare(a : DownloadRecord, b : DownloadRecord) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  let projects = Map.empty<Text, Project>();
  let downloadRecords = Map.empty<Text, DownloadRecord>();

  // Generate unique project ID
  func generateProjectId(userId : Principal) : Text {
    let timestamp = Time.now().toText();
    let prefix = userId.toText();
    prefix # "_project_" # timestamp;
  };

  // Generate unique download record ID
  func generateRecordId(userId : Principal) : Text {
    let timestamp = Time.now().toText();
    let prefix = userId.toText();
    prefix # "_record_" # timestamp;
  };

  public shared ({ caller }) func createProject(
    appName : Text,
    websiteUrl : Text,
    packageName : Text,
    splashColor : Text,
    outputFormat : Text,
    minSdk : Nat,
    features : Features,
    iconKey : ?Text,
  ) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    let projectId = generateProjectId(caller);
    let currentTime = Time.now();

    let project : Project = {
      id = projectId;
      userId = caller;
      appName;
      websiteUrl;
      packageName;
      splashColor;
      outputFormat;
      minSdk;
      features;
      iconKey;
      createdAt = currentTime;
      updatedAt = currentTime;
    };

    projects.add(projectId, project);
    project;
  };

  public shared ({ caller }) func updateProject(
    id : Text,
    appName : Text,
    websiteUrl : Text,
    packageName : Text,
    splashColor : Text,
    outputFormat : Text,
    minSdk : Nat,
    features : Features,
    iconKey : ?Text,
  ) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };

    let existingProject = switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?p) { p };
    };

    if (existingProject.userId != caller) {
      Runtime.trap("Unauthorized: Cannot update project owned by another user");
    };

    let updatedProject : Project = {
      id = id;
      userId = existingProject.userId;
      appName;
      websiteUrl;
      packageName;
      splashColor;
      outputFormat;
      minSdk;
      features;
      iconKey;
      createdAt = existingProject.createdAt;
      updatedAt = Time.now();
    };

    projects.add(id, updatedProject);
    updatedProject;
  };

  public shared ({ caller }) func deleteProject(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };

    let project = switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?p) { p };
    };

    if (project.userId != caller) {
      Runtime.trap("Unauthorized: Cannot delete project owned by another user");
    };

    projects.remove(id);
  };

  public query ({ caller }) func getProject(id : Text) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access projects");
    };

    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        if (project.userId != caller) {
          Runtime.trap("Unauthorized: Cannot access project owned by another user");
        };
        project;
      };
    };
  };

  public query ({ caller }) func listMyProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list projects");
    };

    let iter = projects.values().filter(
      func(p) {
        p.userId == caller;
      }
    );
    iter.toArray();
  };

  public shared ({ caller }) func addDownloadRecord(projectId : Text, format : Text) : async DownloadRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add download records");
    };

    // Verify the project exists and belongs to the caller
    let project = switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?p) { p };
    };

    if (project.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create download record for project owned by another user");
    };

    let recordId = generateRecordId(caller);
    let timestamp = Time.now();

    let record : DownloadRecord = {
      id = recordId;
      projectId;
      userId = caller;
      format;
      timestamp;
    };

    downloadRecords.add(recordId, record);
    record;
  };

  public query ({ caller }) func listMyDownloadHistory() : async [DownloadRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list download history");
    };

    let history = downloadRecords.values().toArray().filter(
      func(r) {
        r.userId == caller;
      }
    );

    history.sort();
  };

  public query ({ caller }) func getProjectIcon(_projectId : Text) : async Storage.ExternalBlob {
    Runtime.trap("Icon fetching should be handled on the frontend");
  };
};
