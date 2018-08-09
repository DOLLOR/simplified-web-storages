!(function(g){
	"use strict";
	const storage = {
		db:null,
		version:1,
		dataBaseName:'keyValueDatabase',
		tableName:'keyValueTable',
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
				let tableList = this.tableList.concat(this.tableName);
				for (let index = 0; index < tableList.length; index++) {
					const tableName = tableList[index];
					sqlList.push(`CREATE TABLE IF NOT EXISTS ${tableName} (k PRIMARY KEY, v, datatype)`);
				}
				return this.runSqlList(sqlList);
			}
		},
		/**
		 * 添加数据
		 * @param {String} k 
		 * @param {String|Object} v
		 * @return {Promise}
		 */
		setItem(k,v){
			this.init();
			let datatype = 'json';
			if(typeof v === typeof ''){
				datatype = 'string';
			}else{
				v = JSON.stringify(v);
			}
			return this.runTransaction(`REPLACE INTO ${this.tableName} (k, v, datatype) VALUES(?, ?, ?)`,[k,v,datatype]);
		},
		/**
		 * 获取数据
		 * @param {String} k
		 * @return {Promise<String|Object>}
		 */
		getItem(k){
			this.init();
			return this.runTransaction(`SELECT v,datatype FROM ${this.tableName} WHERE k=?`,[k]).then(resultSet=>{
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
		 * @return {Promise<String[]>}
		 */
		keys(){
			this.init();
			return this.runTransaction(`SELECT k FROM ${this.tableName}`).then(resultSet=>{
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
		 * @return {Promise}
		 */
		getAll(){
			this.init();
			return this.runTransaction(`SELECT k,v,datatype FROM ${this.tableName}`).then(resultSet=>{
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
		 * @param {String} k
		 * @return {Promise}
		 */
		removeItem(k){
			this.init();
			return this.runTransaction(`DELETE FROM ${this.tableName} WHERE k=?`,[k]);
		},
		/**
		 * 清空数据
		 * @return {Promise}
		 */
		clear(){
			this.init();
			return this.runTransaction(`DELETE FROM ${this.tableName}`);
		},
		/**
		 * 删表
		 */
		drop(){
			this.init();
			return this.runTransaction(`DROP TABLE ${this.tableName}`);
		},
	};
	function W2K(
		dbName = storage.dataBaseName,
		tbName = storage.tableName,
		tableList = storage.tableList,
		size = storage.size
	){
		if(!this) return new W2K(dbName,tbName,tableList,size);
		this.dataBaseName = dbName;
		this.tableName = tbName;
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
