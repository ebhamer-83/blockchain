/*
eric hamer
blockchain.js: blockchain demo
*/
'use strict';

const sha256 = require('sha256');
const uuidv1 = require('uuid/v1'); // used to create trans id

const GENESIS_NONCE = 1;
const GENESIS_HASH = '0';
const HASH_PATTERN = '0000';

class Blockchain  {

    constructor () {
        this.lstChain = [];
        this.lstPendingTransactions = [];

        // add the geneis block
        this.createNewBlock(GENESIS_NONCE, GENESIS_HASH, GENESIS_HASH);
    }

    getChainLength() {
        var len = this.lstChain.length;

        return len;
    }

    getTrasactionCount() {
        var len = this.lstPendingTransactions.length;

        return len;
    }

    getGenesisHash() {
        return GENESIS_HASH;
    }

    getTransaction(transID) {
    	var dctTrans = null;
    	var dctBlock = null;

    	this.lstChain.forEach(dctB => {
    		dctB.blockData.forEach(dctT => {
    			if (dctT.transID === transID) {
    				dctTrans = dctT;
    				dctBlock = dctB;
    			};
    		});
    	});

    	return {
    		transaction: dctTrans,
    		block: dctBlock
    	};
    }

    getAddressData(address) {
    	const lstTrans = [];
    	this.lstChain.forEach(dctB => {
    		dctB.blockData.forEach(transaction => {
    			if(transaction.sender === address || transaction.recipient === address) {
    				lstTrans.push(transaction);
    			};
    		});
    	});

    	var balance = 0;
    	lstTrans.forEach(transaction => {
    		if (transaction.recipient === address) balance += transaction.amount;
    		else if (transaction.sender === address) balance -= transaction.amount;
    	});

    	return {
    		addressTransactions: lstTrans,
    		addressBalance: balance
    	};
    }

    mineNextBlocK() {
        var dctBlock = this.getLastBlock();
        var dctData = { transactions: this.lstPendingTransactions, index: dctBlock['index'] + 1 };
        var prevHash = dctBlock['hash'];
        var newHash;
        var nonce;

        nonce = this.proofOfWork(prevHash, dctData);
        newHash = this.hashBlock(prevHash, dctData, nonce);
        this.createNewBlock(nonce, prevHash, newHash);

        return;
    }

    createNewBlock(nonce, prevBlockHash, currBlockHash) {
        var dctNewBlock = {
            index: this.lstChain.length + 1,
            timeStamp: (new Date).getTime(),
            blockData: this.lstPendingTransactions,
            nonce: nonce,
            hash: currBlockHash,
            prevBlockHash: prevBlockHash
        }

        this.lstPendingTransactions = [];
        this.lstChain.push(dctNewBlock);

        return dctNewBlock;
    }

    getBlock(blockHash) {
    	var dctBlock = null;

        this.lstChain.forEach(dctB => {
    		if (dctB.hash === blockHash) {
                dctBlock = dctB;
            }
    	});

    	return dctBlock;
    }

    getLastBlock() {
        var dctBlock = this.lstChain[(this.lstChain.length - 1)];
        return dctBlock;
    }

    addTransaction(amount, sender, recipient) {
        var transID = uuidv1().split('-').join(''); // get the GUID and remove the '-'
        var trans = this.createNewTransaction(amount, sender, recipient, transID);

        this.lstPendingTransactions.push(trans);

        return trans['transID']
    }

    createNewTransaction(amount, sender, recipient) {
        var transID = uuidv1().toString().replace(/-/g, '');
        var dctTrans = {amount: amount,
                        sender: sender,
                        recipient: recipient,
                        transID: transID};

        return dctTrans;
    }

    hashBlock(previousBlockHash, currentBlockData, nonce) {
    	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    	const hash = sha256(dataAsString);

    	return hash;
    }

    proofOfWork(previousBlockHash, currentBlockData) {
    	var nonce = 0;
    	var hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    	while (hash.substring(0, HASH_PATTERN.length) !== HASH_PATTERN) {
    		nonce++;
    		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    	}

        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    	return nonce;
    }

    isChainValid() {
    	var bValid = true;

    	for (var i = 1; i < this.lstChain.length; i++) {
    		const dctCurrBlock = this.lstChain[i];
    		const dctPrevBlock = this.lstChain[i - 1];

    		const blockHash = this.hashBlock(dctPrevBlock['hash'],
                { transactions: dctCurrBlock['blockData'], index: dctCurrBlock['index'] }, dctCurrBlock['nonce']);
    		if (blockHash.substring(0, HASH_PATTERN.length) !== HASH_PATTERN) {
                bValid = false;
            }

    		if (dctCurrBlock['prevBlockHash'] !== dctPrevBlock['hash']) {
                bValid = false;
            }
        }

    	const dctGenesisBlock = this.lstChain[0];
    	const correctNonce = dctGenesisBlock['nonce'] === GENESIS_NONCE;
    	const correctPreviousBlockHash = dctGenesisBlock['prevBlockHash'] === GENESIS_HASH;
    	const correctHash = dctGenesisBlock['hash'] === GENESIS_HASH;
    	const correctTransactions = dctGenesisBlock['blockData'].length === 0;

    	if (!correctNonce || !correctPreviousBlockHash || !correctHash
            || !correctTransactions) {
                bValid = false;
       }

       return bValid;
    }
}

module.exports = Blockchain;
