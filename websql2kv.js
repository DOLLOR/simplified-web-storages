!(function(g){
	"use strict";
	let db;
	const version = 1;
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
		init(){
			if(db){
				return Promise.resolve();
			}else{
				db = openDatabase('keyValueDatabase',version,'key-value database',10*1024*1024);
				return runTransaction('CREATE TABLE IF NOT EXISTS keyValueTable (k PRIMARY KEY, v, datatype)');
			}
		},
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
		removeItem(k){
			this.init();
			return runTransaction('DELETE FROM keyValueTable WHERE k=?',[k]);
		},
		clear(){
			this.init();
			return runTransaction('DELETE FROM keyValueTable');
		},
	};
	g.websql2kv = storage;
})(this);
