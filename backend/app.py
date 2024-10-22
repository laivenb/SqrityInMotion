import subprocess

ArrOutput = []

#NMAP Scanning device function start
def scan_device():
    ip = input("Enter device IP address: ")
    print(f"Scanning device: {ip}")
    result = subprocess.run(["nmap", ip], capture_output=True, text=True)
    print(result.stdout)
# NMAP Scanning device function end

#NMAP Scanning network function start
# NMAP Scanning network function start
def scan_network():
    network = input("Enter the network [192.168.1.0/24]: ")
    print(f"Scanning network: {network}")
    try:
        # nmap integration
        result = subprocess.run(["nmap", network], capture_output=True, text=True,
                                timeout=300)  # timeout to prevent hanging
        output = result.stdout
        print(output)
        ArrOutput.append(output)  #appends output to a session array

        ip_addresses = []
        lines = output.split('\n')
        for line in lines:
            if "Nmap scan report for" in line:
                parts = line.split()
                if len(parts) > 4:
                    ip_address = parts[4]
                    ip_addresses.append(ip_address)

        # Check open ports from output start
        if "open" in output:
            if ip_addresses:
                print("Several hosts are detected with open ports:")
                for ip in ip_addresses:
                    print(f"IP Address: {ip}")
            else:
                print("Hosts with open ports detected, but IP addresses could not be determined.")

            choice = input(
                "Proceed for vulnerability scanning?\n[1] Yes\n[2] Save output to array\n[0] Back to main menu\nEnter choice: ")

            if choice == '1':
                ip = input("Enter device IP address: ")
                vulScan(ip)
            elif choice == '2':
                print("Output saved to array.")
            elif choice == '0':
                print("Returning to main menu.")
            else:
                print("Invalid choice. Returning to main menu.")
        else:
            print("No open ports detected.")
        # Check open ports from output end

    # Try catch error handling
    except subprocess.TimeoutExpired:
        print("The network scan is taking too long and has timed out.")
    except KeyboardInterrupt:
        print("\nScan interrupted by user.")
    except Exception as e:
        print(f"An error occurred: {e}")
# NMAP Scanning network function end

#RUN VULNERABILITY SCAN function start
def vulScan(target_ip):
    try:
        print(f"Running vulnerability scan on {target_ip}...")
        command = ["sudo", "nmap", "-sV", "-p21-8000", "--script", "vulners", target_ip]
        result = subprocess.run(command, capture_output=True, text=True)
        output = result.stdout
        print(output)

        parse_vulnerability_summary(output) #summarize output to a readable format

    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running the vulnerability scan: {e}")
# RUN VULNERABILITY SCAN function end

#Output vulscan summary start
def parse_vulnerability_summary(output):
    lines = output.split('\n')
    current_port = None
    port_summary = {}

    for line in lines:
        #Port information summary
        if "/tcp" in line and "open" in line:
            parts = line.split()
            current_port = parts[0]
            service_info = ' '.join(parts[2:])  
            port_summary[current_port] = {'service': service_info, 'vulnerabilities': []}

        #CVE information summary
        if "CVE-" in line:
            vuln_info = line.strip()
            if current_port:
                port_summary[current_port]['vulnerabilities'].append(vuln_info)

    #Displaying
    for port, details in port_summary.items():
        print(f"Port {port}")
        print(f"Service: {details['service']}")
        if details['vulnerabilities']:
            print("Vulnerabilities:")
            for vuln in details['vulnerabilities']:
                print(f"  {vuln}")
        else:
            print("No vulnerabilities found.")
        print("-" * 30)
#Output vulscan summary end

#APPLICATION exit function start
def exit_program():
    print("Exiting the Program.")
    print("Collected Outputs:")
    for idx, output in enumerate(ArrOutput, 1):
        print(f"Output {idx}:")
        print(output)
    return False
#APPLICATION exit function end

#APPLICATION invalid choice handling function start
def invalid_choice():
    print("Invalid choice.")
    return True
#APPLICATION invalid choice handling function end

#NMAP handle scan device function start
def handle_scan_device():
    scan_device()
    return True
#NMAP handle scan device function end

#NMAP handle scan network function start
def handle_scan_network():
    scan_network()
    return True
#NMAP handle scan network function start

#APPLICATION main menu start
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


if __name__ == "__main__":
    main_menu()
#APPLICATION main menu end