"""A GUI and CLI application for checking and generating secure passwords.

This module provides functionality to:
- Check password strength using various criteria
- Generate secure random passwords
- Suggest improvements for weak passwords
- Export password check results
Supports CLI interface
"""

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

    def run(self):
        while True:
            print("\nPassword Strength Checker CLI")
            print("1. Check Password Strength")
            print("2. Generate Strong Password")
            print("3. Exit")
            choice = input("\nEnter your choice (1-3): ")

            if choice == "1":
                password = input("Enter password to check: ")
                self.check_password(password)
            elif choice == "2":
                length = input("Enter desired password length (default 16): ")
                try:
                    length = int(length) if length else 16
                    self.generate_password(length)
                except ValueError:
                    print("Invalid length. Using default length of 16.")
                    self.generate_password()
            elif choice == "3":
                print("Goodbye!")
                sys.exit(0)
            else:
                print("Invalid choice. Please try again.")

def main():
    """Main entry point for the CLI interface."""
    parser = argparse.ArgumentParser(description='Password Strength Checker')
    parser.add_argument('--check', type=str, help='Check password strength')
    parser.add_argument('--generate', type=int, nargs='?', const=16, metavar='LENGTH',
                      help='Generate a random password (default: 16 chars)')
    
    args = parser.parse_args()
    cli = PasswordStrengthCLI()
    
    if args.check:
        cli.check_password(args.check)
    elif args.generate:
        cli.generate_password(args.generate)
    else:
        cli.run()

if __name__ == "__main__":
    main()