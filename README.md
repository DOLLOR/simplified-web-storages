# simplify-web-storages
Simplified WebSQL, IndexedDB APIs

## Usage
```javascript
(async function(){
    // indexeddb2kv.js
    let i2k = new Indexeddb2kv('databaseName',['storeName']);
    await i2k.setItem('storeName','keyName','value');
    await i2k.getItem('storeName','keyName');
    await i2k.removeItem('storeName','keyName');
    await i2k.keys('storeName');
    await i2k.getAll('storeName');
    await i2k.clear('storeName');
    await i2k.drop('storeName');//drop store
    await i2k.drop();//drop database
    i2k.close();//close connection

    // websql2kv.js
    let w2k = new Websql2kv('databaseName',['tableName'],10*1024*1024);
    await w2k.setItem('tableName','keyName','value');
    await w2k.getItem('tableName','keyName');
    await w2k.removeItem('tableName','keyName');
    await w2k.keys('tableName');
    await w2k.getAll('tableName');
    await w2k.clear('tableName');//clear table
    await w2k.drop('tableName');//drop table

    // storage2kv.js
    storage2kv.localStorage.setItem('keyName','value');
    storage2kv.localStorage.setJSON('keyName',{});
    storage2kv.localStorage.getItem('keyName');
    storage2kv.localStorage.getJSON('keyName');
    storage2kv.localStorage.removeItem('keyName');
    storage2kv.localStorage.keys();
    storage2kv.localStorage.getAll();
    storage2kv.localStorage.clear();//clear storage

    storage2kv.sessionStorage.setItem('keyName','value');
    storage2kv.sessionStorage.setJSON('keyName',{});
    storage2kv.sessionStorage.getItem('keyName');
    storage2kv.sessionStorage.getJSON('keyName');
    storage2kv.sessionStorage.removeItem('keyName');
    storage2kv.sessionStorage.keys();
    storage2kv.sessionStorage.getAll();
    storage2kv.sessionStorage.clear();//clear storage
})();
```
