const AniKey = "1655a0bd29b81ef90c6464559ef670c3";
const Token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjU1YTBiZDI5YjgxZWY5MGM2NDY0NTU5ZWY2NzBjMyIsIm5iZiI6MTcyMTY2NDgyMy42NTg5MTcsInN1YiI6IjY2OWU4NDQxMmJiNDcyOWEzNWQxNzUyNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwsIxUsO19XWLUXui0JSBIQFVEiUFP4clxeq1uSeLZw";

document.addEventListener('DOMContentLoaded', fetchDefaultMovies);
document.getElementById('checkBtn').addEventListener('click', function(event) {
    event.preventDefault(); 
    fetchMovies();
});

const genreMap = {
    "Action": 28,
    "Reasoning": 9648,
    "Drama": 18,
    "Fantasy": 14,
    "Animated-Movie": 16
};

let fetchMovies = () => {
    const genreElement = document.getElementById('Genre');
    const queryElement = document.getElementById('searchInput');

    if (!genreElement || !queryElement) {
        console.error('Genre or search input element not found.');
        return;
    }

    const genre = genreElement.value;
    const query = queryElement.value;

    if (query === '') {
        alert('검색어를 입력해주세요.');
        return;
    }

    let url = `https://api.themoviedb.org/3/search/movie?api_key=${AniKey}&query=${encodeURIComponent(query)}&language=ko-KR&page=1`;

    if (genre !== "Def") {
        url += `&with_genres=${genreMap[genre]}`;
    }

    console.log('Fetching movies with URL:', url);

    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + Token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched data:', data);
        if (data && data.results) {
            displayMovies(data.results);
        } else {
            displayMovies([]);
        }
    })
    .catch(error => console.error('Error:', error));
}

function fetchDefaultMovies() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${AniKey}&language=ko-KR&page=1`;

    console.log('Fetching default movies with URL:', url);

    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + Token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched default movies data:', data);
        if (data && data.results) {
            displayMovies(data.results.slice(0, 20));
        } else {
            displayMovies([]);
        }
    })
    .catch(error => console.error('Error:', error));
}

let displayMovies = (movies) => {
    const movieContainer = document.getElementById('movie-container');
    movieContainer.innerHTML = '';
    if (movies.length === 0) {
        movieContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
        return;
    }
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h5>${movie.title}</h5>
        `;
        movieContainer.appendChild(movieElement);
    });
}