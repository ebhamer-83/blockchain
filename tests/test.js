/*
eric hamer
test.js: unit tests for my blockchain demo
*/
const uuidv1 = require('uuid/v1'); // used to create trans id

const BlockChain = require('../dev/blockchain');
const GENESIS_HASH = '0';

var testTotal = 0; // we increment this as we test
var failedTests = 0;

var addr1 = 'saija090909';
var addr2 = 'oslo0808080';
var addr3 = 'shadow07070';
var addr4 = 'cloud060606';
var addr5 = 'aimee030303';

var amount1 = 100;
var amount3 = 200;

var bTest = true;
var bool2 = true;

const bc = new BlockChain();

console.log('Start Test');

// create the blockchain
testTotal += 1;
bTest = bc.isChainValid();
if (false == bTest) {
    console.log('Create Blockchain failed');
    failedTests++;
}

// add two transactions
testTotal += 1;
var transID1 = bc.addTransaction(amount1, addr1, addr2);
var transID2 = bc.addTransaction(amount3, addr3, addr4);

var newCount = bc.getTrasactionCount();
var bFail = false;

if (2 != newCount) {
    console.log('addTransaction failed.  incorrect trans total.');
    failedTests++;
}

var randTransID = uuidv1().split('-').join('');;
var dctTrans = bc.getTransaction(randTransID);
if ((null != dctTrans.transaction) || (null != dctTrans.block)) {
    console.log('addTransaction failed.  incorrect trans data.');
    bFail = true;
}

// the transaction has not been mined, so it should not be found
dctTrans = bc.getTransaction(transID1);
if ((null != dctTrans.transaction) || (null != dctTrans.block)) {
    console.log('addTransaction failed.  incorrect trans data.');
    bFail = true;
}

// mine the next block
bFail = false;
testTotal += 1;
bc.mineNextBlocK();
newCount = bc.getChainLength();

if (2 != newCount) {
    console.log('mineNextBlock failed.  incorrect chain length.');
    bFail = true;
}

// get the data from the first trans
var dct = bc.getTransaction(transID1);
var dctTrans = dct.transaction;

if ((amount1 != dctTrans.amount) || (addr1 != dctTrans.sender)
    || (addr2 != dctTrans.recipient)) {
        console.log('getTransaction failed.  id: ' + transID1);
        bFail = true;
}

// get the data for the first addr
var dct = bc.getAddressData(addr1);
if ((1 != dct.addressTransactions.length) || (-1.0 * amount1 != dct.addressBalance)) {
    console.log('getAddressData failed.  address: ' + addr1);
    bFail = true;
}

var bValid = bc.isChainValid();
if(false == bValid) {
    console.log('Chain is not valid. Current chain length: ' + bc.getChainLength());
    bFail = true;
}

if (true == bFail) {
    failedTests++;
}

// get the current block's hash.  we will use it in the next test
testTotal += 1;
bFail = false;

var dct = bc.getLastBlock();
var testHash = dct.hash

// work it out so addr5 gets everythin
// add more trans
var transID4 = bc.addTransaction(amount1, addr2, addr5);
var transID5 = bc.addTransaction(amount3, addr5, addr5);

// mine next block
bc.mineNextBlocK();

// check chain isvalid
var bValid = bc.isChainValid();
if(false == bValid) {
    console.log('Chain is not valid. Current chain length: ' + bc.getChainLength());
    bFail = true;
}

var dct = bc.getAddressData(addr5);
if ((2 != dct.addressTransactions.length) || ((amount1 + amount3) != dct.addressBalance)) {
    console.log('getAddressData failed.  address: ' + addr5);
    bFail = true;
}

if (true == bFail) {
    failedTests++;
}

// test getBlock by getting the second block
// we know the index is 2 and the prevBockHash is '0'
testTotal += 1;
bFail = false;

var dct = bc.getBlock(testHash);
if ((2 != dct.index) || (2 != dct.blockData.length)) {
    console.log('getBlockData failed. hash: ' + testHash);
    failedTests++;
}

console.log((testTotal - failedTests).toString() + ' of ' + testTotal.toString() + ' tests passed.');
console.log('End Test');
