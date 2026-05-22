# Simple Event Gift Planner Mobile Application

## Project Description
The **Simple Event Gift Planner** is a mobile app designed to help users organize and track gift ideas for various occasions like birthdays and holidays. It serves as a digital notebook where users can record who a gift is for, what the idea is, and when the event takes place. 
To ensure that data is never lost and remains accessible even if the user switches devices, the app uses Firebase for secure user accounts and cloud storage.

## Detailed System Flow

### Step 1: Start & Authentication
* **Open App:** The user starts the application on their phone.
* **Log In / Sign Up:** To access their private list, the user logs in with their email and password. New users can create an account.
* **Verification:** Firebase Authentication checks the account. Once verified, the user is directed to their personal dashboard.

### Step 2: View Gift List (Read)
* The app retrieves the saved data from the Firebase Database.
* **Display:** The main screen shows all saved entries (Person’s Name, Gift Idea, and Event Date).
* *Note: If there are no entries yet, the screen will show a message like “No list yet.”*

### Step 3: Add Gift Plan (Create)
* The user taps the **“Add”** button.
* A form appears where the user enters:
    * Name of the person
    * Gift idea
    * Event date
* User taps **Save**. The data is stored in Firebase and instantly appears in the list.

### Step 4: Edit Gift Plan (Update)
* The user selects an existing entry they want to change.
* The app displays the saved details in an editable form.
* The user updates the information and taps **Update**. The changes are synced to the cloud database.

### Step 5: Delete Gift Plan (Delete)
* The user taps the **Delete** button on an entry.
* Once confirmed, the entry is permanently removed from the database.

### Step 6: Data Persistence & Closing
* **Repeat Process:** The user can continue managing their plans anytime.
* **Close App:** When the app is closed, all data remains stored in the **Firebase**.
* **Result:** All information will be available and up-to-date the next time the user logs in.

## Tech Stack

- React Native + Expo
- Firebase Authentication
- Firebase Firestore
- React Navigation
- Expo Vector Icons (Ionicons)
- react-native-community/datetimepicker

## App Features

- Smart notifications for upcoming events within 7 days
- Mark gifts as "Given" once delivered
- Time-based greeting on dashboard
- Custom alert modals
- Date picker (no manual typing)

## How to Run

1. Clone the repository
2. Run `npm install`
3. Add your Firebase config in `app/firebase/config.js`
4. Run `npx expo start`
5. Scan QR code with Expo Go app
