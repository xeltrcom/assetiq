// Device discovery — parses results from network scans and agent reports
// Network scanning must run from a machine on the same LAN (not Vercel)
// Use the GitHub Actions self-hosted runner or a local script

export interface DiscoveredDevice {
  ip: string
  hostname?: string
  mac?: string
  os?: string
  osVersion?: string
  vendor?: string
  openPorts?: number[]
  processor?: string
  ramGb?: number
  storageGb?: number
  batteryHealth?: number
  serialNumber?: string
}

// Parse nmap XML output into structured device data
export function parseNmapOutput(xmlOutput: string): DiscoveredDevice[] {
  const devices: DiscoveredDevice[] = []
  const hostRegex = /<host[^>]*>([\s\S]*?)<\/host>/g
  let match

  while ((match = hostRegex.exec(xmlOutput)) !== null) {
    const block = match[1]

    const ipMatch       = block.match(/<address addr="([^"]+)" addrtype="ipv4"/)
    const macMatch      = block.match(/<address addr="([^"]+)" addrtype="mac"(?:[^>]*vendor="([^"]*)")?/)
    const hostnameMatch = block.match(/<hostname name="([^"]+)"/)
    const osMatch       = block.match(/<osclass[^>]*osfamily="([^"]*)"[^>]*osgen="([^"]*)"/)

    if (!ipMatch) continue

    devices.push({
      ip:        ipMatch[1],
      mac:       macMatch?.[1],
      vendor:    macMatch?.[2],
      hostname:  hostnameMatch?.[1],
      os:        osMatch?.[1],
      osVersion: osMatch?.[2],
    })
  }

  return devices
}

// Parse agent report (JSON posted from a device running our lightweight agent)
export function parseAgentReport(report: any): DiscoveredDevice {
  return {
    ip:            report.ip           ?? '',
    hostname:      report.hostname     ?? '',
    mac:           report.mac          ?? '',
    os:            report.os           ?? '',
    osVersion:     report.os_version   ?? '',
    processor:     report.cpu          ?? '',
    ramGb:         report.ram_gb       ? Math.round(report.ram_gb) : undefined,
    storageGb:     report.storage_gb   ? Math.round(report.storage_gb) : undefined,
    batteryHealth: report.battery_pct  ?? undefined,
    serialNumber:  report.serial       ?? '',
  }
}

// Map discovered device to AssetIQ asset fields
export function deviceToAssetFields(device: DiscoveredDevice) {
  return {
    ipAddress:    device.ip,
    macAddress:   device.mac,
    hostname:     device.hostname,
    os:           device.os,
    osVersion:    device.osVersion,
    brand:        device.vendor,
    processor:    device.processor,
    ramGb:        device.ramGb,
    storageGb:    device.storageGb,
    batteryHealth: device.batteryHealth,
    serialNumber: device.serialNumber,
  }
}

// PowerShell script to run on Windows devices (copy-paste for IT admins)
export const WINDOWS_AGENT_SCRIPT = `
# AssetIQ Windows Agent — run on each device to auto-report specs
# Right-click PowerShell → Run as Administrator

$cpu     = (Get-WmiObject Win32_Processor).Name
$ram     = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
$disk    = [math]::Round((Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'").Size / 1GB)
$serial  = (Get-WmiObject Win32_BIOS).SerialNumber
$os      = (Get-WmiObject Win32_OperatingSystem).Caption
$osver   = (Get-WmiObject Win32_OperatingSystem).Version
$ip      = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'} | Select-Object -First 1).IPAddress
$mac     = (Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Select-Object -First 1).MacAddress
$host    = $env:COMPUTERNAME

# Battery (laptops only)
$battery = try { (Get-WmiObject Win32_Battery).EstimatedChargeRemaining } catch { $null }

$payload = @{
  ip          = $ip
  mac         = $mac
  hostname    = $host
  os          = $os
  os_version  = $osver
  cpu         = $cpu
  ram_gb      = $ram
  storage_gb  = $disk
  serial      = $serial
  battery_pct = $battery
} | ConvertTo-Json

Invoke-RestMethod -Uri "REPLACE_WITH_YOUR_APP_URL/api/discovery/agent" -Method POST -Body $payload -ContentType "application/json"
Write-Host "AssetIQ: device registered successfully"
`

// Bash script for Mac/Linux devices
export const LINUX_AGENT_SCRIPT = `
#!/bin/bash
# AssetIQ Linux/Mac Agent — run on each device

IP=$(hostname -I | awk '{print $1}')
HOSTNAME=$(hostname)
OS=$(uname -s)
OS_VER=$(uname -r)
CPU=$(grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)
RAM=$(free -g | awk '/^Mem:/{print $2}')
DISK=$(df -BG / | awk 'NR==2{print $2}' | tr -d 'G')
SERIAL=$(sudo dmidecode -s system-serial-number 2>/dev/null || echo "unknown")
MAC=$(cat /sys/class/net/$(ip route show default | awk '/default/ {print $5}')/address 2>/dev/null)

curl -s -X POST REPLACE_WITH_YOUR_APP_URL/api/discovery/agent \\
  -H "Content-Type: application/json" \\
  -d "{\"ip\":\"$IP\",\"hostname\":\"$HOSTNAME\",\"os\":\"$OS\",\"os_version\":\"$OS_VER\",\"cpu\":\"$CPU\",\"ram_gb\":$RAM,\"storage_gb\":$DISK,\"serial\":\"$SERIAL\",\"mac\":\"$MAC\"}"

echo "AssetIQ: device registered"
`
