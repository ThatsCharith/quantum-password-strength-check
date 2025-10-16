"""A GUI and CLI application for checking and generating secure passwords.

This module provides functionality to:
- Check password strength using various criteria
- Generate secure random passwords
- Suggest improvements for weak passwords
- Export password check results
Supports both GUI and CLI interfaces
"""

import tkinter as tk
from tkinter import filedialog, messagebox
import re
import random
import string
import logging
import json
import argparse
import sys
from functools import lru_cache

from zxcvbn import zxcvbn

logging.basicConfig(filename='password_checker.log', level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s')

class Wordlist:
    """Class to handle wordlists for password checking."""

    _cache = {}

    def __init__(self, file_path):
        self.file_path = file_path
        self.words = self.load_wordlist()

    def load_wordlist(self):
        """Load wordlist from file."""
        if self.file_path in self._cache:
            return self._cache[self.file_path]

        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                wordlist = [line.strip() for line in file]
                self._cache[self.file_path] = wordlist
                return wordlist
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Error: File '{self.file_path}' not found.") from e
        except Exception as e:
            raise RuntimeError(
                f"Error loading wordlist from '{self.file_path}': {str(e)}"
            ) from e

    def is_word_in_list(self, word):
        """Check if a word is in the wordlist."""
        return word in self.words

# pylint: disable=R0903
class StrengthResult:
    """Class to store password strength check results."""

    def __init__(self, strength: str, score: int, message: str):
        self.strength = strength
        self.score = score
        self.message = message

class PasswordStrength:
    """Class to handle password strength checking and related operations."""

    def __init__(self, weak_wordlist_path: str = "./weak_passwords.txt",
        banned_wordlist_path: str = "./banned_passwords.txt"):
        self.weak_wordlist = (Wordlist(weak_wordlist_path)
            if weak_wordlist_path else None)
        self.banned_wordlist = (Wordlist(banned_wordlist_path)
            if banned_wordlist_path else None)
        self.min_password_length = 12
        # New parameter-based mapping
        self.strength_mapping = {
            0: "Critical",
            1: "Critical", 
            2: "Weak",
            3: "Fair",
            4: "Good",
            5: "Strong",
            6: "Perfect"
        }

    @lru_cache(maxsize=1000)
    def check_password_strength(self, password: str) -> StrengthResult:
        """Check the strength of a given password based on 6 parameters."""
        
        # Count parameters met
        params_met = 0
        missing_params = []
        
        # Parameter 1: Has uppercase
        if re.search(r'[A-Z]', password):
            params_met += 1
        else:
            missing_params.append("uppercase letter")
        
        # Parameter 2: Has lowercase
        if re.search(r'[a-z]', password):
            params_met += 1
        else:
            missing_params.append("lowercase letter")
        
        # Parameter 3: Has digit
        if re.search(r'\d', password):
            params_met += 1
        else:
            missing_params.append("number")
        
        # Parameter 4: Has special character
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            params_met += 1
        else:
            missing_params.append("special character")
        
        # Parameter 5: Length >= 12
        if len(password) >= self.min_password_length:
            params_met += 1
        else:
            missing_params.append(f"minimum {self.min_password_length} characters")
        
        # Parameter 6: Not in weak/banned lists
        if self.weak_wordlist and self.weak_wordlist.is_word_in_list(password):
            missing_params.append("not a common password")
        elif self.banned_wordlist and self.banned_wordlist.is_word_in_list(password):
            missing_params.append("not a banned password")
        else:
            params_met += 1
        
        # Determine strength based on parameters met
        strength = self.strength_mapping.get(params_met, "Critical")
        
        # Map to 0-4 score for frontend compatibility
        if params_met <= 1:
            score = 0  # CRITICAL
        elif params_met == 2:
            score = 1  # WEAK
        elif params_met == 3:
            score = 2  # FAIR
        elif params_met == 4:
            score = 2  # GOOD (still Fair level)
        elif params_met == 5:
            score = 3  # STRONG
        else:  # params_met == 6
            score = 4  # PERFECT
        
        # Build message
        if params_met == 6:
            message = f"Perfect! All security requirements met. ({params_met}/6 parameters)"
        elif params_met >= 5:
            message = f"Strong password. Missing: {', '.join(missing_params)}. ({params_met}/6 parameters)"
        elif params_met >= 3:
            message = f"Fair password. Missing: {', '.join(missing_params)}. ({params_met}/6 parameters)"
        else:
            message = f"Weak password. Missing: {', '.join(missing_params)}. ({params_met}/6 parameters)"
        
        return StrengthResult(strength, score, message)

    def generate_random_password(self, length=16):
        """Generate a random password."""
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(characters) for _ in range(length))

    def suggest_improvements(self, password: str) -> str:
        """Suggest improvements for a given password."""
        suggestions = []

        if len(password) < self.min_password_length:
            suggestions.append(f"Increase length to at least {self.min_password_length} characters")

        if not re.search(r'[A-Z]', password):
            suggestions.append("Add uppercase letters")
        if not re.search(r'[a-z]', password):
            suggestions.append("Add lowercase letters")
        if not re.search(r'\d', password):
            suggestions.append("Add numbers")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            suggestions.append("Add special characters")
        
        if self.weak_wordlist and self.weak_wordlist.is_word_in_list(password):
            suggestions.append("Avoid common passwords")
        elif self.banned_wordlist and self.banned_wordlist.is_word_in_list(password):
            suggestions.append("This password is banned due to security breaches")

        if not suggestions:
            suggestions.append("Your password meets all requirements!")

        return "Suggested improvements:\n\n" + "\n".join(f"- {s}" for s in suggestions)

# Rest of the code remains the same...
# (PasswordStrengthGUI, PasswordStrengthCLI, and main function stay unchanged)

# pylint: disable=R0902
class PasswordStrengthGUI:
    """GUI class for Password Strength Checker."""

    def __init__(self, master):
        self.master = master
        master.title("Password Strength Checker")
        
        # Configure main window
        master.geometry("500x600")
        master.configure(bg="#f0f0f0")
        
        # Create main container frame
        main_frame = tk.Frame(master, padx=20, pady=20, bg="#f0f0f0")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header section
        header_frame = tk.Frame(main_frame, bg="#f0f0f0")
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        tk.Label(header_frame, text="Password Strength Checker", 
                font=("Arial", 16, "bold"), bg="#f0f0f0").pack()
        
        # Input section
        input_frame = tk.Frame(main_frame, bg="#f0f0f0")
        input_frame.pack(fill=tk.X, pady=10)
        
        self.password_strength = PasswordStrength()
        
        tk.Label(input_frame, text="Enter password:", font=("Arial", 10), 
                bg="#f0f0f0").pack(anchor=tk.W)
        
        self.password_entry = tk.Entry(input_frame, show="*", font=("Arial", 12),
                                    width=30, bd=2, relief=tk.GROOVE)
        self.password_entry.pack(fill=tk.X, pady=5)
        self.password_entry.bind('<Return>', lambda event: self.check_password())
        
        # Buttons section
        button_frame = tk.Frame(main_frame, bg="#f0f0f0")
        button_frame.pack(fill=tk.X, pady=10)
        
        self.check_button = tk.Button(button_frame, text="Check Strength", 
                                    font=("Arial", 10), bg="#4CAF50", fg="white",
                                    command=self.check_password)
        self.check_button.pack(side=tk.LEFT, padx=5)
        
        self.generate_button = tk.Button(button_frame, text="Generate", 
                                       font=("Arial", 10), bg="#2196F3", fg="white",
                                       command=self.generate_password)
        self.generate_button.pack(side=tk.LEFT, padx=5)
        
        # Results section
        results_frame = tk.Frame(main_frame, bg="#f0f0f0")
        results_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Strength meter
        self.strength_meter = tk.Frame(results_frame, height=20, bg="white", bd=1, relief=tk.SUNKEN)
        self.strength_meter.pack(fill=tk.X, pady=5)
        self.meter_fill = tk.Frame(self.strength_meter, height=18, bg="red")
        self.meter_fill.pack(side=tk.LEFT)
        
        self.result_label = tk.Label(results_frame, text="", font=("Arial", 10), 
                                   bg="#f0f0f0", justify=tk.LEFT)
        self.result_label.pack(fill=tk.X, pady=5)
        
        self.suggestion_label = tk.Label(results_frame, text="", font=("Arial", 10), 
                                       bg="#f0f0f0", justify=tk.LEFT, wraplength=400)
        self.suggestion_label.pack(fill=tk.X, pady=5)
        
        # Generated password section
        gen_frame = tk.Frame(results_frame, bg="#f0f0f0")
        gen_frame.pack(fill=tk.X, pady=10)
        
        self.password_display = tk.Text(gen_frame, height=2, width=30, wrap=tk.WORD,
                                      font=("Arial", 10), bd=2, relief=tk.GROOVE)
        self.password_display.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        self.copy_button = tk.Button(gen_frame, text="Copy", 
                                   font=("Arial", 10), bg="#607D8B", fg="white",
                                   command=self.copy_password)
        self.copy_button.pack(side=tk.RIGHT, padx=(5, 0))
        
        # Footer section
        footer_frame = tk.Frame(main_frame, bg="#f0f0f0")
        footer_frame.pack(fill=tk.X, pady=(20, 0))
        
        self.export_button = tk.Button(footer_frame, text="Export Results", 
                                      font=("Arial", 10), bg="#9E9E9E", fg="white",
                                      command=self.export_results)
        self.export_button.pack(side=tk.LEFT, padx=5)
        
        self.quit_button = tk.Button(footer_frame, text="Quit", 
                                   font=("Arial", 10), bg="#F44336", fg="white",
                                   command=master.quit)
        self.quit_button.pack(side=tk.RIGHT, padx=5)
        
        # Tips section
        tips_frame = tk.Frame(main_frame, bg="#f0f0f0")
        tips_frame.pack(fill=tk.X, pady=(20, 0))
        
        self.tip_label = tk.Label(tips_frame, 
                                 text="Password Tips:\n"
                                 "• Use 12+ characters\n"
                                 "• Mix letters, numbers & symbols\n"
                                 "• Avoid personal info\n"
                                 "• Use unique passwords",
                                 font=("Arial", 9), bg="#f0f0f0", justify=tk.LEFT,
                                 fg="#555555")
        self.tip_label.pack(anchor=tk.W)

        self.results = []

    def check_password(self):
        """Check the strength of the entered password."""
        password = self.password_entry.get()
        result = self.password_strength.check_password_strength(password)
        
        # Update strength meter visualization
        meter_width = (result.score + 1) * 100  # Scale to 100-500px
        colors = ["#FF5252", "#FF9800", "#FFEB3B", "#4CAF50", "#2E7D32"]
        self.meter_fill.config(width=meter_width, bg=colors[result.score])
        
        self.result_label.config(text=f"{result.strength}: {result.message}")
        suggestions = self.password_strength.suggest_improvements(password)
        self.suggestion_label.config(text=suggestions)
        self.results.append({"password": password, "strength": result.strength,
        "message": result.message})
        logging.info("Password checked: %s", result.strength)

    def generate_password(self):
        """Generate a random strong password."""
        password = self.password_strength.generate_random_password()
        self.password_entry.delete(0, tk.END)
        self.password_entry.insert(0, password)
        # Insert the generated password into the text box
        self.password_display.delete(1.0, tk.END)
        self.password_display.insert(tk.END, password)
        copy_to_clipboard = messagebox.askyesno("Generated Password",
            f"Generated password: {password}\n\nDo you want to copy the password to clipboard?")
        if copy_to_clipboard:
            self.master.clipboard_clear()
            self.master.clipboard_append(password)
            messagebox.showinfo("Clipboard", "Password copied to clipboard.")

    def copy_password(self):
        """Copy the password from the text box to clipboard."""
        password = self.password_display.get(1.0, tk.END).strip()
        self.master.clipboard_clear()
        self.master.clipboard_append(password)
        messagebox.showinfo("Clipboard", "Password copied to clipboard.")

    def export_results(self):
        """Export the password check results to a JSON file."""
        if not self.results:
            messagebox.showerror("Error", "No results to export.")
            return
        file_path = filedialog.asksaveasfilename(defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")])
        if not file_path:
            return
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(self.results, file, indent=4)
        messagebox.showinfo("Export Successful", f"Results exported to {file_path}.")

class PasswordStrengthCLI:
    """CLI interface for Password Strength Checker."""

    def __init__(self):
        self.password_strength = PasswordStrength()

    def check_password(self, password):
        """Check password strength and print results."""
        result = self.password_strength.check_password_strength(password)
        print(f"\nStrength: {result.strength}")
        print(f"Message: {result.message}")
        print(self.password_strength.suggest_improvements(password))

    def generate_password(self, length=16):
        """Generate and display a random password."""
        password = self.password_strength.generate_random_password(length)
        print(f"\nGenerated Password: {password}")
        self.check_password(password)
        return password

def main():
    """Main entry point for both GUI and CLI interfaces."""
    parser = argparse.ArgumentParser(description="Password Strength Checker")
    parser.add_argument("--cli", action="store_true", help="Run in CLI mode")
    parser.add_argument("--check", type=str, help="Check strength of provided password")
    parser.add_argument("--generate", action="store_true", help="Generate a strong password")
    parser.add_argument("--length", type=int, default=16, help="Length of generated password")

    args = parser.parse_args()

    if args.cli or args.check or args.generate:
        cli = PasswordStrengthCLI()
        if args.check:
            cli.check_password(args.check)
        elif args.generate:
            cli.generate_password(args.length)
        elif args.cli:
            while True:
                print("\nPassword Strength Checker CLI")
                print("1. Check Password Strength")
                print("2. Generate Strong Password")
                print("3. Exit")
                choice = input("\nEnter your choice (1-3): ")

                if choice == "1":
                    password = input("Enter password to check: ")
                    cli.check_password(password)
                elif choice == "2":
                    length = input("Enter desired password length (default 16): ")
                    try:
                        length = int(length) if length else 16
                        cli.generate_password(length)
                    except ValueError:
                        print("Invalid length. Using default length of 16.")
                        cli.generate_password()
                elif choice == "3":
                    print("Goodbye!")
                    sys.exit(0)
                else:
                    print("Invalid choice. Please try again.")
    else:
        root = tk.Tk()
        PasswordStrengthGUI(root)
        root.mainloop()

if __name__ == "__main__":
    main()