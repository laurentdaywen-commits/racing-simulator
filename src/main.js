import * as THREE from 'three';

// --- Moteur 3D ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bb4c2);
scene.fog = new THREE.Fog(0x9bb4c2, 170, 520);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 900);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
document.querySelector('#game').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdcecff, 0x526044, 2));
const sun = new THREE.DirectionalLight(0xfff1d8, 3);
sun.position.set(-90, 150, 80); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -180; sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180; sun.shadow.camera.bottom = -180;
scene.add(sun);

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const grassMat=mat(0x557348), roadMat=mat(0x30343a,.94), whiteMat=mat(0xf1f0e8);
const redMat=mat(0xe8442e,.5), darkMat=mat(0x15191d,.72);
const glassMat=new THREE.MeshStandardMaterial({color:0x8baab8,metalness:.45,roughness:.18});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),grassMat);
ground.rotation.x=-Math.PI/2; ground.position.y=-.18; ground.receiveShadow=true; scene.add(ground);

const outer=new THREE.Shape(); outer.absellipse(0,0,105,66,0,Math.PI*2,false,0);
const inner=new THREE.Path(); inner.absellipse(0,0,78,39,0,Math.PI*2,true,0); outer.holes.push(inner);
const track=new THREE.Mesh(new THREE.ShapeGeometry(outer,160),roadMat);
track.rotation.x=-Math.PI/2; track.position.y=.02; track.receiveShadow=true;
track.material.side=THREE.DoubleSide; scene.add(track);

function ellipseLine(rx,rz,y,color,radius=.28,segments=240){
 const pts=[]; for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*rx,y,Math.sin(a)*rz));}
 const curve=new THREE.CatmullRomCurve3(pts,true);
 scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,6,true),mat(color)));
}
ellipseLine(104,65,.09,0xe7e5dc,.22); ellipseLine(79,40,.09,0xe7e5dc,.22);
ellipseLine(91.5,52,.075,0xd0d2d1,.1);
for(let i=0;i<48;i++){
 const a=i/48*Math.PI*2;
 const box=new THREE.Mesh(new THREE.BoxGeometry(2.1,.12,.65),i%2?whiteMat:redMat);
 box.position.set(Math.cos(a)*104,.17,Math.sin(a)*65); box.rotation.y=-a; scene.add(box);
}
for(let i=0;i<60;i++){
 const a=i/60*Math.PI*2,x=Math.cos(a)*118,z=Math.sin(a)*80,tree=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.55,4,7),mat(0x5c4630)); trunk.position.y=2; tree.add(trunk);
 const crown=new THREE.Mesh(new THREE.ConeGeometry(2.4,7,8),mat(i%3?0x31583b:0x3e6845)); crown.position.y=7; tree.add(crown);
 tree.position.set(x,0,z); scene.add(tree);
}
for(let i=0;i<14;i++){
 const box=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.2,1.2),i%2?whiteMat:redMat);
 box.position.set(-2,.7,-52+i*2.2); scene.add(box);
}

// --- Voiture provisoire ---
function buildCar(){
 const car=new THREE.Group();
 const shell=new THREE.Mesh(new THREE.BoxGeometry(2.05,.62,4.3),redMat);
 shell.position.y=.85; shell.castShadow=true; car.add(shell);
 const hood=new THREE.Mesh(new THREE.BoxGeometry(1.94,.18,1.15),mat(0xc93627,.4));
 hood.position.set(0,1.18,-1.35); car.add(hood);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.78,1.9),glassMat);
 cabin.position.set(0,1.48,.15); cabin.castShadow=true; car.add(cabin);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(1.52,.12,1.35),darkMat);
 roof.position.set(0,1.89,.18); car.add(roof);
 const wheels=[],frontWheels=[];
 for(const x of [-1.05,1.05]) for(const z of [-1.35,1.35]){
  const pivot=new THREE.Group(); pivot.position.set(x,.48,z); car.add(pivot);
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.28,24),darkMat);
  wheel.rotation.z=Math.PI/2; wheel.castShadow=true; pivot.add(wheel); wheels.push(wheel);
  if(z<0)frontWheels.push(pivot);
 }
 const bumper=new THREE.Mesh(new THREE.BoxGeometry(1.9,.22,.2),darkMat);
 bumper.position.set(0,.57,-2.18); car.add(bumper);
 const spoiler=new THREE.Mesh(new THREE.BoxGeometry(1.8,.09,.38),darkMat);
 spoiler.position.set(0,1.35,1.95); car.add(spoiler);
 const lights=new THREE.Mesh(new THREE.BoxGeometry(1.5,.13,.08),mat(0xffe7b0,.3));
 lights.position.set(0,.95,-2.17); car.add(lights);
 // Tableau de bord et volant visibles depuis la caméra cockpit
 const dash=new THREE.Mesh(new THREE.BoxGeometry(1.65,.22,.62),darkMat);
 dash.position.set(0,1.18,-1.48); car.add(dash);
 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.28,.045,8,24),darkMat);
 wheel.position.set(0,1.38,-.93); car.add(wheel);
 return {car,wheels,frontWheels};
}
const {car,wheels,frontWheels}=buildCar(); scene.add(car);

// --- Physique : vitesse longitudinale, glisse latérale et direction ---
const physics={
 velocity:new THREE.Vector3(), yaw:0, steer:0,
 acceleration:8.5, braking:15, reverseAcceleration:4.5,
 maxSpeed:54, wheelBase:2.65, steeringAngle:.48,
 roadGrip:8.5, grassGrip:1.6
};
const state={cameraMode:0};
const keys=new Set(); let last=performance.now();
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
 keys.add(k); if(k==='c')toggleCamera();
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
document.querySelectorAll('[data-key]').forEach(btn=>{
 const k=btn.dataset.key.toLowerCase();
 btn.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);});
 ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>keys.delete(k)));
});
function toggleCamera(){
 state.cameraMode=1-state.cameraMode;
 document.querySelector('#cameraBtn').textContent='CAMÉRA : '+(state.cameraMode?'COCKPIT':'EXT.');
}
document.querySelector('#cameraBtn').addEventListener('click',toggleCamera);
function resetCar(){
 physics.velocity.set(0,0,0); physics.yaw=-Math.PI/2; physics.steer=0;
 car.position.set(0,0,51); car.rotation.y=physics.yaw;
}
document.querySelector('#resetBtn').addEventListener('click',resetCar);
resetCar();

const speedEl=document.querySelector('#speed'),gearEl=document.querySelector('#gear');
function isOnTrack(x,z){
 const outerValue=x*x/(105*105)+z*z/(66*66);
 const innerValue=x*x/(78*78)+z*z/(39*39);
 return outerValue<=1 && innerValue>=1;
}
function frame(now){
 const dt=Math.min((now-last)/1000,.035); last=now;
 const forward=keys.has('arrowup')||keys.has('z')||keys.has('w');
 const brake=keys.has('arrowdown')||keys.has('s');
 const left=keys.has('arrowleft')||keys.has('q')||keys.has('a');
 const right=keys.has('arrowright')||keys.has('d');
 const throttle=forward?1:0, braking=brake?1:0;
 const forwardDir=new THREE.Vector3(-Math.sin(physics.yaw),0,-Math.cos(physics.yaw));
 const rightDir=new THREE.Vector3(Math.cos(physics.yaw),0,-Math.sin(physics.yaw));
 let longitudinal=physics.velocity.dot(forwardDir);
 let lateral=physics.velocity.dot(rightDir);
 const onTrack=isOnTrack(car.position.x,car.position.z);
 const grip=onTrack?physics.roadGrip:physics.grassGrip;

 // Moteur, freinage, résistance au roulement et marche arrière
 if(throttle>0){
  if(longitudinal<-.5) longitudinal=Math.min(0,longitudinal+physics.braking*dt);
  else longitudinal=Math.min(physics.maxSpeed,longitudinal+physics.acceleration*dt);
 } else if(braking>0){
  if(longitudinal>.5) longitudinal=Math.max(0,longitudinal-physics.braking*dt);
  else longitudinal=Math.max(-8,longitudinal-physics.reverseAcceleration*dt);
 } else {
  longitudinal*=Math.exp(-.22*dt);
  if(Math.abs(longitudinal)<.04)longitudinal=0;
 }
 // Le grip ramène progressivement la vitesse latérale : glisse plus marquée sur l'herbe
 lateral*=Math.exp(-grip*dt);
 const targetSteer=(left?1:0)-(right?1:0);
 physics.steer=THREE.MathUtils.damp(physics.steer,targetSteer,5.5,dt);
 const speedFactor=Math.min(Math.abs(longitudinal)/3,1);
 const steerAngle=physics.steer*physics.steeringAngle*(1-.28*speedFactor);
 const yawRate=(longitudinal/physics.wheelBase)*Math.tan(steerAngle);
 physics.yaw+=yawRate*dt;

 const newForward=new THREE.Vector3(-Math.sin(physics.yaw),0,-Math.cos(physics.yaw));
 const newRight=new THREE.Vector3(Math.cos(physics.yaw),0,-Math.sin(physics.yaw));
 physics.velocity.copy(newForward).multiplyScalar(longitudinal).addScaledVector(newRight,lateral);
 car.position.addScaledVector(physics.velocity,dt);
 car.rotation.y=physics.yaw;
 frontWheels.forEach(w=>w.rotation.y=steerAngle*.72);
 wheels.forEach(w=>w.rotation.x-=longitudinal*dt/.43);

 // Sur l'herbe, la voiture perd de la vitesse et devient plus difficile à contrôler
 if(!isOnTrack(car.position.x,car.position.z)){
  physics.velocity.multiplyScalar(Math.exp(-.9*dt));
 }
 const kmh=Math.round(Math.abs(longitudinal)*3.6);
 speedEl.textContent=String(kmh).padStart(3,'0');
 gearEl.textContent=longitudinal<-.5?'R':kmh<2?'N':kmh<28?'1':kmh<58?'2':kmh<100?'3':'4';

 if(state.cameraMode===0){
  const offset=new THREE.Vector3(0,4.6,10).applyAxisAngle(new THREE.Vector3(0,1,0),physics.yaw);
  const target=car.position.clone().add(new THREE.Vector3(0,1.1,0));
  camera.position.lerp(car.position.clone().add(offset),1-Math.exp(-4*dt)); camera.lookAt(target);
 }else{
  const eye=new THREE.Vector3(0,1.72,-.35).applyAxisAngle(new THREE.Vector3(0,1,0),physics.yaw);
  camera.position.copy(car.position).add(eye);
  const look=new THREE.Vector3(-Math.sin(physics.yaw),1.55,-Math.cos(physics.yaw));
  camera.lookAt(car.position.clone().add(look));
 }
 renderer.render(scene,camera); requestAnimationFrame(frame);
}
addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
});
document.querySelector('#loading').classList.add('hidden');
requestAnimationFrame(frame);
