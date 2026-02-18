const fs=require("fs");
const p=require("path");
const b=String.fromCharCode(91);
const e=String.fromCharCode(93);
const d=b+"id"+e;
["appointments","coding-suggestions","nursing-tasks"].forEach(r=>{
  fs.mkdirSync(p.join("src","app","api",r,d),{recursive:true});
});
console.log("dirs created");
