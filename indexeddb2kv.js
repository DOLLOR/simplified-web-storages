!(function(g){
	"use strict";
	/**@type {IDBFactory} */
	const indexedDB = g.indexedDB || g.webkitIndexedDB || g.mozIndexedDB || g.msIndexedDB;
	/**@type {Promise<IDBDatabase>} */
	let db;
	const version = 1;
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
		setItem(k,v){
			this.init();
			return runTransaction(store=>store.put({k,v}),'readwrite');
		},
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
		removeItem(k){
			this.init();
			return runTransaction(store=>store.delete(k),'readwrite');
		},
		clear(){
			this.init();
			return runTransaction(store=>store.clear());
		},
	};
	g.indexeddb2kv = storage;
})(this);