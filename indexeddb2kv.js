!(function(g){
	"use strict";
	/**@type {IDBFactory} */
	const indexedDB = g.indexedDB || g.webkitIndexedDB || g.mozIndexedDB || g.msIndexedDB;
	const storage = {
		/**@type {Promise<IDBDatabase>} */
		db:null,
		dataBaseName:'keyValueDatabase',
		tableName:'keyValueTable',
		tableList:[],
		/**
		 * runTransaction
		 * @param {(IDBObjectStore)=>*} cb 
		 * @param {'readonly'|'readwrite'} mode 
		 * @param {String} tableName
		 */
		runTransaction(cb,mode='readonly',tableName=this.tableName){
			return new Promise(async(resolve,reject)=>{
				let transaction = (await this.db).transaction(tableName,mode);
				transaction.onerror = reject;
				transaction.oncomplete = resolve;
				let store = transaction.objectStore(tableName);
				cb(store);
			});
		},
		runRequest(action,mode='readonly',tableName=this.tableName){
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
		 * 初始化数据库
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
					let tableList = this.tableList.concat(this.tableName);
					// initiate stores
					for (let index = 0; index < tableList.length; index++) {
						const tableName = tableList[index];
						if(!db.objectStoreNames.contains(tableName)){
							db.createObjectStore(tableName, {keyPath: "k"});
						}
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
			return this.runRequest(store=>store.get(k))
				.then(result=>result!=null?result.v:null);
		},
		/**
		 * 获取所有key
		 * @return {Promise<String[]>}
		 */
		keys(query, count){
			this.init();
			return this.runRequest(store=>store.getAllKeys(query, count))
				.then(result=>result!=null?result:[]);
		},
		/**
		 * 获取所有数据
		 * @return {Promise}
		 */
		getAll(query, count){
			this.init();
			return this.runRequest(store=>store.getAll(query, count))
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

	function I2K(
		dbName = storage.dataBaseName,
		tbName = storage.tableName,
		tableList = storage.tableList,
	){
		if(!this) return new I2K(dbName,tbName,tableList);
		this.dataBaseName = dbName;
		this.tableName = tbName;
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
