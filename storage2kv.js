!(function(g){
	"use strict";
	let actions = ['clear','getItem','removeItem','setItem'];
	let stroages = ['localStorage','sessionStorage'];
	let out = {
		/**@type{Storage} */
		localStorage:{
			storageAPI:localStorage
		},
		/**@type{Storage} */
		sessionStorage:{
			storageAPI:sessionStorage
		},
	};

	stroages.forEach(storage=>{
		actions.forEach(action=>{
			out[storage][action] = function(...args){
				try{
					return this.storageAPI[action](...args);
				}catch(er){
					console.error(er);
					return null;
				}
			};
			out[storage].setJSON = function(key,obj){
				return this.setItem(key,JSON.stringify(obj));
			};
			out[storage].getJSON = function(key,obj){
				return JSON.parse(this.getItem(key));
			};
			out[storage].keys = function(){
				return Object.keys(this.storageAPI);
			};
			out[storage].getAll = function(){
				return Object.assign(createMap(),this.storageAPI);
			};
		});
	});

	let createMap = function(){
		let fun1 = function(){
			return Object.create(null);
		};

		let fun2 = function(){
			return {};
		};

		try{
			createMap = fun1;
			return createMap();
		}catch(er){
			createMap = fun2;
			return createMap();
		}
	};

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
