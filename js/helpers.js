// @ts-check

/**
 * 
 * @param { string } path 
 * @returns { Promise<THREE.Mesh> } mesh
 */
async function getMashFromBlenderModel(path) {
  // @ts-ignore
  const loader = new THREE.GLTFLoader();
  console.log("loading blender model");
  console.time("getMashFromBlenderModel");

  let mesh;

  await loader.load(
    path,
    function (gltf) {
      console.log("inside loader.load");
      console.timeEnd("getMashFromBlenderModel");
      mesh = gltf.scene;
      dispatchEvent(new Event("modelLoaded"));
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // wait till the model is loaded
  await new Promise(resolve => {
    addEventListener("modelLoaded", resolve, { once: true });
  });

  console.log("loaded blender model");
  console.log("mesh", mesh);
  return mesh;
}


/**
 * @param { THREE.Vector3 } point
 * @param { THREE.Mesh } mesh
 */
function checkIfPointIsInsideMesh(point, mesh) {
  try {
    mesh.updateMatrixWorld();
    var localPt = mesh.worldToLocal(point.clone());

    // TOFIX: got boundingBox is undefined at some meshes
    return mesh.geometry?.boundingBox?.containsPoint(localPt);
  } catch (error) {
    console.warn(error);
    return false;
  }
}


/**
 * @param group
 * @returns { THREE.Mesh[] }
 */
function getAllMeshsFromNestedGroup(group) {
  let meshs = [];
  try {
    if (group.type === "Mesh") {
      meshs.push(group);
    }
    if (group.children.length === 0 || group.children === undefined)
      return [ group ];
    group.children.forEach(element => {
      if (element.children.length === 0 || group.children === undefined) {
        meshs.push(element);
      } else {
        meshs.push(...getAllMeshsFromNestedGroup(element));
      }
    });
    return meshs;
  } catch (error) {
    console.warn(error);
    return [];
  }
}


/**
 * @param { THREE.Mesh } mesh
 */
function getHeightOfMesh(mesh) {
  let box = new THREE.Box3().setFromObject(mesh);
  return box.max.y - box.min.y;
}


/**
 * @param {THREE.PerspectiveCamera} cam
 */
function getCameraLookAt(cam) {
  var vector = new THREE.Vector3(0, 0, -1);
  vector.applyQuaternion(cam.quaternion);
  return vector;
}


/**
 * Converts degrees to radians
 * @param {number} deg The angle in degrees
 * @returns {number} The radian value of the given degree
 */
function degToRad(deg) {
  return deg * Math.PI / 180;
}


/**
 * This function checks if two meshes are intersecting with each other
 * @param {THREE.Mesh} mesh1
 * @param {THREE.Mesh} mesh2
 * @returns {boolean} true if the two meshes are intersecting
 */
function checkCollision(mesh1, mesh2) {
  const box1 = new THREE.Box3().setFromObject(mesh1);
  const box2 = new THREE.Box3().setFromObject(mesh2);
  return box1.intersectsBox(box2);
}


/**
 * Creates a crosshair in the middle of the screen in the form of two divs
 */
function createCrosshair() {
  const crossWidth = "20px";
  const crossThickness = "5px";
  const crossColor = "green";
  const crossVertical = document.createElement("div");
  crossVertical.style.position = "absolute";
  crossVertical.style.top = "50%";
  crossVertical.style.left = "50%";
  crossVertical.style.width = crossWidth;
  crossVertical.style.height = crossThickness;
  crossVertical.style.backgroundColor = crossColor
  crossVertical.style.transform = "translate(-50%, -50%)";
  crossVertical.id = "crosshair-vertical";
  document.body.appendChild(crossVertical);
  const crossHorizontal = document.createElement("div");
  crossHorizontal.style.position = "absolute";
  crossHorizontal.style.top = "50%";
  crossHorizontal.style.left = "50%";
  crossHorizontal.style.width = crossThickness;
  crossHorizontal.style.height = crossWidth;
  crossHorizontal.style.backgroundColor = crossColor
  crossHorizontal.style.transform = "translate(-50%, -50%)";
  crossHorizontal.id = "crosshair-horizontal";
  document.body.appendChild(crossHorizontal);
}


/**
 * Removes the crosshair from the screen
 */
function removeCrosshair() {
  document.getElementById("crosshair-vertical").remove();
  document.getElementById("crosshair-horizontal").remove();
}