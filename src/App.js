import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import config from './config/config.json';

import './App.css';

const web3 = new Web3(new Web3.providers.HttpProvider(config.url));

function App() {
  const [lastBlock, setLastBlock] = useState(null);
  const [blockList, setBlockList] = useState([]);
  const [isRequest, setIsRequest] = useState(true);
  const [txList, setTxList] = useState([]);

  useEffect(() => {
    const getLastBlock = async() => {
      if(isRequest) {
        const currentBlock = await web3.eth.getBlock("latest");

        const lastNumber = lastBlock ? lastBlock.number : 0;
        if(currentBlock.number > lastNumber) {
          setLastBlock(currentBlock);
          setBlockList(oldArr => {
            let newArr = [currentBlock, ...oldArr];
            if(newArr.length > 10) newArr.pop();

            return newArr;
          });
        }
      }
    }

    const interval = setInterval(() => {
      getLastBlock();
    }, 1000);

    return () => clearInterval(interval);
  }, [lastBlock, isRequest]);

  const showTx = (blockNumber) => {
    blockList.map(async(block) => {
      if(block.number === blockNumber) {
        const txArr = await Promise.all(block.transactions.map(async(txHash) => await web3.eth.getTransaction(txHash)));
        txArr.sort(function(a, b) {
          return Number(b.value) - Number(a.value);
        });

        setTxList(txArr);

        return;
      }
    });
  }

  return (
    <div className="App">
      <h2>
        Current Block: {lastBlock ? lastBlock.number : ''}
      </h2>
      <button onClick={() => setIsRequest(!isRequest)}>
        {isRequest ? 'Pause' : 'Start'}
      </button>
      <h4>
        Recent 10 blocks
      </h4>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>Block No</th>
            <th>Hash</th>
            <th>Number of Tx</th>
            <th>Miner</th>
            <th>Total difficulty</th>
          </tr>
        </thead>
        <tbody>
          {
            blockList.map((block) => (
              <tr key={block.number} onClick={() => showTx(block.number)}>
                <td>{block.number}</td>
                <td>{block.hash}</td>
                <td>{block.transactions.length}</td>
                <td>{block.miner}</td>
                <td>{block.difficulty}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      
      <h4>
        Select block to see transactions
      </h4>
      {
        txList.length > 0 ?
        <table className='table table-bordered'>
          <thead>
            <tr>
              <th>Block No</th>
              <th>Transaction Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {
              txList.map((tx) => (
                <tr key={tx.hash}>
                  <td>{tx.blockNumber}</td>
                  <td>{tx.hash}</td>
                  <td>{tx.from}</td>
                  <td>{tx.to}</td>
                  <td>{tx.value}</td>
                </tr>
              ))
            }
          </tbody>
        </table> : null
      }
    </div>
  );
}

export default App;
