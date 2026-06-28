#!/usr/bin/env node
"use strict";

const { execFileSync, spawn } = require("child_process");
const fs = require("fs");

function isWSL() {
  try {
    return /microsoft/i.test(fs.readFileSync("/proc/version", "utf8"));
  } catch {
    return false;
  }
}

// Inside WSL2, Node's own network interfaces are the VM's internal vEthernet
// addresses (172.x), which a phone/tablet on the real Wi-Fi/LAN can't reach.
// Ask Windows itself (reachable through WSL interop) for its LAN-facing
// adapter IP and use that as the address Expo advertises in the dev server
// URL / QR code instead.
function getWindowsHostLanIp() {
  let output;
  try {
    output = execFileSync("ipconfig.exe", { encoding: "utf8" });
  } catch {
    return null;
  }
  const blocks = output.split(/\r?\n\r?\n/);
  for (const block of blocks) {
    if (/vEthernet|Loopback|Bluetooth/i.test(block)) continue;
    const match = block.match(/IPv4 Address[.\s]*:\s*([\d.]+)/i);
    if (match && (match[1].startsWith("192.168.") || match[1].startsWith("10."))) {
      return match[1];
    }
  }
  return null;
}

const env = { ...process.env };
if (isWSL() && !env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  const ip = getWindowsHostLanIp();
  if (ip) {
    env.REACT_NATIVE_PACKAGER_HOSTNAME = ip;
    console.log(`[wsl] Advertising Expo dev server at ${ip} (Windows host LAN IP)`);
  } else {
    console.warn(
      "[wsl] Could not auto-detect the Windows host LAN IP from ipconfig.exe. " +
        "Set REACT_NATIVE_PACKAGER_HOSTNAME to your Wi-Fi/Ethernet adapter's IPv4 address manually, " +
        "e.g. REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.50 npm start"
    );
  }
}

const child = spawn("npx", ["expo", "start", ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
