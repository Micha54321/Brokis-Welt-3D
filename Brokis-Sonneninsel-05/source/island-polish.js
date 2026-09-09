/* Visual-only refinement. Terrain, routes, collision bounds and the player remain intact. */
(function(root){'use strict';const T=THREE,TAU=Math.PI*2;
function enhance(island,scene){const world=island.world,wind={value:0};let seed=341;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const batches=new Map(),dummy=new T.Object3D();
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.95,...extra});
 const add=(key,geo,material,x,y,z,sx,sy,sz,angle=0,color=null)=>{if(!batches.has(key))batches.set(key,{geo,material,items:[]});dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,angle,0);dummy.updateMatrix();batches.get(key).items.push({matrix:dummy.matrix.clone(),color});};
 function breeze(material,strength){const previous=material.onBeforeCompile;material.onBeforeCompile=shader=>{if(previous)previous.call(material,shader);shader.uniforms.uMeadowTime=wind;shader.vertexShader='uniform float uMeadowTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float phase=0.;
 #ifdef USE_INSTANCING
 phase=instanceMatrix[3].x*.47+instanceMatrix[3].z*.31;
 #endif
 float bend=max(0.,position.y+.2);transformed.x+=sin(uMeadowTime*.9+phase+position.y*.5)*${strength.toFixed(4)}*bend;transformed.z+=cos(uMeadowTime*.7+phase)*${(strength*.35).toFixed(4)}*bend;`);};material.customProgramCacheKey=()=>`meadow-${strength}`;material.needsUpdate=true;}
 // Rounded plank edges catch the light; the deck footprints do not change.
 const bevelCache=new Map();function roundedPlank(w,h,d){const key=[w,h,d].join(',');if(bevelCache.has(key))return bevelCache.get(key);const b=.018,r=.02,x=-w/2+b,y=-h/2+b,W=w-b*2,H=h-b*2,s=new T.Shape();s.moveTo(x+r,y);s.lineTo(x+W-r,y);s.quadraticCurveTo(x+W,y,x+W,y+r);s.lineTo(x+W,y+H-r);s.quadraticCurveTo(x+W,y+H,x+W-r,y+H);s.lineTo(x+r,y+H);s.quadraticCurveTo(x,y+H,x,y+H-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:d-2*b,steps:1,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*b)/2);bevelCache.set(key,g);return g;}
 world.traverse(o=>{if(o.name==='Stegplanke'||o.name==='Brückenplanke'){const p=o.geometry.parameters,old=o.geometry;o.geometry=roundedPlank(p.width,p.height,p.depth);old.dispose();}if(o.name==='canopies')breeze(o.material,.022);if(o.name==='grass')breeze(o.material,.14);});
 // Fine, broad mineral patches replace the uniformly colored rock faces.
 const stoneCanvas=document.createElement('canvas');stoneCanvas.width=stoneCanvas.height=256;const sc=stoneCanvas.getContext('2d');sc.fillStyle='#e8e6df';sc.fillRect(0,0,256,256);for(let i=0;i<600;i++){const x=random()*256,y=random()*256,r=3+random()*22,g=sc.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%3?'rgba(120,130,121,.10)':'rgba(255,246,209,.20)');g.addColorStop(1,'rgba(200,200,190,0)');sc.fillStyle=g;sc.fillRect(x-r,y-r,r*2,r*2);}const stoneMap=new T.CanvasTexture(stoneCanvas);stoneMap.colorSpace=T.SRGBColorSpace;stoneMap.anisotropy=4;
 const stones=world.getObjectByName('rocks');if(stones){stones.material.map=stoneMap;stones.material.needsUpdate=true;}
 // Soft contact shade follows the real terrain, avoiding floating shadow planes.
 const shadeCanvas=document.createElement('canvas');shadeCanvas.width=shadeCanvas.height=128;const sh=shadeCanvas.getContext('2d'),gradient=sh.createRadialGradient(64,64,5,64,64,63);gradient.addColorStop(0,'rgba(36,62,24,.45)');gradient.addColorStop(.35,'rgba(36,62,24,.24)');gradient.addColorStop(1,'rgba(36,62,24,0)');sh.fillStyle=gradient;sh.fillRect(0,0,128,128);const shadowMat=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadeCanvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const sp=[],su=[],si=[];
 function shade(x,z,r){const n=8,start=sp.length/3;for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const xx=x+(i/n-.5)*r*2,zz=z+(j/n-.5)*r*2;sp.push(xx,island.height(xx,zz)+.018,zz);su.push(i/n,j/n);}for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=start+j*(n+1)+i,b=a+n+1;si.push(a,b,a+1,a+1,b,b+1);}}
 for(const [x,z,r]of[[-10,6,2.9],[11,-3.8,2.4],[-8.4,-8.1,1.6],[2,-12.8,1.7],[-10.8,11.5,1.1],[8.5,6.9,1.1],[6.1,10.1,.75],[-5.4,3.8,.8],[11.7,2.9,.85],[-7.1,-3.6,.8],[6,-10,1.5],[8.5,8,.9],[-8.4,10.4,1.1]])shade(x,z,r);
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setAttribute('uv',new T.Float32BufferAttribute(su,2));sg.setIndex(si);const shadows=new T.Mesh(sg,shadowMat);shadows.name='Weiche Bodenschatten';shadows.renderOrder=1;world.add(shadows);
 // Broad, curved leaf rosettes and small ferns add detail in selected groups.
 const positions=[],normColors=[],indices=[];for(let leaf=0;leaf<7;leaf++){const angle=leaf/7*TAU,dx=Math.cos(angle),dz=Math.sin(angle),nx=-dz,nz=dx,base=positions.length/3;for(let j=0;j<=8;j++){const t=j/8,w=Math.sin(t*Math.PI)*.16,reach=t*.62,y=Math.sin(t*Math.PI*.80)*.58;for(const s of[-1,0,1]){positions.push(dx*reach+nx*w*s,y+(s===0?.035*Math.sin(t*Math.PI):0),dz*reach+nz*w*s);const c=new T.Color().lerpColors(new T.Color(0x397a30),new T.Color(0x8fc44a),t);normColors.push(c.r,c.g,c.b);}}for(let j=0;j<8;j++)for(let k=0;k<2;k++){const a=base+j*3+k,b=a+3;indices.push(a,a+1,b,a+1,b+1,b);}}
 const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));leafGeo.setAttribute('color',new T.Float32BufferAttribute(normColors,3));leafGeo.setIndex(indices);leafGeo.computeVertexNormals();const leafMat=mat(0xffffff,{vertexColors:true,side:T.DoubleSide});breeze(leafMat,.065);
 const centers=[[-12.2,7.5],[-10.8,10],[-7.8,11.4],[-5.8,12.1],[6.9,10.5],[9.1,7.4],[12.5,1.5],[10.2,-5.8],[7.5,-8.2],[-6.1,-4.6],[-5.4,-9.5],[4.6,-11.7]];
 for(const [cx,cz]of centers)for(let j=0;j<4;j++){const x=cx+(random()-.5)*1.6,z=cz+(random()-.5)*1.6;if(island.pathDistance(x,z)<1.65||!island.canStand(x,z,.05))continue;const s=.5+random()*.6;add('Blattrosetten',leafGeo,leafMat,x,island.height(x,z)+.02,z,s,s,s,random()*TAU);}
 const petalGeo=new T.SphereGeometry(1,8,5),petalMat=mat(0xffffff),centerMat=mat(0xe8b43a),stalkMat=mat(0x65913a),stalkGeo=new T.CylinderGeometry(.012,.016,1,5);
 const flowerColors=[0xffe66b,0xffed93,0xf6b3ba,0xfff9dd];
 for(const [cx,cz]of centers)for(let j=0;j<10;j++){const x=cx+(random()-.5)*2.5,z=cz+(random()-.5)*2.3;if(island.pathDistance(x,z)<1.60||!island.canStand(x,z,.05)||Math.abs(z-island.streamZ(x))<2.4)continue;const h=.16+random()*.22,y=island.height(x,z),r=.11+random()*.035,color=new T.Color(flowerColors[Math.floor(random()*flowerColors.length)]);add('Blütenstiele',stalkGeo,stalkMat,x,y+h/2,z,1,h,1);for(let k=0;k<5;k++){const a=k/5*TAU;add('Wiesenblüten',petalGeo,petalMat,x+Math.cos(a)*r*.65,y+h,z+Math.sin(a)*r*.65,r*.57,.03,r*.42,-a,color);}add('Blütenherzen',petalGeo,centerMat,x,y+h+.017,z,r*.34,.035,r*.34);}
 // Delicate clover patches break up broad empty areas without filling the paths.
 const cloverMat=mat(0x9bc653,{side:T.DoubleSide});for(let k=0;k<600;k++){const x=(random()-.5)*32,z=(random()-.5)*30;if(island.pathDistance(x,z)<1.5||!island.canStand(x,z,.02)||island.inland(x,z)<3||Math.abs(z-island.streamZ(x))<2.4)continue;if(random()>.45)continue;const y=island.height(x,z)+.045,r=.06+random()*.03;for(let j=0;j<3;j++){const a=j/3*TAU;add('Kleine Kleeblätter',petalGeo,cloverMat,x+Math.cos(a)*r*.65,y,z+Math.sin(a)*r*.65,r,.016,r*.7,a);}}
 for(const [name,b]of batches){const obj=new T.InstancedMesh(b.geo,b.material,b.items.length);obj.name=name;b.items.forEach((v,i)=>{obj.setMatrixAt(i,v.matrix);if(v.color)obj.setColorAt(i,v.color);});obj.castShadow=false;obj.receiveShadow=true;obj.computeBoundingSphere();world.add(obj);}
 // A depth-colored sea with moving caustics, wave normals, sky reflection and broken foam.
 const water=island.water.ocean,uniforms=island.water.uniforms;
 water.material.fragmentShader=`precision highp float;varying vec3 world;uniform float time;uniform sampler2D ground;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float waves(vec2 p){return sin(p.x*.63+p.y*.31+time*.75)*.028+sin(p.x*1.47-p.y*.80-time*.57)*.014+noise(p*.9+time*.04)*.04;}
 float caustics(vec2 p){vec2 i=floor(p),f=fract(p);float a=9.,b=9.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y)),h=vec2(hash(i+g),hash(i+g+17.));vec2 point=g+.5+.30*sin(time*.45+6.283*h)-f;float d=dot(point,point);if(d<a){b=a;a=d;}else b=min(b,d);}return 1.-smoothstep(.025,.10,b-a);}
 void main(){vec2 uv=(world.xz+vec2(24.))/vec2(48.,52.);float bed=-2.8;if(uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.)bed=texture2D(ground,uv).r*10.-3.;float depth=max(0.,.18-bed),n=noise(world.xz*.57+vec2(time*.035,-time*.024));
 vec3 color=mix(vec3(.085,.65,.52),vec3(.017,.27,.47),smoothstep(.10,2.8,depth));color+=vec3(.012,.034,.035)*(n-.5);float c=caustics(world.xz*1.7+vec2(time*.07,0.)+vec2(n*.7));color+=vec3(.17,.22,.17)*c*(1.-smoothstep(.1,2.6,depth))*.30;
 float e=.12,h=waves(world.xz);vec3 normal=normalize(vec3((h-waves(world.xz+vec2(e,0.)))/e,1.,(h-waves(world.xz+vec2(0.,e)))/e));vec3 view=normalize(cameraPosition-world),light=normalize(vec3(-.4,.86,.31)),halfway=normalize(light+view);float fresnel=pow(1.-max(dot(view,normal),0.),4.);color=mix(color,vec3(.39,.69,.84),fresnel*.4);float glint=pow(max(dot(normal,halfway),0.),180.);color+=vec3(.95,.87,.65)*glint*.20;
 float edge=(1.-smoothstep(.02,.22+n*.10,depth))*.55,ring=pow(max(0.,sin(depth*17.-time*1.3+n*5.)),12.)*(1.-smoothstep(.02,.9,depth))*.4;color=mix(color,vec3(.87,.98,.88),min(.73,edge+ring));float ripple=pow(max(0.,sin(world.x*2.1+world.z*2.9+n*7.-time*.65)),18.)*.010;color+=ripple;float fog=1.-exp(-length(cameraPosition-world)*.0006);color=mix(color,vec3(.26,.50,.67),fog);gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;water.material.needsUpdate=true;
 const foam=world.getObjectByName('foam');if(foam){foam.material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:uniforms.time},vertexShader:`varying vec2 v;void main(){v=uv;vec4 p=vec4(position,1.);
 #ifdef USE_INSTANCING
 p=instanceMatrix*p;
 #endif
 gl_Position=projectionMatrix*modelViewMatrix*p;}`,fragmentShader:`varying vec2 v;uniform float time;void main(){vec2 p=(v-.5)*2.;float a=atan(p.y,p.x),r=length(p),fade=smoothstep(.91,.935,r)*(1.-smoothstep(.975,1.,r)),broken=smoothstep(-.55,.6,sin(a*4.+sin(a*7.)-time*.55));gl_FragColor=vec4(.9,.98,.92,fade*broken*.40);}`});}
 return{update:t=>{wind.value=t;},stats:{decorativeBatches:batches.size}};
}
root.IslandPolish={enhance};
})(window);
