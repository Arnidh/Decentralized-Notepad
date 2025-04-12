import React, { useEffect, useState, useRef } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import NotepadABI from "./NotepadABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with deployed address

const App = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isDark, setIsDark] = useState(false);
  const contentRef = useRef();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const provider = new BrowserProvider(window.ethereum);
    let signer;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }

      signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const instance = new Contract(CONTRACT_ADDRESS, NotepadABI, signer);

      setContract(instance);
      setAccount(userAddress);

      const saved = await instance.loadDocument();
      if (contentRef.current) contentRef.current.innerHTML = saved;
    } catch (err) {
      console.error("MetaMask error:", err);
    }
  };

  const handleNewDoc = () => {
    if (window.confirm("Start a new document? Unsaved changes will be lost.")) {
      if (contentRef.current) contentRef.current.innerHTML = "";
    }
  };

  const applyCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const saveAndDownloadWithPayment = async () => {
    if (!contract || !contentRef.current) return;

    try {
      const content = contentRef.current.innerHTML;

      const tx = await contract.saveDocument(content, {
        value: ethers.parseEther("0.001"),
      });

      await tx.wait();

      const blob = new Blob([contentRef.current.innerText], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "MyNote.txt";
      link.click();

      alert("✅ Saved and downloaded!");
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("⚠️ Payment failed or cancelled.");
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
          background-color: ${isDark ? "#121212" : "#f5f6f8"};
          color: ${isDark ? "#f1f1f1" : "#000"};
        }
        .menu-bar {
          background: ${isDark ? "#1e1e1e" : "#e0e0e0"};
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid #ccc;
        }
        .toolbar {
          background: ${isDark ? "#2c2c2c" : "#f0f0f0"};
          padding: 8px 12px;
          border-bottom: 1px solid #ddd;
        }
        .toolbar button,
        .menu-bar button,
        .toolbar select {
          margin-right: 10px;
          padding: 6px 12px;
          font-size: 0.9rem;
          cursor: pointer;
          background: ${isDark ? "#333" : "white"};
          color: ${isDark ? "#fff" : "#000"};
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .editor {
          margin: 20px;
          padding: 20px;
          min-height: 500px;
          background: ${isDark ? "#1c1c1c" : "white"};
          color: ${isDark ? "#e0e0e0" : "#000"};
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          outline: none;
          line-height: 1.6;
          white-space: pre-wrap;
          text-align: left;
        }
        .wallet {
          font-size: 0.9rem;
        }
      `}</style>

      <div className="menu-bar">
        <div>
          <button onClick={handleNewDoc}>📄 New Doc</button>
          <button onClick={saveAndDownloadWithPayment}>💾 Save & Download (0.001 ETH)</button>
          <button onClick={toggleTheme}>{isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}</button>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {account && (
            <span className="wallet">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          )}
        </div>
      </div>

      <div className="toolbar">
        <button onClick={() => applyCommand("bold")}>Bold</button>
        <button onClick={() => applyCommand("italic")}>Italic</button>
        <button onClick={() => applyCommand("underline")}>Underline</button>
        <button onClick={() => applyCommand("removeFormat")}>Clear</button>
        <select onChange={(e) => applyCommand("fontSize", e.target.value)}>
          <option value="1">Very Small</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Larger</option>
          <option value="6">Huge</option>
          <option value="7">Massive</option>
        </select>
      </div>

      <div
        ref={contentRef}
        className="editor"
        contentEditable
        suppressContentEditableWarning={true}
      />
    </>
  );
};

export default App;