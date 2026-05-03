
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyC2Tb8VRh9BsutJUg_j3MBBRbqLLmkGKl0",
    authDomain: "tontine-connect-24269.firebaseapp.com",
    projectId: "tontine-connect-24269",
    storageBucket: "tontine-connect-24269.firebasestorage.app",
    messagingSenderId: "928737930766",
    appId: "1:928737930766:web:b24b5d064788dda443565f",
    measurementId: "G-YQDPH994YD",
    databaseURL: "https://tontine-connect-24269-default-rtdb.europe-west1.firebasedatabase.app"
}

const app = initializeApp(firebaseConfig)

export const database = getDatabase(app)
export const auth = getAuth(app)
export { ref, set, get, onValue, push, remove, update }