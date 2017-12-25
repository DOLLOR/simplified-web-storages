// test Indexeddb2kv|Websql2kv|storage2kv.localStorage|storage2kv.sessionStorage
let i2k = Indexeddb2kv('kvd','kbt');
await i2k.setItem('a',1);
console.log(await i2k.getItem('a'),1);

await i2k.setItem('a',2);
console.log(await i2k.getItem('a'),2);

await i2k.setItem('b',3);
await i2k.setItem('c',4);
console.log([
    await i2k.getItem('a'),
    await i2k.getItem('b'),
    await i2k.getItem('c'),
],[
    2,
    3,
    4,
]);
await i2k.removeItem('b');
console.log(await i2k.getItem('b'),null);
//------------------------------------------------------------------
await i2k.clear();
//------------------------------------------------------------------
await i2k.drop();
