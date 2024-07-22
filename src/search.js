const AniKey = "1655a0bd29b81ef90c6464559ef670c3";
const Token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjU1YTBiZDI5YjgxZWY5MGM2NDY0NTU5ZWY2NzBjMyIsIm5iZiI6MTcyMTY2NDgyMy42NTg5MTcsInN1YiI6IjY2OWU4NDQxMmJiNDcyOWEzNWQxNzUyNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwsIxUsO19XWLUXui0JSBIQFVEiUFP4clxeq1uSeLZw";

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
})

let fetchMovies = () => {
    const genre = document.getElementById('Genre').value;
    const query = document.getElementById('searchInput').value;

    let url = `https://api.themoviedb.org/3/search/movie?api_key=${AniKey}&query=${query}&language=ko-KR&page=1`;

    if(genre !== "Def") 
    {
        url += `&with_genres=${genre}`;
    }

    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + Token
        }
    })

    .then(response => response.json())
    .then(data => {
        displayMovies(data.results);
    })
    .catch(error => console.error('error', error));
}

let displayMovies = (movies) => {
    const movieContainer = document.getElementById('movie-container');
    movieContainer.innerHTML = '';
    if(movies.length === 0)
    {
        movieContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
        return;
    }
}