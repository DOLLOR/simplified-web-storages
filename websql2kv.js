!(function(g){
	"use strict";
	const storage = {
		db:null,
		version:1,
		dataBaseName:'keyValueDatabase',
		tableName:'keyValueTable',
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
		/**
		 * 初始化数据库
		 * @return {Promise}
		 */
		init(){
			if(this.db){
				return Promise.resolve();
			}else{
				this.db = openDatabase(this.dataBaseName,this.version,'key-value database',this.size);
				return this.runTransaction(`CREATE TABLE IF NOT EXISTS ${this.tableName} (k PRIMARY KEY, v, datatype)`);
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
	function W2K(dbName=storage.dataBaseName,tbName=storage.tableName,size=storage.size){
		if(!this) return new W2K(dbName,tbName);
		this.dataBaseName = dbName;
		this.tableName = tbName;
		this.size = size;
	}
	W2K.prototype = storage;
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
