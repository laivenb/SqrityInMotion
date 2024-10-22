// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getDatabase, ref, set} from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUJi49LkR9xxLSX5afKZLjZFwlPMmfzg0",
    authDomain: "capstone-ed286.firebaseapp.com",
    databaseURL: "https://capstone-ed286-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "capstone-ed286",
    storageBucket: "capstone-ed286.appspot.com",
    messagingSenderId: "561686103760",
    appId: "1:561686103760:web:da6460fcf592c8a7cd00d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();
const auth = getAuth();

// Function to handle login
