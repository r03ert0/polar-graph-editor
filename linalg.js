const scale = function (a, s) {
  return [a[0]*s, a[1]*s, a[2]*s];
};

const sub = function (a, b) {
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
};

const dot = function (a, b) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
};

const cross = function (a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0]
  ];
};

const norm = function (a) {
  return (a[0]**2 + a[1]**2 + a[2]**2)**0.5;
};

const normalize = function (a) {
  const n = norm(a);

  return scale(a, 1/n);
};

const multMatVec = function (M, a) {
  return [
    M[0]*a[0]+M[1]*a[1]+M[2]*a[2],
    M[3]*a[0]+M[4]*a[1]+M[5]*a[2],
    M[6]*a[0]+M[7]*a[1]+M[8]*a[2]
  ];
};

/* eslint-disable no-multi-spaces */
const rotationMatrixFromAxisAndAngle = function (w, a) {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const oca = 1-ca;

  return [
    ca+w[0]**2*oca,        w[0]*w[1]*oca-w[2]*sa, w[0]*w[2]*oca+w[1]*sa,
    w[1]*w[0]*oca+w[2]*sa, ca+w[1]**2*oca,        w[1]*w[2]*oca-w[0]*sa,
    w[2]*w[1]*oca-w[1]*sa, w[2]*w[1]*oca+w[0]*sa, ca+w[2]**2*oca
  ];
};
/* eslint-enable no-multi-spaces */

const rotationMatrixFromTwoVectors = function (a, b) {
  const cosTheta = dot(normalize(a), normalize(b));
  const angle = Math.acos(cosTheta);
  const w = normalize(cross(a, b));

  return rotationMatrixFromAxisAndAngle(w, angle);
};


/**
 * @function polarToEuclidean
 * @desc Convert from polar coordinates to 3D euclidean coordinates
 * @param {Array} p Array with [rho, theta] polar coordinates, where rho goes from 0 at
 * the centre of the polar map, to π at the periphery, and theta is the angle to the
 * horizontal axis.
 * @returns {array} Euclidean coordinates
 */
 const polarToEuclidean = function (p) {
  const [rho, theta] = p;
  const r = Math.sin(rho);
  const x = r*Math.cos(theta);
  const y = r*Math.sin(theta);
  const z = Math.cos(rho);

  return [x, y, z];
};

/**
 * @function euclideanToPolar
 * @description Convert from Euclidean to polar coordinates
 * @param {Array} s Array with [x, y, z] euclidean coordinates.
 * @return {array} Polar coordinates
 */
const euclideanToPolar = function (s) {
  const [x, y, z] = s;
  const theta = Math.atan2(y, x);
  const rho = Math.acos(Math.max(Math.min(z, 1), -1));

  return [rho, theta];
};

if(typeof module !== "undefined") {
  module.exports = {
    cross,
    dot,
    euclideanToPolar,
    multMatVec,
    norm,
    normalize,
    polarToEuclidean,
    rotationMatrixFromAxisAndAngle,
    rotationMatrixFromTwoVectors,
    scale,
    sub
  };
}
