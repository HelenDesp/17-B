import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useTheme } from "../context/ThemeContext";
import { useAccount } from "wagmi";
import AsciiComingSoon from './AsciiComingSoon';
import NftsPage from './NftsPage';
import TokensPage from './TokensPage';


const Activity = () => <div className="p-6"><h1>Activity Content</h1></div>;

// --- FIX: Update these components to accept { theme } as a prop ---
const PalMoji = ({ theme }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">PalMoji [Coming Soon...]</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
      Create or join exclusive, token-gated clans based on the NFTs you hold. This will be your space to connect, strategize, and engage with fellow holders.
    </p>	
    <AsciiComingSoon theme={theme} />
  </div>
);
const GenesisHub = ({ theme }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">Genesis Hub [Coming Soon...]</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
      Meet the Genesis Hub, the central portal for the ReVerse Genesis community. This is the exclusive space for holders to connect, stay updated, and directly influence the growth of the project. We are actively building the following features for you:
    </p>

    <div className="max-w-2xl w-full text-left space-y-6 border-t border-gray-200 dark:border-white pt-8 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Announcements</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Get all official news, development updates, and roadmap progress directly from the team. The Hub will be the single source of truth for everything happening in the ReVerse Genesis ecosystem.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Events & Calendar</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Never miss an important community event. Track upcoming AMAs, art contests, game nights, and holder-only meetups on a shared community calendar.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Governance & Polls</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your voice matters. Participate in holder-only polls and governance proposals that will shape the future of the project. Use your NFT to vote on key decisions and make a real impact.
        </p>
      </div>
		<div>
		  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ecosystem Expansion</h3>
		  <p className="text-gray-600 dark:text-gray-400 mt-1">
			Dive deeper into the world of ReVerse Genesis with an expanding lore library. A dedicated, secure marketplace for trading and acquiring assets, P2E games, and our own crypto token are also on the horizon.
		  </p>
		</div>
    </div>
    <AsciiComingSoon theme={theme} />
  </div>
);

const Clans = ({ theme }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">Clans [Coming Soon...]</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
      Unite with fellow holders and forge your legacy. The Clans realm is your dedicated space to create, join, and manage exclusive, token-gated communities. This is where you connect with your peers, strategize, and build a powerful collective identity.
    </p>

    <div className="max-w-4xl w-full text-left space-y-6 border-t border-gray-200 dark:border-white pt-8 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clan Roles & Hierarchy</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Clans are founded and led by holders of Hororo Babies NFTs. As a founder, you have the power to choose a unique name and emblem, write your clan's manifesto, and set the rules for the community. Lead the charge and define your collective destiny! Serving the Hororo Babies are the elite Knights, holders of Wildcards Joker W and Wildcards Joker B, who possess more power and influence than regular members within the clan structure.
        </p>
        <div className="flex flex-wrap justify-center items-start gap-4 mt-4">
          <div className="text-center">
            <img src="https://reversegenesis.org/clans/Hororo_Babies.png" alt="Hororo Babies NFT" className="w-48 h-48 object-contain rounded-lg shadow-md border border-black dark:border-white" />
            <p className="text-sm font-semibold mt-2 text-gray-800 dark:text-white">Hororo Babies</p>
          </div>
          <div className="text-center">
            <img src="https://reversegenesis.org/clans/Joker-W.png" alt="Wildcards Joker W NFT" className="w-48 h-48 object-contain rounded-lg shadow-md border border-black dark:border-white" />
            <p className="text-sm font-semibold mt-2 text-gray-800 dark:text-white">Knights (W)</p>
          </div>
          <div className="text-center">
            <img src="https://reversegenesis.org/clans/Joker-B.png" alt="Wildcards Joker B NFT" className="w-48 h-48 object-contain rounded-lg shadow-md border border-black dark:border-white" />
            <p className="text-sm font-semibold mt-2 text-gray-800 dark:text-white">Knights (B)</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discover & Join Existing Clans</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse a directory of all existing clans. Find your perfect community based on required NFT, member count, or activity level.
        </p>
      </div>
  
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Private Clan Halls</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Each clan gets access to a private, members-only "Clan Hall." This includes a dedicated message board for communication, a directory of all members, and a space for official clan announcements.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Royalty Pool</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          The most active and prosperous clans will earn a greater share of royalties from secondary market sales of ReVerse Genesis NFTs. Your clan's collective engagement directly contributes to your shared rewards!
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Showcase Your Allegiance</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your clan membership will be a badge of honor. A special flair or banner will be displayed on your main profile, showing your allegiance and connecting you with the rest of the community.
        </p>
      </div>
    </div>
    <AsciiComingSoon theme={theme} />
  </div>
);
const Earn = ({ theme }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">Earn [Coming Soon...]</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
      Unlock earning opportunities, where your engagement and loyalty are rewarded. We are building a powerful suite of tools that add real utility to your assets. Participate in our ecosystem and unlock new ways to grow your holdings.
    </p>

    <div className="max-w-2xl w-full text-left space-y-6 border-t border-gray-200 dark:border-white pt-8 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Play-to-Earn (P2E) Games</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Unleash the power of your skills and your NFTs in our upcoming suite of P2E games. Compete against other holders, complete challenges, and earn exclusive in-game assets and token rewards.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exclusive Airdrops</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Loyal holders and active community members will be eligible for exclusive airdrops. Stay engaged to receive new tokens, special edition NFTs, and other valuable rewards dropped directly to your wallet.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NFT & Token Staking</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Put your assets to work. Our upcoming staking platform will allow you to lock your NFTs and project tokens to earn passive rewards, providing a steady yield for long-term (OG) supporters of the ecosystem.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questing & Missions</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Send your NFTs on missions within the ReVerse Genesis lore. Completing quests will yield rare items, token rewards, and enhance the story and utility of your unique assets.
        </p>
      </div>
    </div>	
    <AsciiComingSoon theme={theme} />
  </div>
);
const Scoreboard = ({ theme }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">Scoreboard [Coming Soon...]</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
      Ready to make your mark? The Scoreboard is where legacy is forged. This will be the main destination to track rankings, celebrate top performers, and see how you stack up against the best in the ReVerse Genesis community.
    </p>

    <div className="max-w-2xl w-full text-left space-y-6 border-t border-gray-200 dark:border-white pt-8 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-Game Leaderboards</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your performance across all our P2E games. Whether it's the highest score, the most wins, or the fastest completion time, find your name at the top of the charts and earn valuable badges.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seasonal Rankings & Rewards</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Compete in seasons to keep the challenge fresh. Climb the seasonal leaderboards to earn exclusive, time-sensitive rewards like rare NFTs, token bonuses, and unique animated profile, exclusive banners, and champion titles.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collector & Community Score</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          It's not just about gaming. Earn points for the rarity and size of your RVG NFT portfolio, your participation in governance polls, and your positive contributions to the Genesis Hub. Prove you're a top supporter of the ecosystem.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Player Profiles</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Click on any name to view a detailed player profile. See their achievements, stats, NFT collection, and recent activity. A place to showcase your own accomplishments and scout the competition.
        </p>
      </div>
    </div>	
    <AsciiComingSoon theme={theme} />
  </div>
);
const Settings = ({ theme }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">Settings [Coming Soon...]</h1>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
      This is your control panel for the dApp. The Settings page gives you granular control over your profile's appearance, preferences, language, notifications, and security.
    </p>

    <div className="max-w-2xl w-full text-left space-y-6 border-t border-gray-200 dark:border-white pt-8 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile: Nickname & Avatar</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Set your public nickname and choose an avatar. This can be your ENS/BNS name, a custom name, and any NFT from your wallet.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance & Preferences</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tailor the look and feel of your dApp. Switch between Light and Dark themes, set your local time zone for accurate timestamps, and choose your preferred currency for displaying asset values.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Choose your preferred language for the dApp interface. Your selection will be saved for all future visits.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Stay updated on your account activity. Opt-in to receive notifications for successful transactions, incoming assets, and important community announcements.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Privacy</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your security and privacy with powerful controls.
        </p>
      </div>
    </div>	
    <AsciiComingSoon theme={theme} />
  </div>
);


export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { isConnected } = useAccount();
  const [isMobile, setIsMobile] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeTab, isMobile]);
  
  useEffect(() => {
    if (!isConnected) {
      setActiveTab("dashboard");
    }
  }, [isConnected]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    if (!isConnected) {
      return children;
    }	  
    switch (activeTab) {
      case "nfts":
        return <NftsPage />; // <-- USE THE IMPORTED COMPONENT
      case "tokens":
        return <TokensPage />;		
      case "activity":
        return <Activity />;
      case "palmoji":
        return <PalMoji theme={theme} />;
		case "genesishub":
		  return <GenesisHub theme={theme} />;
		case "clans":
		  return <Clans theme={theme} />;		
      case "earn":
        return <Earn theme={theme} />;
      case "scoreboard":
        return <Scoreboard theme={theme} />;
      case "settings":
        return <Settings theme={theme} />;
      case "dashboard":
      default:
        return children; 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-100 dark:bg-dark-300 transition-colors duration-200">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {sidebarOpen && isConnected && isMobile && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        {isConnected && (
          <div
            className={`${
              isMobile
                ? `fixed z-30 h-full w-64 transition-transform duration-300 ease-in-out transform ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  }`
                : "sticky top-0 h-screen w-64 shrink-0"
            }`}
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}

        <main
          className={`flex-grow p-4 sm:p-6 lg:p-8 w-full transition-all duration-200`}
        >
          <div className="max-w-7xl mx-auto">
            {!isConnected && (
              <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-primary-900/20 dark:via-secondary-900/20 dark:to-primary-800/20 animate-pulse-slow opacity-40 dark:opacity-20"></div>
              </div>
            )}

            <div className="relative">{renderContent()}</div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}