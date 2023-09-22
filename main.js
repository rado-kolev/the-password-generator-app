const resultEl = document.getElementById("result");
const lengthEl = document.getElementById("length");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numbersEl = document.getElementById("numbers");
const symbolsEl = document.getElementById("symbols");
const generateEl = document.getElementById("generate");
const clipboard = document.getElementById("clipboard");
const clearButton = document.getElementById("clear");
const messageElement = document.getElementById("message");
const strengthIndicator = document.getElementById("strengthIndicator");

const randomFunc = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol,
};

clipboard.addEventListener("click", (event) => {
  const password = resultEl.innerText;

  if (!password) {
    return; // No password to copy, so do nothing
  }

  // Prevent copying the message if it matches the error message
  if (password === "Please select at least one option for the password.") {
    event.preventDefault();
    resultEl.innerText = ""; // Clear the message
    strengthIndicator.style.display = "none"; // Hide the strength indicator
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = password;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();

    showMessage("Password copied to clipboard", 3000); // Show message for 3 seconds
});

// Function to show a message for a specified duration (in milliseconds)
function showMessage(message, duration) {
  messageElement.innerText = message;
  messageElement.style.display = "block";

  setTimeout(() => {
    messageElement.style.display = "none";
  }, duration);
}

// Event listener for the password length input
lengthEl.addEventListener("blur", () => {

  const length = +lengthEl.value;
  const min = +lengthEl.min;
  const max = +lengthEl.max;

  // Check if the entered value is below the minimum or above the maximum
  if (length < min || isNaN(length)) {
    lengthEl.value = min; // Set the value to the minimum
  } else if (length > max) {
    lengthEl.value = max; // Set the value to the maximum
  }

  resultEl.innerText = ""; // Hide the message
  strengthIndicator.style.display = "none"; // Hide the strength indicator
});

// Event listeners for the checkboxes
[lowercaseEl, uppercaseEl, numbersEl, symbolsEl].forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    resultEl.innerText = ""; // Hide the message
    strengthIndicator.style.display = "none"; // Hide the strength indicator
  });
});

// Event listener for the clear button
clearButton.addEventListener("click", () => {
  // Clear all options and the generated password
  lengthEl.value = 24; // Set the default password length (you can change this as desired)
  lowercaseEl.checked = true;
  uppercaseEl.checked = true;
  numbersEl.checked = true;
  symbolsEl.checked = true;
  resultEl.innerText = ""; // Clear the message
  strengthIndicator.style.display = "none"; // Hide the strength indicator
});

// Add an event listener to the document to handle click events
document.addEventListener("click", (event) => {
  // Check if the click target is outside the password generator area
  if (
    !resultEl.contains(event.target) &&
    !generateEl.contains(event.target) &&
    !(lowercaseEl.checked || uppercaseEl.checked || numbersEl.checked || symbolsEl.checked)
  ) {
    resultEl.innerText = ""; // Clear the message
    strengthIndicator.style.display = "none"; // Hide the strength indicator
  }
});

generateEl.addEventListener("click", () => {
  const length = +lengthEl.value;
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasNumber = numbersEl.checked;
  const hasSymbol = symbolsEl.checked;

  const generatedPassword = generatePassword(
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    length
  );

  if (generatedPassword === "") {
    resultEl.innerText = "Please select at least one option for the password.";
    strengthIndicator.style.display = "none"; // Hide the strength indicator
  } else {
    resultEl.innerText = generatedPassword;

    const strength = checkPasswordStrength(generatedPassword);
    const strengthText = getStrengthLevelText(strength);
    const strengthClass = getStrengthLevelClass(strength);
    strengthIndicator.textContent = `Password Strength: ${strengthText}`;
    strengthIndicator.className = `strength-indicator ${strengthClass}`;
    strengthIndicator.style.display = "block"; // Show the strength indicator
  }
});

// Generate password function
function generatePassword(lower, upper, number, symbol, length) {
  // Init password variable
  let generatedPassword = "";

  // Create an array with the selected character types
  const selectedTypes = [];
  if (lower) selectedTypes.push(getRandomLower);
  if (upper) selectedTypes.push(getRandomUpper);
  if (number) selectedTypes.push(getRandomNumber);
  if (symbol) selectedTypes.push(getRandomSymbol);

  // Make sure at least one option was selected
  if (selectedTypes.length === 0) {
    return "";
    
  }

  // Generate the password by looping through the length
  for (let i = 0; i < length; i++) {
    const randomTypeIndex = Math.floor(Math.random() * selectedTypes.length);
    const randomTypeFunc = selectedTypes[randomTypeIndex];
    generatedPassword += randomTypeFunc();
  }

  return generatedPassword;
}

function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
  const symbols = '!?@#$%^&*"`~_-+(){}[]=<>|/,.:;';
  return symbols[Math.floor(Math.random() * symbols.length)];
}

// Function to check password strength
function checkPasswordStrength(password) {
  const length = password.length;
  const characterTypes = {
    lower: /[a-z]/,
    upper: /[A-Z]/,
    number: /[0-9]/,
    symbol: /[!@#$%^&*()_+-={}\[\]|:;"<>,.?/~]/,
  };

  let strength = 0;

  // Check length and character types to calculate strength
  if (length >= 12) strength++;
  if (length >= 18) strength++;
  if (length >= 24) strength++;

  let characterTypeCount = 0;
  for (const type in characterTypes) {
    if (characterTypes[type].test(password)) {
      characterTypeCount++;
    }
  }

  if (characterTypeCount >= 2) strength++;
  if (characterTypeCount >= 3) strength++;
  if (characterTypeCount >= 4) strength++;

  // Penalize passwords with common patterns
  if (/12345|qwerty|password/i.test(password)) {
    strength = Math.max(strength - 1, 0);
  }

  return strength;
}

// Function to get strength level text
function getStrengthLevelText(strength) {
  if (strength < 2) return "Weak";
  if (strength < 4) return "Moderate";
  if (strength < 6) return "Strong";
  return "Very Strong";
}

// Function to get the strength level class
function getStrengthLevelClass(strength) {
  if (strength < 2) return "weak";
  if (strength < 4) return "moderate";
  if (strength < 6) return "strong";
  return "very-strong";
}
