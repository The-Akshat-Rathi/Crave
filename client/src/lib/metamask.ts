declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Connect to MetaMask wallet
 * @returns wallet address
 */
export const connectMetaMask = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please create an account in MetaMask.');
    }
    
    const address = accounts[0];
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
      if (newAccounts.length === 0) {
        // User has disconnected all accounts
        localStorage.removeItem('crave_user');
        window.location.reload();
      } else {
        // User changed account
        const newAddress = newAccounts[0];
        console.log('Account changed to:', newAddress);
        // Handle account change - in a real app you might want to update the user in context
      }
    });
    
    return address;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

/**
 * Check if user has MetaMask installed and connected
 */
export const checkMetaMaskConnection = async (): Promise<boolean> => {
  if (!window.ethereum) {
    return false;
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking MetaMask connection:', error);
    return false;
  }
};

/**
 * Send a transaction using MetaMask
 * @param to Recipient address
 * @param value Amount to send in ETH
 * @returns Transaction hash
 */
export const sendTransaction = async (to: string, value: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    
    // Convert ETH value to wei (1 ETH = 10^18 wei)
    const valueInWei = parseInt((Number(value) * 1e18).toString()).toString(16);
    
    const transactionParameters = {
      from,
      to,
      value: `0x${valueInWei}`,
      gas: '0x5208', // 21000 gas (standard transaction)
    };
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    return txHash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};
