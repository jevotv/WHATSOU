"use strict";(()=>{var e={};e.id=6717,e.ids=[6717],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},25528:e=>{e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},19506:(e,t,a)=>{a.r(t),a.d(t,{headerHooks:()=>u,originalPathname:()=>x,requestAsyncStorage:()=>m,routeModule:()=>p,serverHooks:()=>c,staticGenerationAsyncStorage:()=>l,staticGenerationBailout:()=>d});var s={};a.r(s),a.d(s,{GET:()=>GET,dynamic:()=>i}),a(44388);var n=a(15789),o=a(74902),r=a(80941);let i="force-dynamic";async function GET(){let e=await (0,r.l)(),{data:t}=await e.from("stores").select("slug, updated_at").order("created_at",{ascending:!1}),a=`
    <sitemap>
      <loc>https://whatsou.com/main-sitemap.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  `,s=(t||[]).map(e=>`
      <sitemap>
        <loc>https://whatsou.com/${e.slug}/sitemap.xml</loc>
        <lastmod>${e.updated_at||new Date().toISOString()}</lastmod>
      </sitemap>
    `).join(""),n=`<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${a}
      ${s}
    </sitemapindex>
  `;return new Response(n,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, s-maxage=3600"}})}let p=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"route",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"D:\\whatsou\\apps\\web\\app\\sitemap.xml\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:l,serverHooks:c,headerHooks:u,staticGenerationBailout:d}=p,x="/sitemap.xml/route"},74902:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))}};var t=require("../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),a=t.X(0,[1861,2605,3926,7124,2379,941],()=>__webpack_exec__(19506));module.exports=a})();