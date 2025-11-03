import streamlit as st
from password_strength_checker import PasswordStrength

ps = PasswordStrength()

st.title("Quantum Password Strength Checker 🔒")

password = st.text_input("Enter your password:", type="password")

if st.button("Check Strength"):
    if not password:
        st.warning("Please enter a password!")
    else:
        result = ps.check_password_strength(password)
        suggestions = ps.suggest_improvements(password)

        st.subheader("Strength Result:")
        st.write(f"**Message:** {result.message}")
        st.write(f"**Score:** {result.score}/5")

        # Suggestions
        suggestion_list = [
            s.strip("- ")
            for s in suggestions.split("\n")
            if s.startswith("- ")
        ]

        if suggestion_list:
            st.subheader("Suggestions to Improve:")
            for s in suggestion_list:
                st.write(f"✅ {s}")
        else:
            st.success("Your password is very strong!")

if st.button("Generate Strong Password"):
    generated = ps.generate_random_password()
    st.success(f"Generated Password: `{generated}`")
