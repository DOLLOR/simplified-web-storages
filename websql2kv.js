!(function(g){
	"use strict";
	let db;
	const version = 1;
	/**
	 * 执行SQL事务
	 * @param {String} sql 
	 * @param {Array} args 
	 * @return {Promise}
	 */
	const runTransaction = function(sql,args=[]){
		return new Promise((resolve,reject)=>{
			db.transaction(function (transaction){
				transaction.executeSql(
					sql,
					args,
					(transaction,resultSet)=>resolve(resultSet),
					(transaction,er)=>reject(er),
				);
			});
		});
	};
	const storage = {
		/**
		 * 初始化数据库
		 * @return {Promise}
		 */
		init(){
			if(db){
				return Promise.resolve();
			}else{
				db = openDatabase('keyValueDatabase',version,'key-value database',10*1024*1024);
				return runTransaction('CREATE TABLE IF NOT EXISTS keyValueTable (k PRIMARY KEY, v, datatype)');
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
			return runTransaction('REPLACE INTO keyValueTable (k, v, datatype) VALUES(?, ?, ?)',[k,v,datatype]);
		},
		/**
		 * 获取数据
		 * @param {String} k
		 * @return {Promise<String|Object>}
		 */
		getItem(k){
			this.init();
			return runTransaction('SELECT v,datatype FROM keyValueTable WHERE k=?',[k]).then(resultSet=>{
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
			return runTransaction('DELETE FROM keyValueTable WHERE k=?',[k]);
		},
		/**
		 * 清空数据
		 * @return {Promise}
		 */
		clear(){
			this.init();
			return runTransaction('DELETE FROM keyValueTable');
		},
	};
	// output
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = storage;
	}
	else if (typeof define === "function" && define.amd) {
		define(["require", "exports"], ()=>storage);
	}else{
		g.websql2kv = storage;
	}
})(this);
