import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(true);

  useEffect(() => {
    initializeProvider();
    getCandidates();
    getRemainingTime();
    getCurrentStatus();
  }, []);

  async function initializeProvider() {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Subscribe to account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            checkCanVote();
          } else {
            setAccount(null);
            setIsConnected(false);
          }
        });

        // Subscribe to chainId changes
        window.ethereum.on('chainChanged', (chainId) => {
          // Handle chainId change
        });

        // Ensure the provider is properly initialized
        await provider.ready;
        console.log(provider);

        const signer = provider.getSigner();
        console.log(signer);
        const address = await signer.getAddress();

        setAccount(address);
        console.log('Metamask Connected:', address);
        setIsConnected(true);
        await checkCanVote();
      } else {
        console.error('MetaMask is not detected in the browser');
      }
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
    }
  }

  async function vote() {
    try {
      if (provider) {
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

        const tx = await contractInstance.vote(number);
        await tx.wait();
        await checkCanVote();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  async function checkCanVote() {
    try {
      if (provider) {
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const voterAddress = await signer.getAddress();
        
        // Check if the voter is eligible to vote
        const canVote = await contractInstance.voters(voterAddress);
        setCanVote(canVote);
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
  
      // Check if the error is due to contract revert
      if (error.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
        console.error('Contract call reverted:', error.reason);
      }
    }
  }
  

  // Implement other contract interaction functions (getCandidates, getRemainingTime, getCurrentStatus) similarly
  async function getCandidates() {
    if (provider) {
      try {
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const candidatesList = await contractInstance.getAllVotesOfCandidates();
        const formattedCandidates = candidatesList.map((candidate, index) => {
          return {
            index: index,
            name: candidate.name,
            voteCount: candidate.voteCount.toNumber(),
          };
        });

        console.log('Candidates:', formattedCandidates);
        setCandidates(formattedCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error.message);
      }
    }
  }

  async function getCurrentStatus() {
    if (provider) {
      try {
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const status = await contractInstance.getVotingStatus();
        console.log('Voting Status:', status);
        setVotingStatus(status);
      } catch (error) {
        console.error('Error getting current status:', error.message);
      }
    }
  }

  async function getRemainingTime() {
    if (provider) {
      try {
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const time = await contractInstance.getRemainingTime();
        console.log('Remaining Time:', parseInt(time, 16));
        setRemainingTime(parseInt(time, 16));
      } catch (error) {
        console.error('Error getting remaining time:', error.message);
      }
    }
  }

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }


  // Implement handleNumberChange function similarly

  return (
    <div className="App">
      {votingStatus ? (
        isConnected ? (
          <Connected
            account={account}
            candidates={candidates}
            remainingTime={remainingTime}
            number={number}
            handleNumberChange={handleNumberChange}
            voteFunction={vote}
            showButton={canVote}
          />
        ) : (
          <Login connectWallet={initializeProvider} />
        )
      ) : (
        <Finished />
      )}
    </div>
  );
}

export default App;
