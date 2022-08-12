// convert sfm relative fov to AE zoom distance
// assumes sfm fov is diagonal, AE zoom is horizontal
function relative_fov_to_zoom(relative_fov, min_angle, max_angle, comp_width, comp_height) {
  comp_diagonal = Math.sqrt(Math.pow(comp_width, 2) + Math.pow(comp_height, 2));
  real_fov = (max_angle - min_angle) * relative_fov + min_angle;
  zoom_distance = comp_diagonal / 2 / Math.tan((real_fov * Math.PI) / 180 / 2);
  return zoom_distance;
}

function onImportButtonClick() {
  var fileHLAE = File.openDialog("Pick the Data file from HLAE Cam", "*.bvh");
  fileHLAE.open("r", "BVH", "????");

  if (fileHLAE) {
    //app.beginUndoGroup("HLAE BVH to AE Cam");
    var currentdate = new Date().toString();
    var cam = new Array();
    var x, y, z, h, p, b;
    var center = [0, 0, 0];

    fileHLAE.open("r", "BVH", "????");

    var cLine;

    for (var i = 1; i <= 12; i++) {
      cLine = fileHLAE.readln();
    }

    var framesmax = cLine.replace("Frames:", "").replace(" ", "");
    framesmax = parseFloat(framesmax);

    cLine = fileHLAE.readln();
    var frametime = cLine.replace("Frame Time:", "").replace(" ", "");
    var fps = 1 / frametime;

    for (var i = 0; i < framesmax; i++) {
      cLine = fileHLAE.readln();
      cam[i] = cLine.split(" ");
    }
    fileHLAE.close();

    var myComp = app.project.activeItem;

    if (myComp == null) {
      alert("You need to select your composition.");
    } else {
      var myCompName =
        "HLAECAM File Import " +
        currentdate.charAt(16) +
        currentdate.charAt(17) +
        ":" +
        currentdate.charAt(19) +
        currentdate.charAt(20) +
        ":" +
        currentdate.charAt(22) +
        currentdate.charAt(23);
      // reads from projects
      fps = 1 / myComp.frameDuration;

      if (!app.project) app.newProject();
      myComp.time = 0;
      // ADDING NULL OBJECTS AND CAMERA
      myCamera = myComp.layers.addCamera(myCompName, [0, 0]);
      myCamera.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
      myCamera.property("Position").setValue([0, 0, 0]);

      XZ = myComp.layers.addNull();
      XZ.threeDLayer = true;
      XZ.property("Position").setValue([0, 0, 0]);
      XZ.name =
        "XZ " +
        currentdate.charAt(16) +
        currentdate.charAt(17) +
        ":" +
        currentdate.charAt(19) +
        currentdate.charAt(20) +
        ":" +
        currentdate.charAt(22) +
        currentdate.charAt(23);

      Y = myComp.layers.addNull();
      Y.threeDLayer = true;
      Y.property("Position").setValue([0, 0, 0]);
      Y.name =
        "Y " +
        currentdate.charAt(16) +
        currentdate.charAt(17) +
        ":" +
        currentdate.charAt(19) +
        currentdate.charAt(20) +
        ":" +
        currentdate.charAt(22) +
        currentdate.charAt(23);
      myCamera.parent = XZ;
      XZ.parent = Y;

      // ----------------------------------
      F = myComp.layers.addNull();
      F.threeDLayer = true;
      F.property("Position").setValue([0, 0, 0]);
      F.name =
        "F " +
        currentdate.charAt(16) +
        currentdate.charAt(17) +
        ":" +
        currentdate.charAt(19) +
        currentdate.charAt(20) +
        ":" +
        currentdate.charAt(22) +
        currentdate.charAt(23);
      myCamera.parent = XZ;
      F.parent = Y;
      // -----------------------------------

      // ANIMATING CAM + NULL OBJECTS
      cam_position = Y.property("position");
      cam_y = Y.property("Y Rotation");
      cam_x = XZ.property("X Rotation");
      cam_z = XZ.property("Z Rotation");

      cam_zoom = F.property("Zoom");

      center[0] = cam[0][0];
      center[1] = cam[0][1];
      center[2] = cam[0][2];

      keyTimes = new Array();
      keyPosition = new Array();
      keyX = new Array();
      keyY = new Array();
      keyZ = new Array();
      keyZoom = new Array();
      var min_fov = parseFloat(prompt("Enter min camera fov (default: 10)", 10));
      var max_fov = parseFloat(prompt("Enter max camera fov (default: 120)", 120));
      for (var i = 0; i < framesmax; i++) {
        x = cam[i][0];
        y = cam[i][1];
        z = cam[i][2];
        p = cam[i][5];
        h = cam[i][4];
        b = cam[i][3];
        f = cam[i][6];

        keyTimes.push(i / fps);
        keyPosition.push([x, y * -1, z * -1]);
        keyX.push(h);
        keyY.push(p * -1);
        keyZ.push(b * -1);

        var zoom = relative_fov_to_zoom(f, min_fov, max_fov, myComp.width, myComp.height);
        keyZoom.push(zoom);
        // keyZoom.push(relative_fov_to_zoom(f));

        //cam_position.setValueAtTime(1,[1,1,1]);
        //cam_y.setValueAtTime(i/fps,p*-1);
        //cam_x.setValueAtTime(i/fps,h*-1);
        //cam_z.setValueAtTime(i/fps,b);
      }

      //new Array(3)
      //var myCurrTime = myLayer.time;

      cam_position.setValuesAtTimes(keyTimes, keyPosition);
      cam_y.setValuesAtTimes(keyTimes, keyY);
      cam_x.setValuesAtTimes(keyTimes, keyX);
      cam_z.setValuesAtTimes(keyTimes, keyZ);

      //cam_zoom.setValuesAtTimes(keyTimes, keyZoom);
      myCamera.property("Zoom").setValuesAtTimes(keyTimes, keyZoom);

      //keyValues = new Array(10,20,30);

      //alert("huhu");
      //Y.property("Y Rotation").setValuesAtTimes(keyTimes,keyValues);
      //alert("huhu2");
    }

    //app.endUndoGroup();
  }
}

function createUI(thisObj) {
  var myPanel = thisObj instanceof Panel ? thisObj : new Window("palette", "HLAE bvh2AE 1.5", [100, 100, 300, 230]);
  myPanel.add("statictext", [50, 0, 300, 20], "HLAE BVH to AE Cam");
  myPanel.add("statictext", [35, 20, 300, 40], "Extend JavaScript for import");

  myPanel.add("statictext", [36, 40, 300, 60], "HLAEs Cam in After Effects");
  var importbvh = myPanel.add("button", [10, 60, 190, 80], "Import HLAE Cam (*.bvh)");
  var importbvh = myPanel.add("button", [10, 60, 190, 80], "min Camera FOV");
  var importbvh = myPanel.add("button", [10, 60, 190, 80], "max Camera FOV");
  importbvh.onClick = onImportButtonClick;
  //myPanel.add("statictext",[20,70,170,85], "Move Cam to the Origin (Center)",);
  //var center = myPanel.add("checkbox", [175,70,185,85]);
  //center.value = true;

  myPanel.add("statictext", [36, 90, 300, 105], "Script by msthavoc");
  myPanel.add("statictext", [36, 105, 300, 120], "http://advancedfx.org/");

  return myPanel;
}
var myToolsPanel = createUI(this);
myToolsPanel.show();
