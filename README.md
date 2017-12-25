# simplify-web-storages
Simplified WebSQL, IndexedDB APIs

## Usage
```javascript
(async function(){
    // indexeddb2kv.js
    let i2k = Indexeddb2kv('databaseName','storageName');
    await i2k.setItem('keyName','value');
    await i2k.getItem('keyName');
    await i2k.removeItem('keyName');
    await i2k.clear();//clear storage
    await i2k.drop();//drop database

    // websql2kv.js
    let w2k = Websql2kv('databaseName','tableName',10*1024*1024);
    await w2k.setItem('keyName','value');
    await w2k.getItem('keyName');
    await w2k.removeItem('keyName');
    await w2k.clear();//clear table
    await w2k.drop();//drop table

    // storage2kv.js
    storage2kv.localStorage.setItem('keyName','value');
    storage2kv.localStorage.getItem('keyName');
    storage2kv.localStorage.removeItem('keyName');
    storage2kv.localStorage.clear();//clear storage

    storage2kv.Websql2kv.setItem('keyName','value');
    storage2kv.Websql2kv.getItem('keyName');
    storage2kv.Websql2kv.removeItem('keyName');
    storage2kv.Websql2kv.clear();//clear storage
})();
```
