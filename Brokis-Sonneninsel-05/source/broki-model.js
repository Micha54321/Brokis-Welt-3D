/* Broki — photo-led plush study 01. Geometry, seams, embroidery and short pile. */
(function(root){
 'use strict';
 const T=THREE,TAU=Math.PI*2;
 const OLIVE=0x50d629,CREAM=0xffd447;
 function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(t){return t*t*(3-2*t);}
 function clothTexture(size=512){
  const random=seeded(771),height=new Float32Array(size*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const a=random()*.09,b=random()*.43,c=Math.sin(x*.4+Math.sin(y*.07)*.8)*.025;
   height[y*size+x]=.4+a+b+c;
  }
  // A tiny directional average describes the short, laid nap of velour.
  const colorCanvas=document.createElement('canvas'),normalCanvas=document.createElement('canvas');colorCanvas.width=colorCanvas.height=normalCanvas.width=normalCanvas.height=size;
  const colorCtx=colorCanvas.getContext('2d'),normalCtx=normalCanvas.getContext('2d'),color=colorCtx.createImageData(size,size),normal=normalCtx.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=(y*size+x)*4,at=(xx,yy)=>height[((yy+size)%size)*size+(xx+size)%size];
   const h=(at(x,y)*2+at(x,y-1)+at(x,y+1)+at(x,y+2))/5;
   const value=Math.round(232+h*23);color.data[i]=color.data[i+1]=color.data[i+2]=value;color.data[i+3]=255;
   const dx=(at(x-1,y)-at(x+1,y))*.85,dy=(at(x,y-2)-at(x,y+2))*.4,n=new T.Vector3(dx,dy,1).normalize();
   normal.data[i]=Math.round((n.x*.5+.5)*255);normal.data[i+1]=Math.round((n.y*.5+.5)*255);normal.data[i+2]=Math.round((n.z*.5+.5)*255);normal.data[i+3]=255;
  }
  colorCtx.putImageData(color,0,0);normalCtx.putImageData(normal,0,0);
  const map=new T.CanvasTexture(colorCanvas),normalMap=new T.CanvasTexture(normalCanvas);map.colorSpace=T.SRGBColorSpace;normalMap.colorSpace=T.NoColorSpace;
  for(const texture of [map,normalMap]){texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,2.8);texture.anisotropy=4;}
  return {map,normalMap};
 }
 function fabric(color,textures){return new T.MeshPhysicalMaterial({color,map:textures.map,normalMap:textures.normalMap,normalScale:new T.Vector2(.7,.7),roughness:.98,metalness:0,sheen:.85,sheenColor:new T.Color(color).lerp(new T.Color(0xf7efcf),.30),sheenRoughness:.83,specularIntensity:.15,ior:1.4});}
 function surfaceGeometry(fn,nu=128,nv=64){
  const positions=[],uvs=[],indices=[];
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv,p=fn(u,v);positions.push(p.x,p.y,p.z);uvs.push(u,v);}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;indices.push(a,a+1,b,a+1,b+1,b);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 function mesh(parent,name,geometry,material){const normals=geometry.attributes.normal,positions=geometry.attributes.position;if(normals){geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new T.Vector3()),n=new T.Vector3();for(let i=0;i<normals.count;i++){n.fromBufferAttribute(normals,i);if(n.lengthSq()<.5){n.fromBufferAttribute(positions,i).sub(center);if(n.lengthSq()<.00001)n.set(0,0,1);n.normalize();normals.setXYZ(i,n.x,n.y,n.z);}}}const m=new T.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function tube(parent,name,points,radius,material,segments=64){return mesh(parent,name,new T.TubeGeometry(new T.CatmullRomCurve3(points),segments,radius,6,false),material);}
 const bodyProfile=[[0,.001,.001],[.008,.32,.30],[.042,.45,.42],[.13,.55,.50],[.32,.605,.555],[.59,.60,.55],[.88,.54,.50],[1.10,.47,.44],[1.25,.455,.42],[1.31,.44,.40],[1.355,.28,.26],[1.37,.001,.001]];
 function bodyRadius(y){y=Math.max(0,Math.min(1.37,y));for(let i=0;i<bodyProfile.length-1;i++){const a=bodyProfile[i],b=bodyProfile[i+1];if(y<=b[0]){const t=(y-a[0])/(b[0]-a[0]),span=b[0]-a[0],prev=bodyProfile[Math.max(0,i-1)],next=bodyProfile[Math.min(bodyProfile.length-1,i+2)];return[1,2].map(k=>{const slope=(b[k]-a[k])/span,sl=(a[k]-prev[k])/(a[0]-prev[0]||1),sr=(next[k]-b[k])/(next[0]-b[0]||1),m0=slope*sl<=0?0:2*slope*sl/(slope+sl),m1=slope*sr<=0?0:2*slope*sr/(slope+sr);return (2*t*t*t-3*t*t+1)*a[k]+(t*t*t-2*t*t+t)*span*m0+(-2*t*t*t+3*t*t)*b[k]+(t*t*t-t*t)*span*m1;});}}return [0,0];}
 function bodySurface(u,v){const y=v*1.37,[rx,rz]=bodyRadius(y),theta=u*TAU;return new T.Vector3(Math.sin(theta)*rx,y,Math.cos(theta)*rz);}
 function faceZ(x,y){const [rx,rz]=bodyRadius(y);return Math.sqrt(Math.max(.02,1-x*x/(rx*rx)))*rz+.0015;}
 function crownSurface(rx,hy,rz,seams,seed=0){return(u,v)=>{
  const theta=u*TAU,h=v*2-1;
  let r=Math.pow(Math.max(0,1-Math.pow(Math.abs(h),2.6)),.41);
  // Cloth pillows gather into each stitched channel instead of separate little balls.
  let indent=0;
  for(const seam of seams){const curve=seam+.085*Math.sin((v-.1)*3.8+seed),distance=Math.atan2(Math.sin(theta-curve),Math.cos(theta-curve));indent+=Math.exp(-Math.pow(distance/.15,2))*.057;}
  const fold=(Math.sin(theta*23+Math.sin(v*4+seed))*.014+Math.sin(theta*37+v*2+seed)*.009)*Math.exp(-Math.pow((v-.14)/.18,2));
  r*=1-indent+fold;
  const irregular=1+.025*Math.sin(theta*3+seed)*Math.sin(v*Math.PI);
  return new T.Vector3(rx*Math.sin(theta)*r*irregular,hy*h+.012*Math.sin(theta*5+seed)*Math.sin(v*Math.PI),rz*Math.cos(theta)*r*(1+.023*Math.sin(theta*5+seed)));
 };}
 function makeHair(part,count,color,seed,length=.010){
  const g=part.geometry,p=g.attributes.position,n=g.attributes.normal,index=g.index?.array,triangles=index?index.length/3:p.count/3;
  const weights=new Float32Array(triangles),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3();let total=0;
  const vert=i=>index?index[i]:i;
  for(let i=0;i<triangles;i++){a.fromBufferAttribute(p,vert(i*3));b.fromBufferAttribute(p,vert(i*3+1));c.fromBufferAttribute(p,vert(i*3+2));total+=ab.subVectors(b,a).cross(ac.subVectors(c,a)).length()*.5;weights[i]=total;}
  const positions=new Float32Array(count*6),colors=new Float32Array(count*6),random=seeded(seed),base=new T.Color(color),normal=new T.Vector3(),na=new T.Vector3(),nb=new T.Vector3(),nc=new T.Vector3(),point=new T.Vector3(),tangent=new T.Vector3();
  for(let i=0;i<count;i++){
   const pick=random()*total;let lo=0,hi=triangles-1;while(lo<hi){const mid=(lo+hi)>>1;if(weights[mid]<pick)lo=mid+1;else hi=mid;}
   const ia=vert(lo*3),ib=vert(lo*3+1),ic=vert(lo*3+2);a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);na.fromBufferAttribute(n,ia);nb.fromBufferAttribute(n,ib);nc.fromBufferAttribute(n,ic);
   const sr=Math.sqrt(random()),u=1-sr,v=sr*(1-random()),w=1-u-v;point.copy(a).multiplyScalar(u).addScaledVector(b,v).addScaledVector(c,w);normal.copy(na).multiplyScalar(u).addScaledVector(nb,v).addScaledVector(nc,w).normalize();
   tangent.set(random()-.5,random()-.5,random()-.5).addScaledVector(normal,-normal.dot(tangent)).normalize();const len=length*(.4+random()*.8),tip=point.clone().addScaledVector(normal,len).addScaledVector(tangent,len*.33);
   point.addScaledVector(normal,.0007);positions.set(point.toArray(),i*6);positions.set(tip.toArray(),i*6+3);const shade=.88+random()*.24;
   colors.set([Math.min(1,base.r*shade),Math.min(1,base.g*shade),Math.min(1,base.b*shade),Math.min(1,base.r*shade),Math.min(1,base.g*shade),Math.min(1,base.b*shade)],i*6);
  }
  const hair=new T.BufferGeometry();hair.setAttribute('position',new T.BufferAttribute(positions,3));hair.setAttribute('color',new T.BufferAttribute(colors,3));
  const lines=new T.LineSegments(hair,new T.LineBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.18,depthWrite:false}));lines.name=part.name+' · kurzer Flor';lines.userData.fur=true;part.add(lines);return lines;
 }
 function stitchedCurve(parent,name,points,threadColor,radius=.0032,dashes=true){
  const m=new T.MeshStandardMaterial({color:threadColor,roughness:1}),curve=new T.CatmullRomCurve3(points);
  const seam=mesh(parent,name,new T.TubeGeometry(curve,Math.max(30,points.length*2),radius,5,false),m);seam.castShadow=false;
  if(dashes){const positions=[];for(let t=.01;t<.995;t+=.024){const p=curve.getPoint(t),n=curve.getTangent(t),cross=new T.Vector3(-n.y,n.x,.15).normalize().multiplyScalar(.006);positions.push(p.x-cross.x,p.y-cross.y,p.z+.001,p.x+cross.x,p.y+cross.y,p.z+.002);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));const stitches=new T.LineSegments(g,new T.LineBasicMaterial({color:threadColor}));stitches.name=name+' · Stiche';parent.add(stitches);
  }return seam;
 }
 function ellipsePatch(parent,name,x,y,rx,ry,color,depth=.010,angle=0){
  const positions=[],uv=[],indices=[],steps=64,rings=12;
  for(let j=0;j<=rings;j++)for(let i=0;i<=steps;i++){const a=i/steps*TAU,r=j/rings,dx=Math.cos(a)*rx*r,dy=Math.sin(a)*ry*r,xx=x+dx*Math.cos(angle)-dy*Math.sin(angle),yy=y+dx*Math.sin(angle)+dy*Math.cos(angle);positions.push(xx,yy,faceZ(xx,yy)+depth);uv.push((Math.cos(a)*r+1)/2,(Math.sin(a)*r+1)/2);if(j<rings&&i<steps){const k=j*(steps+1)+i;indices.push(k,k+steps+1,k+1,k+1,k+steps+1,k+steps+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const material=new T.MeshStandardMaterial({color,roughness:1,side:T.DoubleSide});const patch=mesh(parent,name,geo,material);patch.castShadow=false;
  const lines=[];for(let yy=-ry+.003;yy<ry;yy+=.0035){const half=rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry)));for(let xx=-half;xx<half;xx+=.011){const x1=x+xx,y1=y+yy,x2=x+Math.min(half,xx+.009);lines.push(x1,y1,faceZ(x1,y1)+depth+.0005,x2,y1+.001,faceZ(x2,y1)+depth+.0005);}}
  const threads=new T.BufferGeometry();threads.setAttribute('position',new T.Float32BufferAttribute(lines,3));const thread=new T.LineSegments(threads,new T.LineBasicMaterial({color:new T.Color(color).lerp(new T.Color(0xeeeecc),.008)}));thread.name=name+' · Stickgarn';parent.add(thread);return patch;
 }
 function embroideredStroke(parent,name,points,width){
  const curve=new T.CatmullRomCurve3(points),positions=[],indices=[],segments=64,sides=8;
  for(let i=0;i<=segments;i++){const t=i/segments,p=curve.getPoint(t),tangent=curve.getTangent(t),taper=.15+.85*Math.min(1,Math.sin(Math.PI*t)*8),dx=-tangent.y,dy=tangent.x;
   for(let j=0;j<=sides;j++){const a=j/sides*TAU,w=Math.cos(a)*width*taper,x=p.x+dx*w,y=p.y+dy*w;positions.push(x,y,faceZ(x,y)+.002+Math.sin(a)*.0035*taper);}
  }
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,a+1,b+1,b);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const stroke=mesh(parent,name,geometry,new T.MeshStandardMaterial({color:0x202125,roughness:1,side:T.DoubleSide}));stroke.castShadow=false;
  const thread=[];for(let t=.005;t<.995;t+=.013){const p=curve.getPoint(t),d=curve.getTangent(t),w=width*(.15+.85*Math.min(1,Math.sin(Math.PI*t)*8))*.88,x1=p.x-d.y*w,y1=p.y+d.x*w,x2=p.x+d.y*w,y2=p.y-d.x*w;thread.push(x1,y1,faceZ(x1,y1)+.0057,x2,y2,faceZ(x2,y2)+.0057);}
  const tg=new T.BufferGeometry();tg.setAttribute('position',new T.Float32BufferAttribute(thread,3));const stitches=new T.LineSegments(tg,new T.LineBasicMaterial({color:0x2a2a29}));stitches.name=name+' · einzelne Stickfäden';parent.add(stitches);
 }
 function createBroki(options={}){
  const detail=options.detail||'full',root=new T.Group();root.name='Broki · Kuschelfigur 04';const textures=clothTexture(512),green=fabric(OLIVE,textures),cream=fabric(CREAM,textures),greenLight=fabric(0x5cde32,textures),greenDark=fabric(0x43c524,textures);
  const pieces=[],fur=[];const sculpt=mesh(root,'Gelber Rumpf',surfaceGeometry(bodySurface,128,96),cream);pieces.push(sculpt);fur.push(makeHair(sculpt,detail==='full'?13000:4500,CREAM,19,.008));
  const neckSeams=[-.92,-.02,.93,2.2,3.14,4.15];
  function cushion(name,x,y,z,rx,hy,rz,seams,seed,material=green,hairs=6000){
   const fn=crownSurface(rx,hy,rz,seams,seed),o=mesh(root,name,surfaceGeometry(fn,144,72),material);o.position.set(x,y,z);pieces.push(o);
   fur.push(makeHair(o,detail==='full'?hairs:Math.round(hairs*.34),material.color.getHex(),seed*39+14,.010));
   for(let k=0;k<seams.length;k++){
    const points=[];for(let v=.08;v<=.93;v+=.025){const theta=seams[k]+.085*Math.sin((v-.1)*3.8+seed),u=((theta/TAU)%1+1)%1,p=fn(u,v);p.multiplyScalar(1.001);points.push(p);}
    stitchedCurve(o,name+' · Polsternaht '+k,points,new T.Color(material.color).multiplyScalar(.76).getHex(),.0030,false);
   }return o;
  }
  cushion('Unteres Kopfpolster',0,1.55,-.015,.61,.37,.53,neckSeams,1,greenDark,6500);
  cushion('Breite mittlere Polsterreihe',0,2.095,-.025,1.015,.49,.76,[-1.03,-.51,.10,.73,1.45,2.2,2.95,3.67,4.44,5.10],2,green,13000);
  cushion('Obere Polsterreihe',0,2.705,-.015,.78,.39,.63,[-.90,-.05,.77,1.63,2.5,3.20,4.1,5.07],3,greenLight,9000);
  cushion('Linkes oberes Seitenpolster',-.73,2.63,-.045,.30,.31,.40,[-.45,1.4,3.2,4.7],4,green,2500);
  cushion('Rechtes oberes Seitenpolster',.72,2.63,-.05,.30,.315,.40,[-.45,1.4,3.2,4.7],5,green,2500);
  cushion('Oberstes Rundpolster',0,3.165,-.035,.46,.33,.44,[-.25,1.5,3.1,4.7],6,greenLight,5000);
  for(const s of[-1,1])cushion((s<0?'Linkes':'Rechtes')+' tiefes Seitenpolster',s*.53,1.64,-.09,.29,.29,.41,[-.2,2,4],8+s,greenDark,2000);
  const arms=[];
  for(const s of[-1,1]){
   const joint=new T.Group();joint.name=s<0?'Linker Arm':'Rechter Arm';joint.position.set(s*.40,.83,0);root.add(joint);arms.push(joint);
   const path=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(s*.15,.065,.018),new T.Vector3(s*.31,.22,.025),new T.Vector3(s*.44,.355,.035)]);
   const arm=mesh(joint,'Weicher hochgezogener Arm',new T.TubeGeometry(path,36,.195,24,false),cream);pieces.push(arm);fur.push(makeHair(arm,detail==='full'?3000:1000,CREAM,39+s,.008));
   const handFn=(u,v)=>{const theta=u*TAU,phi=v*Math.PI,x=Math.sin(phi)*Math.sin(theta),y=-Math.cos(phi),z=Math.sin(phi)*Math.cos(theta),a=Math.atan2(y,x),lobe=1+.085*Math.cos(a*6+.3);return new T.Vector3(x*.455*lobe,y*.405*lobe,z*.33);};
   const hand=mesh(joint,'Runde grüne Plüschhand',surfaceGeometry(handFn,128,64),s<0?green:greenLight);hand.position.set(s*.72,.59,.075);hand.rotation.z=s*-.16;pieces.push(hand);fur.push(makeHair(hand,detail==='full'?6200:2200,OLIVE,51+s,.009));
   const seam=[];for(let a=0;a<=TAU+.001;a+=TAU/100){const r=1+.085*Math.cos(a*6+.3);seam.push(new T.Vector3(Math.cos(a)*.45*r,Math.sin(a)*.40*r,.012));}stitchedCurve(hand,'Naht der Plüschhand',seam,0x3b9f1d,.0035,false);
   const cuff=[];for(let a=0;a<=TAU+.01;a+=TAU/60){const p=new T.Vector3(Math.cos(a)*.16,Math.sin(a)*.16,0);p.applyAxisAngle(new T.Vector3(0,1,0),Math.PI/2);p.applyAxisAngle(new T.Vector3(0,0,1),s*.70);p.add(new T.Vector3(s*.40,.32,.035));cuff.push(p);}stitchedCurve(joint,'Armmanschette',cuff,0xd9b137,.0035);
  }
  // The photographed face is flat embroidery: no glossy eyes, nose or extra feet.
  const face=new T.Group();face.name='Aufgesticktes Gesicht';root.add(face);
  for(const s of[-1,1]){
   ellipsePatch(face,'Heller Augenrand',s*.18-.010,.975,.093,.107,0xf3ebd3,.002);
   ellipsePatch(face,'Schwarzes Stickauge',s*.18,.969,.079,.093,0x15171b,.004);
   ellipsePatch(face,'Rosa Wange',s*.322,.848,.061,.041,0xd87989,.003);
   const brow=[];for(let i=0;i<=12;i++){const t=i/12,x=s*(.278-.046*t),y=1.126+.046*t;brow.push(new T.Vector3(x,y,faceZ(x,y)+.001));}
   embroideredStroke(face,'Gestickte Augenbraue',brow,.012);
  }
  const smile=[];for(let i=0;i<=28;i++){const a=Math.PI+i/28*Math.PI,x=Math.cos(a)*.107,y=.794+Math.sin(a)*.088;smile.push(new T.Vector3(x,y,faceZ(x,y)+.001));}
  embroideredStroke(face,'U-förmiger Stickmund',smile,.014);
  const backSeam=[];for(let y=.075;y<=1.31;y+=.028){const r=bodyRadius(y);backSeam.push(new T.Vector3(.003+Math.sin(y*26)*.002,y,-r[1]-.002));}stitchedCurve(root,'Mittige Rückennaht',backSeam,0xd2a832,.0028);
  const bottomSeam=[];for(let a=0;a<=TAU+.001;a+=TAU/110){const y=.088+.007*Math.cos(a*2),r=bodyRadius(y);bottomSeam.push(new T.Vector3(Math.sin(a)*r[0]*1.002,y,Math.cos(a)*r[1]*1.002));}stitchedCurve(root,'Abgesetzte Bodennaht',bottomSeam,0xd7af35,.0024);
  root.userData={arms,fur,pieces,body:sculpt,detail,height:3.487,reference:'20260531_174428 / 174432 / 174451 / 174501 / 174513',note:'Aus fünf Fotos modelliert und auf Wunsch mit vollerem Kuschelvolumen überarbeitet; kein 3D-Scan. Maßstab ist relativ, nicht vermessen.'};
  return root;
 }
 root.BrokiPlush={create:createBroki,palette:{olive:OLIVE,cream:CREAM}};
})(window);
