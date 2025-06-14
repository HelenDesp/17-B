import React, { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { createAcrossClient } from '@across-protocol/app-sdk';
import { mainnet, optimism, arbitrum, base, polygon, bsc } from 'viem/chains';
import { useWalletClient } from 'wagmi';

const CHAINS = [
  { label: 'Ethereum', chain: mainnet },
  { label: 'Base', chain: base },
  { label: 'Arbitrum', chain: arbitrum },
  { label: 'Optimism', chain: optimism },
  { label: 'Polygon', chain: polygon },
  { label: 'BNB Chain', chain: bsc },
];

const TOKENS = ['ETH', 'USDC', 'USDT', 'DAI'];

function getTokenAddress(chainId, symbol) {
  const addresses = {
    1: {
      ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    },
    8453: {
      ETH: "0x4200000000000000000000000000000000000006",
      USDC: "0xd9aa60fef2ee563bea6a6c2b3c5fbe9e63f55ae0",
      USDT: "0x5c7F2be2a7A2877bCea6F0E3fD98f0B48A5473d7",
      DAI: "0x3e7EF8f50246f725885102e8238CbBa33F276747"
    },
    42161: {
      ETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      USDC: "0xFF970A61A04b1Ca14834A43f5dE4533eBDDB5CC8",
      USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      DAI: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
    },
    10: {
      ETH: "0x4200000000000000000000000000000000000006",
      USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      DAI: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
    },
    137: {
      ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AaCbA2C7dD2",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
    },
    56: {
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      USDT: "0x55d398326f99059ff775485246999027b3197955",
      DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3"
    },
  };
  return addresses[chainId]?.[symbol] || null;
}

export default function TokenActions() {
  const { open } = useAppKit();
  const walletClient = useWalletClient();

  const [from, setFrom] = useState(CHAINS[1]);
  const [to, setTo] = useState(CHAINS[0]);
  const [token, setToken] = useState('ETH');
  const [amount, setAmount] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [showBridge, setShowBridge] = useState(false);
  const [activeAction, setActiveAction] = useState('Buy');

  const handleAction = (action) => {
    setActiveAction(action);
    if (action === 'Buy') handleBuy();
    else if (action === 'Swap') handleSwap();
    else if (action === 'Send') handleSendFlow();
    else if (action === 'Bridge') setShowBridge(prev => !prev);
  };

  const handleBuy = () => { setShowBridge(false); open({ view: 'OnRampProviders' }); };
  const handleSwap = () => { setShowBridge(false); open({ view: 'Swap' }); };
  const handleSendFlow = () => { setShowBridge(false); open({ view: 'Account' }); };

  return (
    <section className="p-4 bg-white dark:bg-dark-200 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Token Actions</h2>
      <div className="flex flex-wrap gap-4 mb-6 justify-between max-w-full">
        {["Buy", "Swap", "Send", "Bridge"].map((btn) => (
          <button
            key={btn}
            onClick={() => handleAction(btn)}
className={`flex flex-col items-center justify-center border rounded text-base h-20
  w-[23%] min-w-[80px] max-w-40 grow
  max-[1150px]:min-w-[48%] max-[1150px]:flex-[0_0_48%] max-[1023px]:flex-[0_0_auto]
  ${activeAction === btn ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
          >
            <img
              src={
                btn === "Buy" ? "/ethereum.svg" :
                btn === "Swap" ? "/usdc.svg" :
                btn === "Send" ? "/dai.svg" :
                "/wrappedbtc.svg"
              }
              alt={btn}
              className="w-8 h-8 mb-1"
            />
            <span className="text-gray-900 dark:text-white uppercase">{btn}</span>
          </button>
        ))}
      </div>

      {showBridge && (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-red-600">
            ⚠️ Bridge feature is under construction.<br />
            Please use 
            <a
              href="https://app.across.to/bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 ml-1"
            >
              [Across.to]
            </a>
            as a temporary solution.
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col text-sm text-gray-800 dark:text-white">
              From Chain
              <select value={from.label} onChange={(e) => setFrom(CHAINS.find(c => c.label === e.target.value))} className="px-3 py-1 rounded border">
                {CHAINS.map(c => <option key={c.chain.id} value={c.label}>{c.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-800 dark:text-white">
              To Chain
              <select value={to.label} onChange={(e) => setTo(CHAINS.find(c => c.label === e.target.value))} className="px-3 py-1 rounded border">
                {CHAINS.map(c => <option key={c.chain.id} value={c.label}>{c.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-800 dark:text-white">
              Token
              <select value={token} onChange={(e) => setToken(e.target.value)} className="px-3 py-1 rounded border">
                {TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-800 dark:text-white">
              Amount
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="px-3 py-1 rounded border" />
            </label>
          </div>
          <button
            disabled
            className="px-5 py-2 bg-yellow-400 text-white rounded opacity-50 cursor-not-allowed"
          >
            Bridge
          </button>
        </div>
      )}
    </section>
  );
}