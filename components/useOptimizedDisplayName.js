import { useAccount, useEnsName } from 'wagmi';
import { useName } from '@coinbase/onchainkit/identity';
import { base, mainnet, sepolia } from 'viem/chains';
import { useState, useEffect } from 'react';

/**
 * A custom hook to resolve a user's display name based on the connected chain,
 * with optimized lookups per chain.
 * It fetches BNS for Base ONLY and ENS for Ethereum/Sepolia ONLY.
 * @param {string} [addressProp] - The address to resolve. If not provided, it uses the connected user's address.
 * @returns {object} An object containing the `displayName` string and an `isNameLoading` boolean.
 */
export const useDisplayName = (addressProp) => {
  const { address: connectedAddress, isConnected, chain } = useAccount();
  const addressToResolve = addressProp || connectedAddress;

  // --- BNS Hook: Now enabled ONLY if the connected chain is Base ---
  const { data: bnsName, isLoading: isBnsLoading } = useName({
    address: addressToResolve,
    chain: base,
    enabled: !!addressToResolve && isConnected && chain?.id === base.id,
  });

  // --- ENS Hook: Now enabled ONLY if the connected chain is Ethereum or Sepolia ---
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address: addressToResolve,
    chainId: 1, // Always resolve against mainnet ENS registry
    enabled: !!addressToResolve && isConnected && (chain?.id === mainnet.id || chain?.id === sepolia.id),
  });

  const [displayName, setDisplayName] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    if (!isConnected || !addressToResolve) {
      setDisplayName(formatAddress(addressToResolve));
      setIsNameLoading(false);
      return;
    }
    
    // Determine loading state based on the current chain
    let isLoading = false;
    if (chain?.id === base.id) {
      isLoading = isBnsLoading;
    } else if (chain?.id === mainnet.id || chain?.id === sepolia.id) {
      isLoading = isEnsLoading;
    }
    
    setIsNameLoading(isLoading);

    if (isLoading) {
      setDisplayName("Resolving...");
      return;
    }

    let finalResolvedName = null;

    // --- Simplified Logic: Only check for the relevant name service per chain ---
    switch (chain?.id) {
      case base.id:
        // On Base, the only name we care about is BNS.
        finalResolvedName = bnsName;
        break;
      
      case mainnet.id:
      case sepolia.id:
        // On Ethereum or Sepolia, the only name we care about is ENS.
        finalResolvedName = ensName;
        break;
      
      // For all other chains, finalResolvedName will remain null by default.
    }
    
    setDisplayName(finalResolvedName || formatAddress(addressToResolve));

  }, [addressToResolve, chain, isConnected, bnsName, ensName, isBnsLoading, isEnsLoading]);

  return { displayName, isNameLoading };
};