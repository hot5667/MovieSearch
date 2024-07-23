import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBO3lWt_7hGIHZ9XOBxvig_B5He7uMPzvk",
    authDomain: "moviesearch-84a30.firebaseapp.com",
    projectId: "moviesearch-84a30",
    storageBucket: "moviesearch-84a30.appspot.com",
    messagingSenderId: "418577105323",
    appId: "1:418577105323:web:7cf31a9c378b5a5c3352ee",
    measurementId: "G-GNKHK48Q16"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getMovieDetails = async (id) => {
    try {
        const movieDocRef = doc(db, "movies", id);
        const movieDoc = await getDoc(movieDocRef);

        if (movieDoc.exists()) {
            const movie = movieDoc.data();
            displayMovieDetails(movie);
        } else {
            document.getElementById('movie-container').innerHTML = '<p>영화 정보를 찾을 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('영화 정보를 가져오는 중 오류 발생:', error);
        document.getElementById('movie-container').innerHTML = '<p>영화 정보를 가져오는 중 오류가 발생했습니다.</p>';
    }
}

const displayMovieDetails = (movie) => {
    const movieDetailElement = document.getElementById('movie-container');
    movieDetailElement.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h1>${movie.title}</h1>
        <p>${movie.overview}</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const movieId = localStorage.getItem('selectedMovieId');

    if (movieId) {
        getMovieDetails(movieId);
        localStorage.removeItem('selectedMovieId');  // 사용 후 ID 제거
    } else {
        document.getElementById('movie-container').innerHTML = '<p>영화 ID가 없습니다.</p>';
    }
});
