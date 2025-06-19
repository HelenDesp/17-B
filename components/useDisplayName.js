import { useAccount, useEnsName } from 'wagmi';
import { useName } from '@coinbase/onchainkit/identity';
import { base, mainnet, sepolia } from 'viem/chains';
import { useState, useEffect } from 'react';

/**
 * A custom hook to resolve a user's display name based on the connected chain.
 * It intelligently fetches BNS for Base and ENS for Ethereum/Sepolia,
 * handling loading states and fallbacks automatically.
 * * @returns {object} An object containing the `displayName` string and an `isNameLoading` boolean.
 */
export const useDisplayName = () => {
  const { address, isConnected, chain } = useAccount();

  // --- Internal Hooks for Name Resolution ---

  // BNS Hook (for Base only): Fetches potential name on Base.
  const { data: bnsName, isLoading: isBnsLoading } = useName({
    address,
    chain: base,
    enabled: isConnected && chain?.id === base.id,
  });

  // ENS Hook (for comparison on Base, and for display on Mainnet/Sepolia)
  // This is enabled on Base as well, specifically to detect and prevent the fallback issue.
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address,
    chainId: 1, // Always resolve against mainnet ENS registry
    enabled: isConnected && (chain?.id === base.id || chain?.id === mainnet.id || chain?.id === sepolia.id),
  });

  // --- State for the final display name and loading status ---
  
  const [displayName, setDisplayName] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(false);

  // --- Utility to format a standard 0x address ---
  
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // --- Effect to process and set the final display name ---

  useEffect(() => {
    if (!isConnected || !address) {
      setDisplayName(formatAddress(address));
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
        // This is the crucial check: Only use the resolved name on Base if it's NOT the same as the ENS name.
        if (bnsName && bnsName !== ensName) {
          finalResolvedName = bnsName;
        }
        break;
      
      case mainnet.id:
      case sepolia.id:
        finalResolvedName = ensName;
        break;
    }
    
    setDisplayName(finalResolvedName || formatAddress(address));

  }, [address, chain, isConnected, bnsName, ensName, isBnsLoading, isEnsLoading]);

  // --- Return the final, processed values ---

  return { displayName, isNameLoading };
};
