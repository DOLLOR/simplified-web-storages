!(function(g){
	"use strict";
	const storage = {
		db:null,
		version:1,
		dataBaseName:'keyValueDatabase',
		/**@type {String[]} */
		tableList:[],
		size:10*1024*1024,
		/**
		 * 执行SQL事务
		 * @param {String} sql 
		 * @param {Array} args 
		 * @return {Promise}
		 */
		runTransaction(sql,args=[]){
			return new Promise((resolve,reject)=>{
				this.init();
				this.db.transaction(function (transaction){
					transaction.executeSql(
						sql,
						args,
						(transaction,resultSet)=>resolve(resultSet),
						(transaction,er)=>reject(er),
					);
				});
			});
		},
		/**
		 * 执行SQL事务
		 * @param {String[]} sqlList 
		 * @param {Array[]} argList 
		 * @return {Promise<any[]>}
		 */
		runSqlList(sqlList,argList=[]){
			let promiseList = [];
			for (let index = 0; index < sqlList.length; index++) {
				const sql = sqlList[index];
				const args = argList[index];
				promiseList.push(
					new Promise((resolve,reject)=>{
						this.db.transaction(function (transaction){
								transaction.executeSql(
									sql,
									args,
									(transaction,resultSet)=>resolve(resultSet),
									(transaction,er)=>reject(er),
								);
						});
					})
				);
			}
			return Promise.all(promiseList);
		},
		/**
		 * 初始化数据库
		 * @return {Promise}
		 */
		init(){
			if(this.db){
				return Promise.resolve();
			}else{
				this.db = openDatabase(this.dataBaseName,this.version,'key-value database',this.size);
				// initiate tables
				let sqlList = [];
				let tableList = this.tableList;
				for (let index = 0; index < tableList.length; index++) {
					const tableName = tableList[index];
					sqlList.push(`CREATE TABLE IF NOT EXISTS ${tableName} (k PRIMARY KEY, v, datatype)`);
				}
				return this.runSqlList(sqlList);
			}
		},
		/**
		 * 添加数据
		 * @param {String} tableName 
		 * @param {String} k 
		 * @param {String|Object} v
		 */
		setItem(tableName,k,v){
			let datatype = 'json';
			if(typeof v === typeof ''){
				datatype = 'string';
			}else{
				v = JSON.stringify(v);
			}
			return this.runTransaction(`REPLACE INTO ${tableName} (k, v, datatype) VALUES(?, ?, ?)`,[k,v,datatype]);
		},
		/**
		 * 获取数据
		 * @param {String} tableName 
		 * @param {String} k
		 * @return {Promise<String|Object>}
		 */
		getItem(tableName,k){
			return this.runTransaction(`SELECT v,datatype FROM ${tableName} WHERE k=?`,[k]).then(resultSet=>{
				if(resultSet.rows.length>0){
					let {v,datatype} = resultSet.rows[0];
					return datatype==='string' ? v : JSON.parse(v);
				}else{
					return null;
				}
			});
		},
		/**
		 * 获取所有key
		 * @param {String} tableName 
		 * @return {Promise<String[]>}
		 */
		keys(tableName){
			return this.runTransaction(`SELECT k FROM ${tableName}`).then(resultSet=>{
				let result = [];
				if(resultSet.rows.length>0){
					for(let i=0;
						i<resultSet.rows.length;
						i++
					){
						result.push(resultSet.rows[i].k);
					}
				}
				return result;
			});
		},
		/**
		 * 获取所有数据
		 * @param {String} tableName 
		 * @return {Promise}
		 */
		getAll(tableName){
			return this.runTransaction(`SELECT k,v,datatype FROM ${tableName}`).then(resultSet=>{
				let result = createMap();
				if(resultSet.rows.length>0){
					for(let i=0;
						i<resultSet.rows.length;
						i++
					){
						let {k,v,datatype} = resultSet.rows[i];
						v = datatype==='string' ? v : JSON.parse(v);
						result[k] = v;
					}
				}
				return result;
			});
		},
		/**
		 * 删除数据
		 * @param {String} tableName 
		 * @param {String} k
		 */
		removeItem(tableName,k){
			return this.runTransaction(`DELETE FROM ${tableName} WHERE k=?`,[k]);
		},
		/**
		 * 清空数据
		 * @param {String} tableName 
		 */
		clear(tableName){
			return this.runTransaction(`DELETE FROM ${tableName}`);
		},
		/**
		 * 删表
		 * @param {String} tableName 
		 */
		drop(tableName){
			return this.runTransaction(`DROP TABLE ${tableName}`);
		},
	};
	function W2K(
		dbName = storage.dataBaseName,
		tableList = storage.tableList,
		size = storage.size
	){
		if(!(this instanceof W2K)) return new W2K(dbName,tableList,size);
		this.dataBaseName = dbName;
		this.tableList = tableList;
		this.size = size;
	}
	W2K.prototype = storage;

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
		module.exports = W2K;
	}
	else if (typeof define === "function" && define.amd) {
		define(["require", "exports"], ()=>W2K);
	}else{
		g.Websql2kv = W2K;
	}
})(this);
