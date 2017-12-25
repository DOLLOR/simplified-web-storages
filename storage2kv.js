!(function(g){
	"use strict";
	let actions = ['clear','getItem','removeItem','setItem'];
	let out = {
		/**@type{Storage} */
		localStorage:{},
		/**@type{Storage} */
		sessionStorage:{},
	}
	actions.forEach(i=>{
		out.localStorage[i] = function(...args){
			try{
				return localStorage[i](...args);
			}catch(er){
				console.error(er);
				return null;
			}
		};
		out.sessionStorage[i] = function(...args){
			try{
				return sessionStorage[i](...args);
			}catch(er){
				console.error(er);
				return null;
			}
		};
	});
	// output
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = out;
	}
	else if (typeof define === "function" && define.amd) {
		define(["require", "exports"], ()=>out);
	}else{
		g.storage2kv = out;
	}
})(this);
