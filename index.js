// generate random points
let points = [];
let edges = [];
let i = 0;
const W = 1200;
const W2 = W/2;
let mouseDown = false;
let nodeIndex = -1;
let pos0, mouse0;

// install event listeners
document.getElementById("view").addEventListener('mousedown', (event) => {
    if(event.target.classList.contains("graph")) {
        const id = event.target.id;
        nodeMouseDown(event,id);
    }
});
document.getElementById("view").addEventListener('mousemove', move);
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('dragleave', handleDragLeave, false);
dropZone.addEventListener('drop', handleFileSelect, false);

function nodeMouseDown(e, index) {
    if( nodeIndex >= 0) {
        nodeIndex = -1;
        mouseDown = false;
        document.getElementById("info").innerHTML = "";
    } else {
        nodeIndex = index;
        pos0 = points[nodeIndex];
        mouse0 = [e.clientX, e.clientY];
        mouseDown = true;
        document.getElementById("info").innerHTML = `Node ${nodeIndex}`;
        document.getElementById(index).setAttribute("fill", "red");
    }
}

function move(e) {
    if(mouseDown) {
        const mouse1 = [e.clientX, e.clientY];
        points[nodeIndex][0] = pos0[0] + mouse1[0]-mouse0[0];
        points[nodeIndex][1] = pos0[1] + mouse1[1]-mouse0[1];
        mouse0 = mouse1;
        draw();
    }
}

function subdivide(geod, i) {
    const s0 = polarToScreen(geod[i]);
    const s1 = polarToScreen(geod[i+1]);
    const min = 50;
    const maxStack = 100;

    if((s0[0]-s1[0])**2 + (s0[1]-s1[1])**2 > min**2) {
        const p0 = polarToEuclidean(geod[i]);
        const p1 = polarToEuclidean(geod[i+1]);
        const p = [];
        p[0] = (p0[0] + p1[0])/2
        p[1] = (p0[1] + p1[1])/2
        p[2] = (p0[2] + p1[2])/2
        const n = Math.sqrt(p[0]**2 + p[1]**2 + p[2]**2)
        p[0]/=n;
        p[1]/=n;
        p[2]/=n;
        const rt = euclideanToPolar(p);
        geod.splice(i+1,0,rt);
        if(geod.length < maxStack) {
            subdivide(geod,i+1);
            subdivide(geod,i);
        }
    }
}

/**
 * @function edgeSVG
 * @description Draw a geodesic between 2 polar coordinates
 * @param {Array} p0 Array with [rho, theta] polar coordinates of 1st point
 * @param {*} p1 Array with [rho, theta] polar coordinates of 2nd point
 */
function edgeSVG(p0, p1) {
    let str = `<path fill="none" stroke="black" d="`;
    const geod = [p0, p1];

    subdivide(geod, 0);

    for(let i=0;i<geod.length;i++) {
        const xy = polarToScreen(geod[i]);
        if(i===0) {
            str += `M${xy[0]},${xy[1]} `;
        } else {
            str += `L${xy[0]},${xy[1]} `;
        }
    }
    str += `" />`;

    return str;
}

function polarToScreen(p) {
    const [rho, theta] = p;

    return [rho*Math.cos(theta)/Math.PI*W2+W2, rho*Math.sin(theta)/Math.PI*W2+W2];
}

function screenToPolar(s) {
    const [x, y] = s;
    const theta = Math.atan2(y-W2, x-W2);
    const rho = Math.PI*Math.sqrt((x-W2)**2 + (y-W2)**2)/W2;

    return [rho, theta];
}

/**
 * @function polarToEuclidean
 * @desc Convert from polar coordinates to 3D euclidean coordinates
 * @param {Array} p Array with [rho, theta] polar coordinates, where rho goes from 0 at
 * the centre of the polar map, to π at the periphery, and theta is the angle to the
 * horizontal axis.
 */
function polarToEuclidean(p) {
    const [rho, theta] = p;
    let x, y, z;
    const r = Math.sin(rho);
    x = r*Math.cos(theta);
    y = r*Math.sin(theta);
    z = Math.cos(rho);

    return [x, y, z];
}

/**
 * @function euclideanToPolar
 * @description Convert from Euclidean to polar coordinates
 * @param {Array} s Array with [x, y, z] euclidean coordinates.
 */
function euclideanToPolar(s) {
    const [x, y, z] = s;
    let rho, theta;
    theta = Math.atan2(y, x);
    rho = Math.acos(z);

    return [rho, theta];
}

function draw() {
    // clear
    const c1 = W/Math.sqrt(2);
    const c2 = (W-c1)/2;
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
    for(let i=0;i<edges.length;i++) {
        const p0 = screenToPolar(points[edges[i][0]]);
        const p1 = screenToPolar(points[edges[i][1]]);
        const str = edgeSVG(p0, p1);
        edgesStr += str;
    }
    document.getElementById("view").innerHTML += edgesStr;

    // draw circles
    let circlesStr = "";
    for(let i=0; i<points.length; i++) {
        const p = points[i];
        circlesStr +=
        `<circle class="graph" id="${i}"
                 cx=${p[0]} cy=${p[1]}
                 fill="black" />\n`;
    }
    document.getElementById("view").innerHTML += circlesStr;

}

function parseGraph(str) {
    const arr = str.split('\n');
    const [nv, nt, ne] = arr[0].split(' ').map((o)=>parseFloat(o));
    console.log(nv,nt,ne);
    const v = arr.slice(1,1+nv).map((o)=>o.split(' ').map((p)=>parseFloat(p)));
    const e = arr.slice(1+nv,1+nv+ne).map((o)=>o.split(' ').map((p)=>parseInt(p)));

    return {v, e};
}

/*
// Test conversion
console.log("Euclidean to Polar");
console.log(euclideanToPolar([1,0,0]), "should be π/2,0");
console.log(euclideanToPolar([0,1,0]), "should be π/2,π/2");
console.log(euclideanToPolar([0,-1,0]), "should be π/2,-π/2");
console.log(euclideanToPolar([0,0,1]), "should be 0,0");

console.log("Polar to Euclidean");
console.log(polarToEuclidean([Math.PI/2,0]), "should be 1,0,0");
console.log(polarToEuclidean([Math.PI/2,Math.PI/2]), "should be 0,1,0");
console.log(polarToEuclidean([Math.PI/2,-Math.PI/2]), "should be 0,-1,0");
console.log(polarToEuclidean([0,0]), "should be 0,0,1");
*/

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    loadFile(evt.dataTransfer.files[0]);
    evt.target.classList.remove('over');
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.classList.add('over');
}

function handleDragLeave(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.classList.remove('over');
}

function loadFile(file) {
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
        draw();
        document.getElementById("view").style.display="inline-block";
        document.getElementById("drop_zone").style.display="none";
        /* document.body.addEventListener("click", event => {
            if (event.target.classList.contains("node")) {
                nodeMouseDown(event, event.target.id)
            }
        });
        */
    }
    reader.readAsText(file);
}

function saveGraph() {
    console.log("Save graph");
    var a = document.createElement('a');
    const v = [];
    for(let i=0;i<points.length;i++) {
        v.push([
            Math.PI * (points[i][0]-W2)/W2,
            Math.PI * (W2-points[i][1])/W2
        ]);
    }
    let str = `${v.length} 0 ${edges.length}
${v.map((o)=>{return o.join(' ')}).join('\n')}
${edges.map((o)=>{return o.join(' ')}).join('\n')}
`;

    a.href = 'data:text/csv;charset=utf-8,' + str;
    let name = prompt("Save Graph As...", "graph.txt");
    if(name !== null) {
        a.download=name;
        document.body.appendChild(a);
        a.click();
    }
}

function saveSVG () {
    const svgData = document.getElementById("view").outerHTML;
    const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);
    const a = document.createElement("a");
    a.href = svgUrl;
    let name = prompt("Save SVG As...", "graph.svg");
    if(name !== null) {
        a.download = name;
        document.body.appendChild(a);
        a.click();
    }
}
