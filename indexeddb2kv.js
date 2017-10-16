!(function(g){
	"use strict";
	/**@type {IDBFactory} */
	const indexedDB = g.indexedDB || g.webkitIndexedDB || g.mozIndexedDB || g.msIndexedDB;
	/**@type {Promise<IDBDatabase>} */
	let db;
	const version = 1;
	/**
	 * 
	 * @param {*} cb 
	 * @param {'readonly'|'readwrite'} mode 
	 */
	const runTransaction = function(cb,mode='readonly'){
		return new Promise(async(resolve,reject)=>{
			let transaction = (await db).transaction('keyValueTable',mode);
			transaction.onerror = reject;
			transaction.oncomplete = resolve;
			let store = transaction.objectStore('keyValueTable');
			cb(store);
		});
	};
	const storage = {
		/**
		 * 初始化数据库
		 * @return {Promise}
		 */
		init(){
			return new Promise((resolve,reject)=>{
				if(db){
					resolve();
				}else{
					db = new Promise(rs=>{
						let request = indexedDB.open('keyValueDatabase',version);
						request.onsuccess = function(e){
							rs(e.target.result);
							resolve(e);
						};
						request.onerror = reject;
						request.onupgradeneeded = function(e){
							let db = e.target.result;
							let store = db.createObjectStore("keyValueTable", {keyPath: "k"});
						};
					})
				}
			});
		},
		/**
		 * 添加数据
		 * @param {String} k 
		 * @param {String|Object} v
		 * @return {Promise}
		 */
		setItem(k,v){
			this.init();
			return runTransaction(store=>store.put({k,v}),'readwrite');
		},
		/**
		 * 获取数据
		 * @param {String} k
		 * @return {Promise<String|Object>}
		 */
		getItem(k){
			this.init();
			return new Promise(async (resolve,reject)=>{
				let request = (await db)
					.transaction('keyValueTable','readonly')
					.objectStore('keyValueTable')
				.get(k);
				request.onsuccess = function(){
					let result = null;
					if(event.target.result){
						result = event.target.result.v;
					}
					resolve(result);
				};
				request.onerror = reject;
			});
		},
		/**
		 * 删除数据
		 * @param {String} k
		 * @return {Promise}
		 */
		removeItem(k){
			this.init();
			return runTransaction(store=>store.delete(k),'readwrite');
		},
		/**
		 * 清空数据
		 * @return {Promise}
		 */
		clear(){
			this.init();
			return runTransaction(store=>store.clear());
		},
	};
	// output
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = storage;
	}
	else if (typeof define === "function" && define.amd) {
		define(["require", "exports"], ()=>storage);
	}else{
		g.indexeddb2kv = storage;
	}
})(this);
