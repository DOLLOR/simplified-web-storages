!(function(g){
	"use strict";
	/**@type {IDBFactory} */
	const indexedDB = g.indexedDB || g.webkitIndexedDB || g.mozIndexedDB || g.msIndexedDB;
	const storage = {
		/**@type {Promise<IDBDatabase>} */
		db:null,
		dataBaseName:'keyValueDatabase',
		tableName:'keyValueTable',
		/**
		 * runTransaction
		 * @param {*} cb 
		 * @param {'readonly'|'readwrite'} mode 
		 */
		runTransaction(cb,mode='readonly'){
			return new Promise(async(resolve,reject)=>{
				let transaction = (await this.db).transaction(this.tableName,mode);
				transaction.onerror = reject;
				transaction.oncomplete = resolve;
				let store = transaction.objectStore(this.tableName);
				cb(store);
			});
		},
		/**
		 * 初始化数据库
		 * @return {Promise}
		 */
		init(){
			if(this.db){
				return;
			}
			this.db = new Promise((resolve,reject)=>{
				let request = indexedDB.open(this.dataBaseName,+new Date());
				request.onsuccess = (e)=>{
					resolve(e.target.result);
				};
				request.onerror = (e)=>{
					console.log(e.target.error);
					reject(e.target.error);
				};
				request.onupgradeneeded = (e)=>{
					/**@type {IDBDatabase} */
					let db = e.target.result;
					if(!db.objectStoreNames.contains(this.tableName)){
						db.createObjectStore(this.tableName, {keyPath: "k"});
					}
				};
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
			return this.runTransaction(store=>store.put({k,v}),'readwrite');
		},
		/**
		 * 获取数据
		 * @param {String} k
		 * @return {Promise<String|Object>}
		 */
		getItem(k){
			this.init();
			return new Promise((resolve,reject)=>{
				this.runTransaction(store=>{
					let request = store.get(k);
					request.onsuccess = ()=>{
						let result = null;
						if(request.result){
							result = request.result.v;
						}
						resolve(result);
					};
					request.onerror = reject;
				});
			});
		},
		/**
		 * 获取所有key
		 */
		keys(query, count){
			this.init();
			return new Promise((resolve,reject)=>{
				this.runTransaction(store=>{
					let request = store.getAllKeys(query, count);
					request.onsuccess = ()=>{
						let result = null;
						if(request.result){
							result = request.result;
						}
						resolve(result);
					};
					request.onerror = reject;
				});
			});
		},
		/**
		 * 删除数据
		 * @param {String} k
		 * @return {Promise}
		 */
		removeItem(k){
			this.init();
			return this.runTransaction(store=>store.delete(k),'readwrite');
		},
		/**
		 * 清空数据
		 * @return {Promise}
		 */
		clear(){
			this.init();
			return this.runTransaction(store=>store.clear(),'readwrite');
		},
		/**
		 * 关闭连接
		 */
		close(){
			if(!this.db) return;
			this.db.then(db=>db.close());
		},
		/**
		 * 删库
		 */
		drop(){
			indexedDB.deleteDatabase(this.dataBaseName);
			this.close();
		},
	};

	function I2K(dbName=storage.dataBaseName,tbName=storage.tableName){
		if(!this) return new I2K(dbName,tbName);
		this.dataBaseName = dbName;
		this.tableName = tbName;
	}
	I2K.prototype = storage;
	// output
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = I2K;
	}
	else if (typeof define === "function" && define.amd) {
		define(["require", "exports"], ()=>I2K);
	}else{
		g.Indexeddb2kv = I2K;
	}
})(this);
