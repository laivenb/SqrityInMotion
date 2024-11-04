import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

// Initialize Firebase (Make sure to import the necessary Firebase config here if not done elsewhere)
const database = getDatabase(); // Assuming Firebase has already been initialized in another file

// Function to fetch user data by username
export const fetchUserData = async (username) => {
    const dbRef = ref(database, 'users/'); // Reference to the 'users' node
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            let userData = null;
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.username === username) {
                    userData = user; // Store the user data if found
                }
            });
            return userData;
        } else {
            console.error("No user data available");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        return null;
    }
};

// Function to check user role based on username
export const checkUserRole = async (username) => {
    const userData = await fetchUserData(username);
    if (userData) {
        return userData.role; // Return the user role if user data is found
    } else {
        console.error("User not found");
        return null; // Return null if user not found
    }
};
