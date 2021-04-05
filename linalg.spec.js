const la = require("./linalg.js");

const a = [1, 2, 3];
const b = [2, 3, 4];
const s = 2;
console.log(la.scale(a, s), "should be [2, 4, 6]");
console.log(la.dot(a, b), "should be 20");
console.log(la.cross(a, b), "should be [-1, 2, -1]");
console.log(la.norm(a), "should be 3.7417");
console.log(la.normalize(a), "should be [0.2673, 0.5345, 0.8018]");

// Test polar/euclidean conversion
console.log("Euclidean to Polar");
console.log(la.euclideanToPolar([1, 0, 0]), "should be π/2,0");
console.log(la.euclideanToPolar([0, 1, 0]), "should be π/2,π/2");
console.log(la.euclideanToPolar([0, -1, 0]), "should be π/2,-π/2");
console.log(la.euclideanToPolar([0, 0, 1]), "should be 0,0");

console.log("Polar to Euclidean");
console.log(la.polarToEuclidean([Math.PI/2, 0]), "should be 1,0,0");
console.log(la.polarToEuclidean([Math.PI/2, Math.PI/2]), "should be 0,1,0");
console.log(la.polarToEuclidean([Math.PI/2, -Math.PI/2]), "should be 0,-1,0");
console.log(la.polarToEuclidean([0, 0]), "should be 0,0,1");
