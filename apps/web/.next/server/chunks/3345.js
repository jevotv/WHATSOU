"use strict";exports.id=3345,exports.ids=[3345],exports.modules={25584:(e,r,a)=>{var t=a(52065);let n=t.registerPlugin("AppLauncher",{web:()=>Promise.resolve().then(function(){return h}).then(e=>new e.AppLauncherWeb)});let AppLauncherWeb=class AppLauncherWeb extends t.WebPlugin{async canOpenUrl(e){return{value:!0}}async openUrl(e){return window.open(e.url,"_blank"),{completed:!0}}};var h=Object.freeze({__proto__:null,AppLauncherWeb:AppLauncherWeb});r.h=n},30636:(e,r,a)=>{var t=a(52065);let n=t.registerPlugin("Share",{web:()=>Promise.resolve().then(function(){return h}).then(e=>new e.ShareWeb)});let ShareWeb=class ShareWeb extends t.WebPlugin{async canShare(){return"undefined"!=typeof navigator&&navigator.share?{value:!0}:{value:!1}}async share(e){if("undefined"==typeof navigator||!navigator.share)throw this.unavailable("Share API not available in this browser");return await navigator.share({title:e.title,text:e.text,url:e.url}),{}}};var h=Object.freeze({__proto__:null,ShareWeb:ShareWeb});r.m=n},18590:(e,r,a)=>{a.d(r,{Z:()=>n});var t=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t.Z)("Crown",[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]])},78611:(e,r,a)=>{a.d(r,{Z:()=>n});var t=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t.Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},24850:(e,r,a)=>{a.d(r,{Z:()=>n});var t=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t.Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},67782:(e,r,a)=>{a.d(r,{Z:()=>n});var t=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t.Z)("Smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]])},51779:(e,r,a)=>{a.d(r,{Z:()=>n});var t=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,t.Z)("SquarePlus",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]])}};