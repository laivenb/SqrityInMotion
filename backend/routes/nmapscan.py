import subprocess
import os
import xml.etree.ElementTree as ET

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

# NMAP Scanning device function start
def scan_device():
    ip = input("Enter device IP address: ")
    print(f"Scanning device: {ip}")
    result = subprocess.run(["nmap", ip], capture_output=True, text=True)
    scan_output = result.stdout
    print(scan_output)

    save_to_xml(f"backend/report/{ip}.xml", scan_output)
# NMAP Scanning device function end

# NMAP Scanning network function start
def scan_network():
    network = input("Enter the network [192.168.1.0/24]: ")
    print(f"Scanning network: {network}")
    result = subprocess.run(["nmap", network], capture_output=True, text=True)
    scan_output = result.stdout
    print(scan_output)

    sanitized_network = network.replace('/', '_')

    save_to_xml(f"backend/report/{sanitized_network}.xml", scan_output)
# NMAP Scanning network function end

# APPLICATION exit function start
def exit_program():
    print("Exiting the Program.")
    return False
# APPLICATION exit function end

# APPLICATION invalid choice handling function start
def invalid_choice():
    print("Invalid choice.")
    return True
# APPLICATION invalid choice handling function end

# NMAP handle scan device function start
def handle_scan_device():
    scan_device()
    return True
# NMAP handle scan device function end

# NMAP handle scan network function start
def handle_scan_network():
    scan_network()
    return True
# NMAP handle scan network function end

# APPLICATION main menu start
def main_menu():
    menu_actions = {
        '1': handle_scan_device,
        '2': handle_scan_network,
        '0': exit_program
    }

    while True:
        print("NMAP Module Menu:")
        print("[1] Scan specific device")
        print("[2] Scan whole network")
        print("[0] Exit")

        choice = input("Enter Choice: ")

        action = menu_actions.get(choice, invalid_choice)
        continue_loop = action()

        if not continue_loop:
            break
# APPLICATION main menu end

if __name__ == "__main__":
    main_menu()