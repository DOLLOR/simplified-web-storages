!(function(g){
	"use strict";
	/**@type {IDBFactory} */
	const indexedDB = g.indexedDB || g.webkitIndexedDB || g.mozIndexedDB || g.msIndexedDB;
	const storage = {
		/**@type {Promise<IDBDatabase>} */
		db:null,
		dataBaseName:'keyValueDatabase',
		/**@type {String[]} */
		tableList:[],
		/**
		 * runTransaction
		 * @param {(IDBObjectStore)=>*} cb 
		 * @param {'readonly'|'readwrite'} mode 
		 * @param {String} tableName
		 * @returns {Promise<Event>}
		 */
		runTransaction(cb,mode='readonly',tableName){
			return new Promise(async(resolve,reject)=>{
				this.init();
				let transaction = (await this.db).transaction(tableName,mode);
				transaction.onerror = reject;
				transaction.oncomplete = resolve;
				let store = transaction.objectStore(tableName);
				cb(store);
			});
		},
		/**
		 * runRequest
		 * @param {(IDBObjectStore)=>*} action 
		 * @param {'readonly'|'readwrite'} mode 
		 * @param {String} tableName
		 * @returns {Promise<*>}
		 */
		runRequest(action,mode='readonly',tableName){
			return new Promise((resolve,reject)=>{
				this.runTransaction(store=>{
					let request = action(store);
					request.onsuccess = resolve;
					request.onerror = reject;
				},mode,tableName);
			}).then(ev=>{
				if(ev.target.result){
					return ev.target.result;
				}else{
					return null;
				}
			});
		},
		/**
		 * 
		 * @param {(IDBDatabase)=>} cb 
		 */
		openDatabase(cb){
			return new Promise((resolve,reject)=>{
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
					cb(db);
				};
			});
		},
		/**
		 * 初始化数据库
		 */
		init(){
			if(this.db){
				return;
			}
			this.db = this.openDatabase(db=>{
				let tableList = this.tableList;
				// initiate stores
				for (let index = 0; index < tableList.length; index++) {
					const tableName = tableList[index];
					if(!db.objectStoreNames.contains(tableName)){
						db.createObjectStore(tableName, {keyPath: "k"});
					}
				}
			});
		},
		/**
		 * 添加数据
		 * @param {String} tableName 
		 * @param {String} k 
		 * @param {String|Object} v
		 */
		setItem(tableName,k,v){
			return this.runTransaction(store=>store.put({k,v}),'readwrite',tableName);
		},
		/**
		 * 获取数据
		 * @param {String} tableName 
		 * @param {String} k
		 */
		getItem(tableName,k){
			return this.runRequest(store=>store.get(k),undefined,tableName)
				.then(result=>result!=null?result.v:null);
		},
		/**
		 * 获取所有key
		 * @param {String} tableName 
		 * @return {Promise<String[]>}
		 */
		keys(tableName,query, count){
			return this.runRequest(store=>store.getAllKeys(query, count),undefined,tableName)
				.then(result=>result!=null?result:[]);
		},
		/**
		 * 获取所有数据
		 * @param {String} tableName 
		 * @return {Promise<any[]>}
		 */
		getAll(tableName,query, count){
			return this.runRequest(store=>store.getAll(query, count),undefined,tableName)
				.then(resultList=>{
					if(resultList==null) resultList = [];
					let result = createMap();
					for (let index = 0; index < resultList.length; index++) {
						const {k,v} = resultList[index];
						result[k] = v;
					}
					return result;
				});
		},
		/**
		 * 删除数据
		 * @param {String} tableName 
		 * @param {String} k
		 * @return {Promise}
		 */
		removeItem(tableName,k){
			return this.runTransaction(store=>store.delete(k),'readwrite',tableName);
		},
		/**
		 * 清空数据
		 * @return {Promise}
		 */
		clear(tableName){
			return this.runTransaction(store=>store.clear(),'readwrite',tableName);
		},
		/**
		 * 关闭连接
		 */
		close(){
			if(!this.db) return Promise.resolve();
			return this.db.then(db=>{
				this.db = null;
				return db.close();
			});
		},
		/**
		 * 删库
		 * @returns {Promise<Event>}
		 */
		drop(tableName){
			return new Promise(async (resolve,reject)=>{
				if(tableName == null){
					// delete database
					let request = indexedDB.deleteDatabase(this.dataBaseName);
					request.onsuccess = resolve;
					request.onerror = reject;
					this.close();
				}else{
					// database is opened, and it doesn't contain it
					if(this.db && !(await this.db).objectStoreNames.contains(tableName)){
						resolve();
						return;
					}
					await this.close();

					//re-open database and delete the store
					this.db = this.openDatabase(db=>{
						if(db.objectStoreNames.contains(tableName)){
							db.deleteObjectStore(tableName);
						}
					});
					await this.db;
					resolve();
				}
			});
		},
	};

	function I2K(
		dbName = storage.dataBaseName,
		tableList = storage.tableList,
	){
		if(!(this instanceof I2K)) return new I2K(dbName,tableList);
		this.dataBaseName = dbName;
		this.tableList = tableList;
	}
	I2K.prototype = storage;

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
		module.exports = I2K;
	}
	else if (typeof define === "function" && define.amd) {
		define(["require", "exports"], ()=>I2K);
	}else{
		g.Indexeddb2kv = I2K;
	}
})(this);
