/* eslint-disable no-alert */
/* global rotationMatrixFromTwoVectors, multMatVec, norm, sub */
/* global polarToEuclidean, euclideanToPolar */

// generate random points
const points = [];
let edges = [];
const W = 1200;
const W2 = W/2;
const [c1, c2] = [W/Math.sqrt(2), W*(1-1/Math.sqrt(2))/2];
let mouseDownOnNode = false;
let mouseDownOnSpace = false;
let nodeIndex = -1;
let mouse0, pos0;
let dropZone;
const EPS = 1e-6;

const polarToScreen = function (p) {
  const [rho, theta] = p;

  return [rho*Math.cos(theta)/Math.PI*W2+W2, rho*Math.sin(theta)/Math.PI*W2+W2];
};

const screenToPolar = function (s) {
  const [x, y] = s;
  const theta = Math.atan2(y-W2, x-W2);
  const rho = Math.PI*Math.sqrt((x-W2)**2 + (y-W2)**2)/W2;

  return [rho, theta];
};

const min = 50;
const maxStack = 100;
const subdivide = function (geod, i) {
  const s0 = polarToScreen(geod[i]);
  const s1 = polarToScreen(geod[i+1]);

  if((s0[0]-s1[0]) ** 2 + (s0[1]-s1[1])**2 > min ** 2) {
    const p0 = polarToEuclidean(geod[i]);
    const p1 = polarToEuclidean(geod[i+1]);
    const p = [
      (p0[0] + p1[0])/2,
      (p0[1] + p1[1])/2,
      (p0[2] + p1[2])/2
    ];
    const n = Math.sqrt(p[0]**2 + p[1]**2 + p[2]**2);
    p[0]/=n;
    p[1]/=n;
    p[2]/=n;
    const rt = euclideanToPolar(p);
    geod.splice(i+1, 0, rt);
    if(geod.length < maxStack) {
      subdivide(geod, i+1);
      subdivide(geod, i);
    }
  }
};

const rotatePoints = function (p0, p1) {
  const R = rotationMatrixFromTwoVectors(p0, p1);
  const euclidean = points.map(screenToPolar).map(polarToEuclidean);
  const rotatedEuclidean = euclidean.map((p) => multMatVec(R, p));
  const rotated = rotatedEuclidean.map(euclideanToPolar).map(polarToScreen);

  return rotated;
};

/**
 * @function edgeSVG
 * @description Draw a geodesic between 2 polar coordinates
 * @param {Array} p0 Array with [rho, theta] polar coordinates of 1st point
 * @param {*} p1 Array with [rho, theta] polar coordinates of 2nd point
 * @returns {void}
 */
const edgeSVG = function (p0, p1) {
  let str = `<path fill="none" stroke="black" d="`;
  const geod = [p0, p1];

  subdivide(geod, 0);

  for(let i=0; i<geod.length; i++) {
    const xy = polarToScreen(geod[i]);
    if(i===0) {
      str += `M${xy[0]},${xy[1]} `;
    } else {
      str += `L${xy[0]},${xy[1]} `;
    }
  }
  str += `" />`;

  return str;
};

const draw = function (thePoints) {
  // clear
  const bg="#d0d0d0";
  document.getElementById("view").innerHTML = `
    <circle cx=${W2} cy=${W2} r=${W2} fill="none" stroke="${bg}"/>
    <circle cx=${W2} cy=${W2} r=${3*W2/4} fill="none" stroke="${bg}"/>
    <circle cx=${W2} cy=${W2} r=${W2/2} fill="none" stroke="${bg}"/>
    <circle cx=${W2} cy=${W2} r=${W2/4} fill="none" stroke="${bg}"/>
    <path d="M0,${W2}L${W},${W2} M${W2},0L${W2},${W} M${c2},${c2}l${c1},${c1} M${c2},${W-c2}l${c1},${-c1}" fill="none" stroke="${bg}"/>
    `;

  // draw edges
  let edgesStr = "";
  for(let i=0; i<edges.length; i++) {
    const [p0, p1] = [
      screenToPolar(thePoints[edges[i][0]]),
      screenToPolar(thePoints[edges[i][1]])
    ];
    const str = edgeSVG(p0, p1);
    edgesStr += str;
  }
  document.getElementById("view").innerHTML += edgesStr;

  // draw circles
  let circlesStr = "";
  for(let i=0; i<thePoints.length; i++) {
    const p = thePoints[i];
    circlesStr +=
        `<circle class="graph" id="${i}"
                 cx=${p[0]} cy=${p[1]}
                 fill="black" />\n`;
  }
  document.getElementById("view").innerHTML += circlesStr;
};

const moveNode = function (e) {
  const mouse1 = [e.clientX, e.clientY];
  points[nodeIndex][0] = pos0[0] + mouse1[0]-mouse0[0];
  points[nodeIndex][1] = pos0[1] + mouse1[1]-mouse0[1];
  mouse0 = mouse1;
  draw(points);
};

const moveSpace = function (e) {
  const mouse1 = [e.clientX, e.clientY];
  const p0 = polarToEuclidean(screenToPolar(mouse0));
  const p1 = polarToEuclidean(screenToPolar(mouse1));

  if (norm(sub(p0, p1)) < EPS) {
    return;
  }

  draw(rotatePoints(p0, p1));
};

const move = function (e) {
  if(mouseDownOnNode) { moveNode(e); }
  if(mouseDownOnSpace) { moveSpace(e); }
};

const up = function (e) {
  if(mouseDownOnSpace) {
    mouseDownOnSpace = false;
    const mouse1 = [e.clientX, e.clientY];
    const p0 = polarToEuclidean(screenToPolar(mouse0));
    const p1 = polarToEuclidean(screenToPolar(mouse1));
    if (norm(sub(p0, p1)) < EPS) { return; }
    const rotated = rotatePoints(p0, p1);
    for(let i=0; i<points.length; i++) {
      points[i] = rotated[i];
    }
  }
};

const nodeMouseDown = function (e, index) {
  if( nodeIndex >= 0) {
    nodeIndex = -1;
    mouseDownOnNode = false;
    document.getElementById("info").innerHTML = "";
  } else {
    nodeIndex = index;
    pos0 = points[nodeIndex];
    mouse0 = [e.clientX, e.clientY];
    mouseDownOnNode = true;
    document.getElementById("info").innerHTML = `Node ${nodeIndex}`;
    document.getElementById(index).setAttribute("fill", "red");
  }
};

const spaceMouseDown = function (e) {
  if(mouseDownOnSpace === false) {
    mouse0 = [e.clientX, e.clientY];
    mouseDownOnSpace = true;
  }
};

const parseGraph = function (str) {
  const arr = str.split('\n');
  const [nv, nt, ne] = arr[0].split(' ').map((o) => parseFloat(o));
  const v = arr.slice(1, 1+nv).map((o) => o.split(' ').map((p) => parseFloat(p)));
  const e = arr.slice(1+nv, 1+nv+ne).map((o) => o.split(' ').map((p) => parseInt(p, 10)));

  return {v, e};
};

const loadFile = function (file) {
  var reader = new FileReader();
  reader.onload = () => {
    const {v, e} = parseGraph(reader.result);
    for(let i=0; i<v.length; i++) {
      points.push([
        v[i][0]*W2/Math.PI+W2,
        W2-v[i][1]*W2/Math.PI
      ]);
    }
    edges = edges.concat(e);
    draw(points);
    document.getElementById("view").style.display="inline-block";
    document.getElementById("drop_zone").style.display="none";
  };
  reader.readAsText(file);
};

// eslint-disable-next-line no-unused-vars
const saveGraph = function () {
  var a = document.createElement('a');
  const v = [];
  for(let i=0; i<points.length; i++) {
    v.push([
      Math.PI * (points[i][0]-W2)/W2,
      Math.PI * (W2-points[i][1])/W2
    ]);
  }
  const str = `${v.length} 0 ${edges.length}
${v.map((o) => o.join(' ')).join('\n')}
${edges.map((o) => o.join(' ')).join('\n')}
`;

  a.href = 'data:text/csv;charset=utf-8,' + str;
  const name = prompt("Save Graph As...", "graph.txt");
  if(name !== null) {
    a.download=name;
    document.body.appendChild(a);
    a.click();
  }
};

// eslint-disable-next-line no-unused-vars
const saveSVG = function () {
  const svgData = document.getElementById("view").outerHTML;
  const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
  const svgUrl = URL.createObjectURL(svgBlob);
  const a = document.createElement("a");
  a.href = svgUrl;
  const name = prompt("Save SVG As...", "graph.svg");
  if(name !== null) {
    a.download = name;
    document.body.appendChild(a);
    a.click();
  }
};

const handleFileSelect = function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  loadFile(evt.dataTransfer.files[0]);
  evt.target.classList.remove('over');
};

const handleDragOver = function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  dropZone.classList.add('over');
};

const handleDragLeave = function (evt) {
  evt.stopPropagation();
  evt.preventDefault();
  dropZone.classList.remove('over');
};

// eslint-disable-next-line no-unused-vars
const init = function () {
  dropZone = document.getElementById('drop_zone');

  // install event listeners
  document.getElementById("view").addEventListener('mousedown', (event) => {
    if(event.target.classList.contains("graph")) {
      const {id} = event.target;
      nodeMouseDown(event, id);
    } else {
      spaceMouseDown(event);
    }
  });
  document.getElementById("view").addEventListener('mousemove', move);
  document.getElementById("view").addEventListener('mouseup', up);
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('dragleave', handleDragLeave, false);
  dropZone.addEventListener('drop', handleFileSelect, false);
};

if(typeof module !== "undefined") {
  module.exports = {};
}
