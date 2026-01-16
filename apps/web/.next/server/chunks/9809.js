"use strict";exports.id=9809,exports.ids=[9809],exports.modules={40357:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n.Z)("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]])},84399:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n.Z)("Infinity",[["path",{d:"M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z",key:"1z0uae"}]])},93064:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n.Z)("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]])},65290:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n.Z)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]])},83382:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(72023);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n.Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},12209:(e,t,a)=>{a.d(t,{Fw:()=>M,fC:()=>C,wy:()=>x});var n=a(78726),r=a(71193),i=a(70752),l=a(29520),o=a(6007),d=a(57754),s=a(64049),p=a(77602),u=a(27098),c=a(84196),y="Collapsible",[h,f]=(0,i.b)(y),[v,m]=h(y),b=n.forwardRef((e,t)=>{let{__scopeCollapsible:a,open:r,defaultOpen:i,disabled:o,onOpenChange:d,...p}=e,[y=!1,h]=(0,l.T)({prop:r,defaultProp:i,onChange:d});return(0,c.jsx)(v,{scope:a,disabled:o,contentId:(0,u.M)(),open:y,onOpenToggle:n.useCallback(()=>h(e=>!e),[h]),children:(0,c.jsx)(s.WV.div,{"data-state":getState(y),"data-disabled":o?"":void 0,...p,ref:t})})});b.displayName=y;var g="CollapsibleTrigger",x=n.forwardRef((e,t)=>{let{__scopeCollapsible:a,...n}=e,i=m(g,a);return(0,c.jsx)(s.WV.button,{type:"button","aria-controls":i.contentId,"aria-expanded":i.open||!1,"data-state":getState(i.open),"data-disabled":i.disabled?"":void 0,disabled:i.disabled,...n,ref:t,onClick:(0,r.M)(e.onClick,i.onOpenToggle)})});x.displayName=g;var k="CollapsibleContent",M=n.forwardRef((e,t)=>{let{forceMount:a,...n}=e,r=m(k,e.__scopeCollapsible);return(0,c.jsx)(p.z,{present:a||r.open,children:({present:e})=>(0,c.jsx)(Z,{...n,ref:t,present:e})})});M.displayName=k;var Z=n.forwardRef((e,t)=>{let{__scopeCollapsible:a,present:r,children:i,...l}=e,p=m(k,a),[u,y]=n.useState(r),h=n.useRef(null),f=(0,d.e)(t,h),v=n.useRef(0),b=v.current,g=n.useRef(0),x=g.current,M=p.open||u,Z=n.useRef(M),C=n.useRef();return n.useEffect(()=>{let e=requestAnimationFrame(()=>Z.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,o.b)(()=>{let e=h.current;if(e){C.current=C.current||{transitionDuration:e.style.transitionDuration,animationName:e.style.animationName},e.style.transitionDuration="0s",e.style.animationName="none";let t=e.getBoundingClientRect();v.current=t.height,g.current=t.width,Z.current||(e.style.transitionDuration=C.current.transitionDuration,e.style.animationName=C.current.animationName),y(r)}},[p.open,r]),(0,c.jsx)(s.WV.div,{"data-state":getState(p.open),"data-disabled":p.disabled?"":void 0,id:p.contentId,hidden:!M,...l,ref:f,style:{"--radix-collapsible-content-height":b?`${b}px`:void 0,"--radix-collapsible-content-width":x?`${x}px`:void 0,...e.style},children:M&&i})});function getState(e){return e?"open":"closed"}var C=b}};