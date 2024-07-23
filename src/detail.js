const getmMovieDetails = async (id) => {
    try {
        const movieDocRef = doc(db, "movies", id);
        const movieDoc = await getDoc(movieDocRef);

        if(movieDoc.exists()){
            const movie = movieDoc.data();
            displayMovieDetails(moive);
        } else {
            document.getElementById('movie-container').innerHTML = `<p>영화 정보를 찾을 수 없습니다.</p>`;
        }
    } catch (error) {
        console.error('영화 정보를 가져오는 중 오류 발생:', error);
        document.getElementById('movie-container').innerHTML = `<p>영화 정보를 가져오는 중 오류가 발생했습니다.</p>`;
    }
}

const displayMovieDetails = (moive) => {
    const movieDetailElement  = document.getElementById('movie-container');
    movieDetailElement.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h1>${movie.title}</h1>
        <p>${movie.overview}</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const movieId = localStorage.getItem('selectedMovieId');
})