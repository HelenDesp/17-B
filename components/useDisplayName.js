import { useAccount, useEnsName } from 'wagmi';
import { useName } from '@coinbase/onchainkit/identity';
import { base, mainnet, sepolia } from 'viem/chains';
import { useState, useEffect } from 'react';

/**
 * A custom hook to resolve a display name for a given address, based on the connected chain.
 * It intelligently fetches BNS for Base and ENS for Ethereum/Sepolia.
 * @param {string} [addressProp] - The address to resolve. If not provided, it will use the connected user's address.
 * @returns {object} An object containing the `displayName` string and an `isNameLoading` boolean.
 */
export const useDisplayName = (addressProp) => {
  // --- 1. DETERMINE WHICH ADDRESS TO USE ---
  const { address: connectedAddress, isConnected, chain } = useAccount();
  // Use the address passed as a prop, OR fall back to the connected user's address.
  const addressToResolve = addressProp || connectedAddress;

  // --- 2. UPDATE INTERNAL HOOKS TO USE `addressToResolve` ---
  // BNS Hook (for Base only)
  const { data: bnsName, isLoading: isBnsLoading } = useName({
    address: addressToResolve, // <-- Use the flexible address
    chain: base,
    // Enable only if an address is available and the chain is Base
    enabled: !!addressToResolve && isConnected && chain?.id === base.id,
  });

  // ENS Hook (for Mainnet/Sepolia, and for comparison on Base)
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address: addressToResolve, // <-- Use the flexible address
    chainId: 1, // Always resolve against mainnet ENS registry
    // Enable only if an address is available
    enabled: !!addressToResolve && isConnected,
  });

  // --- State for the final display name and loading status ---
  const [displayName, setDisplayName] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(false);

  // --- Utility to format a standard 0x address ---
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // --- 3. UPDATE Effect to process the final display name ---
  useEffect(() => {
    // Use `addressToResolve` for checks
    if (!isConnected || !addressToResolve) {
      setDisplayName(formatAddress(addressToResolve));
      setIsNameLoading(false);
      return;
    }

    const isLoading = (chain?.id === base.id && isBnsLoading) || 
                      ((chain?.id === mainnet.id || chain?.id === sepolia.id) && isEnsLoading);
    
    setIsNameLoading(isLoading);

    if (isLoading) {
      setDisplayName("Resolving...");
      return;
    }

    let finalResolvedName = null;

    switch (chain?.id) {
      case base.id:
        if (bnsName && bnsName !== ensName) {
          finalResolvedName = bnsName;
        } else if (ensName) {
          // Fallback to ENS on Base if BNS doesn't resolve or is the same
          finalResolvedName = ensName;
        }
        break;
      
      case mainnet.id:
      case sepolia.id:
        finalResolvedName = ensName;
        break;
    }
    
    // Use `addressToResolve` for the final fallback
    setDisplayName(finalResolvedName || formatAddress(addressToResolve));

  // --- 4. UPDATE Dependency Array ---
  }, [addressToResolve, chain, isConnected, bnsName, ensName, isBnsLoading, isEnsLoading]);


  return { displayName, isNameLoading };
};