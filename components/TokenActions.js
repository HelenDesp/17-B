import React, { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { createAcrossClient } from '@across-protocol/app-sdk';
import { mainnet, optimism, arbitrum, base, polygon, bsc } from 'viem/chains';
import { useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

const CHAINS = [
  { label: 'Ethereum', chain: mainnet },
  { label: 'Base', chain: base },
  { label: 'Arbitrum', chain: arbitrum },
  { label: 'Optimism', chain: optimism },
  { label: 'Polygon', chain: polygon },
  { label: 'BNB Chain', chain: bsc },
];

const TOKENS = ['ETH', 'USDC', 'USDT', 'DAI'];

export default function TokenActions() {
  const { open } = useAppKit();
  const walletClient = useWalletClient();

  const [from, setFrom] = useState(CHAINS[1]);
  const [to, setTo] = useState(CHAINS[0]);
  const [token, setToken] = useState('ETH');
  const [amount, setAmount] = useState('0.1');
  const [loading, setLoading] = useState(false);

  const handleBuy = () => open({ view: 'OnRampProviders' });
  const handleSwap = () => open({ view: 'Swap' });
  const handleSendFlow = () => open({ view: 'Account' });

  const handleBridge = async () => {
    if (!walletClient.data) return alert('Connect your wallet first.');

    setLoading(true);
    try {
      const client = createAcrossClient({
        integratorId: '0xdead',
        chains: [from.chain, to.chain],
      });

      const route = {
        originChainId: from.chain.id,
        destinationChainId: to.chain.id,
        inputToken: token,
        outputToken: token,
      };

      const inputAmount = parseUnits(amount, 18);

      const quote = await client.getQuote({ route, inputAmount });
      await client.executeQuote({
        walletClient: walletClient.data,
        deposit: quote.deposit,
        onProgress: (p) => console.log('progress', p),
      });

      alert('Bridge successful!');
    } catch (e) {
      console.error(e);
      alert('Bridge failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Token Actions
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleBuy}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Tokens
        </button>
        <button
          onClick={handleSwap}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Swap Tokens
        </button>
        <button
          onClick={handleSendFlow}
          className="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Send Tokens
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-sm text-gray-800 dark:text-white">
            From Chain
            <select
              value={from.label}
              onChange={(e) =>
                setFrom(CHAINS.find((c) => c.label === e.target.value))
              }
              className="px-3 py-1 rounded border"
            >
              {CHAINS.map((c) => (
                <option key={c.chain.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-gray-800 dark:text-white">
            To Chain
            <select
              value={to.label}
              onChange={(e) =>
                setTo(CHAINS.find((c) => c.label === e.target.value))
              }
              className="px-3 py-1 rounded border"
            >
              {CHAINS.map((c) => (
                <option key={c.chain.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-gray-800 dark:text-white">
            Token
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="px-3 py-1 rounded border"
            >
              {TOKENS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-gray-800 dark:text-white">
            Amount
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3 py-1 rounded border"
            />
          </label>
        </div>

        <button
          onClick={handleBridge}
          disabled={loading}
          className={`px-5 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Bridging...' : 'Bridge Tokens'}
        </button>
      </div>
    </section>
  );
}