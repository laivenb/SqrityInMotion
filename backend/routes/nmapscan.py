from flask import Flask, render_template, request
import subprocess
import os
import xml.etree.ElementTree as ET
import re

app = Flask(__name__)

# Function to save scan result to XML
def save_to_xml(filename, data):
    try:
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        root = ET.Element("nmap_report")
        lines = data.splitlines()
        for line in lines:
            entry = ET.SubElement(root, "entry")
            entry.text = line
        tree = ET.ElementTree(root)
        tree.write(filename, encoding="utf-8", xml_declaration=True)
        print(f"Report saved to {filename}")
    except Exception as e:
        print(f"Failed to save the report: {e}")

# Function to parse Nmap scan output
def parse_nmap_output(output):
    results = []
    mac_address = None
    host_status = ""
    filtered_ports = ""

    # Split the output into lines for processing
    lines = output.splitlines()
    for line in lines:
        # Extract the host status
        if "Host is up" in line:
            host_status = line.strip()
        # Extract filtered ports information
        if "Not shown" in line:
            filtered_ports = line.strip()
        # Example regex to capture port, state, and service
        port_info = re.match(r'^\s*(\d+/[a-z]+)\s+([a-z]+)\s+(.+)$', line)
        if port_info:
            results.append({
                'port': port_info.group(1),
                'state': port_info.group(2),
                'service': port_info.group(3)
            })
        # Example to find MAC address
        if "MAC Address:" in line:
            mac_address = line.split("MAC Address:")[1].strip().split()[0]

    return host_status, filtered_ports, results, mac_address

# NMAP Scanning device function
def scan_device(ip):
    result = subprocess.run(["nmap", ip], capture_output=True, text=True)
    return result.stdout

# NMAP Scanning network function
def scan_network(network):
    result = subprocess.run(["nmap", network], capture_output=True, text=True)
    return result.stdout

@app.route('/scan/device', methods=['POST'])
def handle_scan_device():
    ip = request.form.get('ip-address')
    service = request.form.get('service')
    output = scan_device(ip)
    save_to_xml(f"backend/report/{ip}.xml", output)

    # Parse the scan output
    host_status, filtered_ports, results, mac_address = parse_nmap_output(output)

    # Prepare data for the report page
    report_data = {
        'ip': ip,
        'service': service,
        'hostStatus': host_status,
        'filteredPorts': filtered_ports,
        'results': results,
        'macAddress': mac_address or "Not found"  # Fallback if no MAC found
    }

    return render_template('nmap-report.html', data=report_data)

@app.route('/scan/network', methods=['POST'])
def handle_scan_network():
    network = request.form.get('ip-address')  # Use the same field for the network scan
    service = request.form.get('service')
    output = scan_network(network)
    sanitized_network = network.replace('/', '_')
    save_to_xml(f"backend/report/{sanitized_network}.xml", output)

    # Parse the scan output
    host_status, filtered_ports, results, mac_address = parse_nmap_output(output)

    # Prepare data for the report page
    report_data = {
        'ip': network,
        'service': service,
        'hostStatus': host_status,
        'filteredPorts': filtered_ports,
        'results': results,
        'macAddress': mac_address or "Not found"  # Fallback if no MAC found
    }

    return render_template('nmap-report.html', data=report_data)

if __name__ == "__main__":
    app.run(debug=True)
