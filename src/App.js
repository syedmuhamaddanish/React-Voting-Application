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
    getCandidates();
    getRemainingTime();
    getCurrentStatus();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0 && account !== accounts[0]) {
        setAccount(accounts[0]);
        checkCanVote();
      } else {
        setIsConnected(false);
        setAccount(null);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [account]); // Add missing dependencies here

  async function vote() {
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    const tx = await contractInstance.vote(number);
    await tx.wait();
    await checkCanVote();
    }

  async function checkCanVote() {
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    const voteStatus = await contractInstance.voters(await signer.getAddress());
    setCanVote(voteStatus);
  }

  async function getCandidates() {
    try {
      const provider = window.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.getDefaultProvider();
  
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
  
      console.log(contractInstance);
      const candidatesList = await contractInstance.getAllVotesOfCandidates();
      
      // Corrected function name
  
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
  

  async function getCurrentStatus() {
    try {
      const provider = window.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.getDefaultProvider();

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

  async function getRemainingTime() {
    try {
      const provider = window.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.getDefaultProvider();

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

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = window.ethereum
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.getDefaultProvider();

        setProvider(provider);

        // Ensure the provider is properly initialized
        await provider.ready;

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        setAccount(address);
        console.log('Metamask Connected:', address);
        setIsConnected(true);
        await checkCanVote();
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
      }
    } else {
      console.error('MetaMask is not detected in the browser');
    }
  }

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }

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
          <Login connectWallet={connectToMetamask} />
        )
      ) : (
        <Finished />
      )}
    </div>
  );
}

export default App;
