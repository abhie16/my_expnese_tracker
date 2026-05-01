# Expense Tracker PWA

A beautiful, local-first Progressive Web Application for tracking expenses, tagging recipients, and monitoring budgets with visual graphs.

## Features
- **Daily & Monthly Spending:** See your totals at a glance.
- **Budgeting:** Set limits for different categories (e.g., Food, Entertainment).
- **Dynamic Budget Bar:** Watch your budget update in real-time as you add an expense.
- **Progressive Web App (PWA):** Installable on mobile devices, works entirely offline!
- **Data Privacy:** 100% local, no external databases.

---

## 💾 Data Persistence (How your data is saved)

This application uses your browser's **Local Storage** to save all data. 
- **What this means:** When you add an expense or a category, it is saved directly on your current device (phone or computer) inside the web browser. 
- **Privacy:** Your financial data is completely private. It is never sent to any server or cloud database.
- **Limitation:** Because the data lives in the browser, if you clear your browser's "Site Data" or "Cookies & Cache," your expenses will be deleted. Furthermore, the data does not automatically sync across different devices (e.g., your phone and your laptop will have separate expense lists).

If you want to clear your data manually, you can open your browser's Developer Tools -> Application -> Local Storage, and clear the `expenses` and `categories` keys.

---

## 🚀 How to Deploy

Because this is a static frontend application (HTML, CSS, JS), it is incredibly easy to deploy. You can host it for free on almost any static hosting provider so that you and others can use it.

### Option 1: GitHub Pages (Recommended & Free)
1. Push this folder to a new repository on GitHub.
2. Go to the repository **Settings** -> **Pages**.
3. Under "Build and deployment", set the Source to **Deploy from a branch**.
4. Select your `main` or `master` branch and click **Save**.
5. Within a few minutes, your app will be live at `https://yourusername.github.io/your-repo-name/`.

### Option 2: Vercel or Netlify (Free)
1. Create a free account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Drag and drop this entire `expense_tracker` folder into their web interface.
3. It will instantly deploy and give you a live URL.

### Option 3: Local Network (For testing)
If you want to use it on your phone while on the same WiFi network:
1. Open a terminal in this folder.
2. Run a simple local server. For example, using Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Find your computer's local IP address (e.g., `192.168.1.100`) and open `http://192.168.1.100:8000` on your phone's browser.

---

## 📱 How to Install on Mobile

Once you deploy the application using the steps above:
1. Open the live URL in your mobile browser (Safari on iOS, Chrome on Android).
2. **On iOS:** Tap the Share button at the bottom and select **"Add to Home Screen"**.
3. **On Android:** Tap the three dots menu in the top right and select **"Install App"** or **"Add to Home Screen"**.
4. The app will now appear on your home screen with its icon and will open in full-screen mode like a native app. It will even work when you have no internet connection!
