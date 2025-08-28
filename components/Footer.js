import React from "react";
import { useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";

export default function Footer() {
// --- START: Added state for the Contact Modal ---
  const { address } = useAccount();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', message: '' });
  const [contactError, setContactError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleContactChange = (field, value) => {
    setContactForm({ ...contactForm, [field]: value });
    if (contactError) setContactError(""); // Clear error on change
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.message.trim()) {
      setContactError("Your Name and Message are both required.");
      return;
    }
    setContactError("");
    setIsSending(true);

    try {
      await axios.post("https://reversegenesis.org/edata/contact.php", {
        owner: address || "Not Connected",
        name: contactForm.name,
        message: contactForm.message,
      });
      setIsContactModalOpen(false);
      setContactForm({ name: '', message: '' });
      setShowThankYou(true);
    } catch (error) {
      console.error("Contact form submission error:", error);
      setContactError("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };
  // --- END: Added state for the Contact Modal ---	
  return (
  <>
    <footer className="bg-white dark:bg-dark-200 border-t-2 border-dark-200 dark:border-light-200 py-6 px-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <svg
              className="w-6 h-6 text-black dark:text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 14.9998L9 11.9998M12 14.9998C13.3968 14.4685 14.7369 13.7985 16 12.9998M12 14.9998V19.9998C12 19.9998 15.03 19.4498 16 17.9998C17.08 16.3798 16 12.9998 16 12.9998M9 11.9998C9.53214 10.6192 10.2022 9.29582 11 8.04976C12.1652 6.18675 13.7876 4.65281 15.713 3.59385C17.6384 2.53489 19.8027 1.98613 22 1.99976C22 4.71976 21.22 9.49976 16 12.9998M9 11.9998H4C4 11.9998 4.55 8.96976 6 7.99976C7.62 6.91976 11 7.99976 11 7.99976M4.5 16.4998C3 17.7598 2.5 21.4998 2.5 21.4998C2.5 21.4998 6.24 20.9998 7.5 19.4998C8.21 18.6598 8.2 17.3698 7.41 16.5898C7.02131 16.2188 6.50929 16.0044 5.97223 15.9878C5.43516 15.9712 4.91088 16.1535 4.5 16.4998Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              RVG dApp
            </span>
          </div>

          <div className="flex space-x-6">
            <a
              href="https://x.com/ReVerseGenesis" target="_blank" rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 transition-colors"
            >
              <span className="sr-only">X (twitter)</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 transition-colors"
            >
              <span className="sr-only">Farcaster</span>
              <svg
                className="h-6 w-6 align-middle"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.24.24H5.76C2.5789.24 0 2.8188 0 6v12c0 3.1811 2.5789 5.76 5.76 5.76h12.48c3.1812 0 5.76-2.5789 5.76-5.76V6C24 2.8188 21.4212.24 18.24.24m.8155 17.1662v.504c.2868-.0256.5458.1905.5439.479v.5688h-5.1437v-.5688c-.0019-.2885.2576-.5047.5443-.479v-.504c0-.22.1525-.402.358-.458l-.0095-4.3645c-.1589-1.7366-1.6402-3.0979-3.4435-3.0979-1.8038 0-3.2846 1.3613-3.4435 3.0979l-.0096 4.3578c.2276.0424.5318.2083.5395.4648v.504c.2863-.0256.5457.1905.5438.479v.5688H4.3915v-.5688c-.0019-.2885.2575-.5047.5438-.479v-.504c0-.2529.2011-.4548.4536-.4724v-7.895h-.4905L4.2898 7.008l2.6405-.0005V5.0419h9.9495v1.9656h2.8219l-.6091 2.0314h-.4901v7.8949c.2519.0177.453.2195.453.4724"/>
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 transition-colors"
            >
              <span className="sr-only">Discord</span>
              <svg
                className="h-8 w-8 align-middle -mt-1"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dark-200 dark:border-light-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()}. All rights
            reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
			<button
			  onClick={() => setIsContactModalOpen(true)}
			  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
			>
			  Contact
			</button>
          </div>
        </div>
      </div>
    </footer>
{/* --- START: NEW CONTACT MODAL --- */}
  {isContactModalOpen && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999]" onClick={() => setIsContactModalOpen(false)} />
      <div className="relative z-[10000] flex items-center justify-center min-h-screen w-full px-4 py-10">
        <div className="relative bg-white dark:bg-gray-800 p-6 border-b2 border-2 border-black dark:border-white rounded-none shadow-md max-w-md w-full">
          <button
            className="absolute top-3 right-3 border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center transition bg-transparent text-gray-800 dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded cursor-pointer"
            onClick={() => setIsContactModalOpen(false)}
            aria-label="Close"
          >
            <span className="text-4xl leading-none font-bold">&#215;</span>
          </button>
          <h3 className="text-base font-normal mb-4 text-center text-gray-800 dark:text-white">Contact Us</h3>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-100">Your Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={contactForm.name}
                onChange={e => handleContactChange("name", e.target.value)}
                className="w-full mt-1 p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-100">Message <span className="text-red-500">*</span></label>
              <textarea
                rows="4"
                value={contactForm.message}
                onChange={e => handleContactChange("message", e.target.value)}
                className="w-full mt-1 p-2 border !border-black dark:!border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 focus:border-black dark:focus:border-white focus:border-[2px] focus:outline-none focus:ring-0 rounded-none"
              />
            </div>

            {contactError && <p className="text-sm text-red-500">{contactError}</p>}

            <div className="flex justify-between pt-2 space-x-4">
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                {isSending ? 'SENDING...' : 'SEND'}
              </button>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none transition-colors duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
  {/* --- END: NEW CONTACT MODAL --- */}

  {/* --- START: THANK YOU MESSAGE --- */}
  {showThankYou && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center px-4">
        <div className="relative bg-white dark:bg-gray-800 p-8 rounded shadow-lg max-w-sm w-full text-center">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Message Sent!</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Thank you for your feedback.</p>
            <button
                onClick={() => setShowThankYou(false)}
                className="px-4 py-1.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-sm [font-family:'Cygnito_Mono',sans-serif] uppercase tracking-wide rounded-none"
            >
                    OK
                </button>
            </div>
        </div>
      )}
    </> {/* <-- WRAPPER END */}
  );
}
