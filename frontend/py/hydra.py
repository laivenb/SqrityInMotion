import pexpect
import time
import re

# Start Hydra with pexpect
def start_hydra(target_ip, username_file, password_file, service):
    # Make sure to replace target_ip, username_file, password_file,
    # and service with actual values or files as required.

    print(f"Starting Hydra for {service} on {target_ip}...\n")
    command = f"hydra -L {username_file} -P {password_file} {target_ip} {service}"
    process = pexpect.spawn(command, encoding='utf-8')
    print("Hydra started successfully.")
    return process

# Function to send a command to Hydra (if needed) and wait for prompt
def send_command(process, command):
    print(f"Sending command: {command}")
    process.sendline(command)
    process.expect('\n')  # Hydra does not have a prompt; use new line as a signal
    output = process.before.strip()  # Output from the command
    print(f"Output from Hydra:\n{output}")
    return output

# Function to monitor Hydra output for successful login attempts
def monitor_for_success(process):
    print("Monitoring for successful login attempts...\n")
    success_pattern = re.compile(r"\[.*?\]\slogin:\s'(.+?)'\s+password:\s'(.+?)'")  # Pattern for successful login

    while True:
        try:
            # Read the next line of output from Hydra
            line = process.readline().strip()
            if line:
                print("Console output:", line)  # Print each line for debugging
                
                # Check if a successful login is detected
                match = success_pattern.search(line)
                if match:
                    username = match.group(1)
                    password = match.group(2)
                    print(f"Successful login detected! Username: {username}, Password: {password}")
                    break  # Exit after detecting a successful login

        except pexpect.TIMEOUT:
            print("Timeout while waiting for output.")
            continue
        except Exception as e:
            print(f"Unexpected error: {e}")
            break

# Display menu options
def show_menu():
    print("\nMenu:")
    print("1. Start Hydra brute-force attack")
    print("2. Monitor for successful login attempts")
    print("0. Exit")

# Main function to handle menu choices
def main():
    hydra_process = None  # Track Hydra process

    while True:
        show_menu()
        choice = input("Enter your choice (0, 1, or 2): ")

        if choice == '1':
            target_ip = input("Enter target IP: ")
            username_file = input("Enter path to username file: ")
            password_file = input("Enter path to password file: ")
            service = input("Enter service (e.g., ssh, ftp, etc.): ")
            hydra_process = start_hydra(target_ip, username_file, password_file, service)
        elif choice == '2':
            if hydra_process:
                monitor_for_success(hydra_process)
            else:
                print("Please start Hydra first by selecting option 1.")
        elif choice == '0':
            print("Exiting the application.")
            if hydra_process:
                hydra_process.terminate()  # Close Hydra process if it's running
            break
        else:
            print("Invalid choice. Please enter 0, 1, or 2.")

if __name__ == "__main__":
    main()
