const AniKey = "1655a0bd29b81ef90c6464559ef670c3";
const Token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjU1YTBiZDI5YjgxZWY5MGM2NDY0NTU5ZWY2NzBjMyIsIm5iZiI6MTcyMTY2NDgyMy42NTg5MTcsInN1YiI6IjY2OWU4NDQxMmJiNDcyOWEzNWQxNzUyNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwsIxUsO19XWLUXui0JSBIQFVEiUFP4clxeq1uSeLZw";

const genreMap = {
    "Action": 28,
    "Reasoning": 9648,
    "Drama": 18,
    "Fantasy": 14,
    "Animated-Movie": 16
};

const fetchMovies = async () => {
    try {
        const genreElement = document.getElementById('Genre');
        const queryElement = document.getElementById('searchInput');

        if (!genreElement || !queryElement) {
            console.error('장르 또는 검색 입력 요소를 찾을 수 없습니다.');
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

        console.log('영화 데이터를 가져오는 URL:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + Token
            }
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 정상적이지 않습니다: ' + response.statusText);
        }

        const data = await response.json();
        console.log('가져온 데이터:', data);

        if (data && data.results) {
            displayMovies(data.results);
        } else {
            displayMovies([]);
        }
    } catch (error) {
        console.error('영화 데이터를 가져오는 중 오류 발생:', error);
    }
}

const fetchDefaultMovies = async () => {
    try {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${AniKey}&language=ko-KR&page=1`;

        console.log('기본 영화를 가져오는 URL:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + Token
            }
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 정상적이지 않습니다: ' + response.statusText);
        }

        const data = await response.json();
        console.log('기본 영화 데이터:', data);

        if (data && data.results) {
            displayMovies(data.results.slice(0, 20));
        } else {
            displayMovies([]);
        }
    } catch (error) {
        console.error('기본 영화를 가져오는 중 오류 발생:', error);
    }
}

const displayMovies = (movies) => {
    try {
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
            movieElement.addEventListener('click', () => {
                alert(`영화 ID: ${movie.id}`);
            });
            movieContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error('영화 데이터를 표시하는 중 오류 발생:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchDefaultMovies);
document.getElementById('checkBtn').addEventListener('click', function(event) {
    event.preventDefault();
    fetchMovies();
});