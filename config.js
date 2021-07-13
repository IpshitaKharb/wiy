import * as firebase from 'firebase'
require('@firebase/firestore')

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAME9Nexyex0-FHCMVfi3JbVTv3NpgSySQ",
    authDomain: "wily-15fea.firebaseapp.com",
    databaseURL: "https://wily-15fea.firebaseio.com", 
    projectId: "wily-15fea",
    storageBucket: "wily-15fea.appspot.com",
    messagingSenderId: "806763947667",
    appId: "1:806763947667:web:2a752fe3653b81a0198f66"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();