const firebaseConfig = {
    apiKey: "AIzaSyBO3lWt_7hGIHZ9XOBxvig_B5He7uMPzvk",
    authDomain: "moviesearch-84a30.firebaseapp.com",
    projectId: "moviesearch-84a30",
    storageBucket: "moviesearch-84a30.appspot.com",
    messagingSenderId: "418577105323",
    appId: "1:418577105323:web:7cf31a9c378b5a5c3352ee",
    measurementId: "G-GNKHK48Q16"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const Anykey = "1655a0bd29b81ef90c6464559ef670c3";
const Token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNjU1YTBiZDI5YjgxZWY5MGM2NDY0NTU5ZWY2NzBjMyIsIm5iZiI6MTcyMTY2NDgyMy42NTg5MTcsInN1YiI6IjY2OWU4NDQxMmJiNDcyOWEzNWQxNzUyNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwsIxUsO19XWLUXui0JSBIQFVEiUFP4clxeq1uSeLZw";

const genreMap = {
    "Action": 28,
    "Reasoning": 9648,
    "Drama": 18,
    "Fantasy": 14,
    "Animated-Movie": 16
};

const displayComments = (movieId, comments = []) => {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = ''; 

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add("comment-subcontainer");
        commentElement.textContent = comment;
        commentsList.appendChild(commentElement);

        const editButton = document.createElement('button');
        editButton.classList.add("edit_btn");
        editButton.textContent = '수정';
        editButton.addEventListener('click', () => {
            const newCommentText = prompt('새 댓글을 입력하세요:', comment);
            if (newCommentText) {
                editCommentByText(movieId, comment, newCommentText);
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add("del_btn");
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', () => {
            if (confirm('정말 삭제하시겠습니까?')) {
                deleteCommentByText(movieId, comment);
            }
        });

        commentElement.appendChild(editButton);
        commentElement.appendChild(deleteButton);
    });
};

const fetchMovies = async () => {
    try {
        const genreElement = document.getElementById('Genre');
        const queryElement = document.getElementById('searchInput');

        if (!genreElement || !queryElement) {
            console.error('장르 또는 검색 입력 요소를 찾을 수 없습니다.');
            return;
        }

        let $name = "dohyun"; //문자열, 소수, 실수, 정수 일때만 $변수
        const MAX_SIZE = 10; //상수 일때만 변수명 대문자로

        const genre = genreElement.value;
        const query = queryElement.value.trim();

        if (query === '') {
            alert('검색어를 입력해주세요.');
            return;
        }

        const cacheKey = `${query}-${genre}`;
        const cacheDocRef = db.collection('cache').doc(cacheKey);
        const cacheDoc = await cacheDocRef.get();

        if (cacheDoc.exists) {
            console.log('캐시에서 데이터 가져오기:', cacheKey);
            displayMovies(cacheDoc.data().movies);
            return;
        }

        let url = `https://api.themoviedb.org/3/search/movie?api_key=${Anykey}&language=ko-KR&page=1`;

        if (genre !== "Def") {
            url += `&with_genres=${genreMap[genre]}`;
        }

        console.log('영화 데이터를 가져오는 URL:', url);

        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + Token }
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 정상적이지 않습니다: ' + response.statusText);
        }

        const data = await response.json();
        console.log('가져온 데이터:', data);

        if (data && data.results) {
            await cacheDocRef.set({ movies: data.results });
            displayMovies(data.results);
        } else {
            displayMovies([]);
        }
    } catch (error) {
        console.error('영화 데이터를 가져오는 중 오류 발생:', error);
        alert('영화 데이터를 가져오는 중 오류가 발생했습니다.');
    }
};

const fetchDefaultMovies = async () => {
    const cacheKey = 'defaultMovies';
    const cacheDocRef = db.collection('cache').doc(cacheKey);

    try {
        const cacheDoc = await cacheDocRef.get();
        if (cacheDoc.exists) {
            console.log('캐시에서 기본 영화 데이터 가져오기:', cacheKey);
            const movies = cacheDoc.data().movies;
            console.log('캐시에서 가져온 영화 데이터:', movies);
            displayMovies(movies);

            await Promise.all(movies.map(movie => updateMovieRating(movie)));
            return;
        }

        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${Anykey}&language=ko-KR&page=1`;
        console.log('기본 영화를 가져오는 URL:', url);

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${Token}` }
        });

        if (!response.ok) {
            throw new Error('네트워크 응답이 정상적이지 않습니다: ' + response.statusText);
        }

        const data = await response.json();
        console.log('API 응답 데이터:', data);

        if (data?.results) {
            const moviesToCache = data.results.slice(0, 20);
            console.log('캐시에 저장할 영화 데이터:', moviesToCache);
            await cacheDocRef.set({ movies: moviesToCache });
            displayMovies(moviesToCache);

            // 각 영화의 평균 별점 업데이트
            await Promise.all(moviesToCache.map(movie => updateMovieRating(movie)));
        } else {
            console.log('영화 데이터가 없습니다.');
            displayMovies([]);
        }
    } catch (error) {
        console.error('기본 영화를 가져오는 중 오류 발생:', error);
        alert('기본 영화를 가져오는 중 오류가 발생했습니다.');
    }
};

const displayMovies = (movies) => {
    try {
        const movieContainer = document.getElementById('movie-container');
        movieContainer.innerHTML = '';

        if (movies.length === 0) {
            movieContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
            return;
        }
        
        const genreElement = document.getElementById('Genre');
        const selectedGenre = genreElement.value;

        movies.forEach(movie => {
            if (selectedGenre === 'Def' || (movie.genre_ids && movie.genre_ids.includes(genreMap[selectedGenre]))) {
                const movieElement = document.createElement('div');
                movieElement.classList.add('movie');

                const ratingBadge = document.createElement('div');
                ratingBadge.classList.add('ratingBadge');
                ratingBadge.id = `ratingBadge-${movie.id}`;
                ratingBadge.appendChild(document.createTextNode('별점: 0.0'));
                movieElement.appendChild(ratingBadge);

                const moviePoster = document.createElement('img');
                moviePoster.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
                moviePoster.alt = movie.title;
                movieElement.appendChild(moviePoster);

                const movieTitle = document.createElement('h4');
                movieTitle.textContent = movie.title;
                movieElement.appendChild(movieTitle);

                movieElement.addEventListener('click', () => displayMovieDetails(movie));
                movieContainer.appendChild(movieElement);

                updateMovieRating(movie.id);
            }
        });
    } catch (error) {
        console.error('영화를 표시하는 중 오류 발생:', error);
    }
};

const displayMovieDetails = (movie) => {
    try {
        const movieContainer = document.getElementById('movie-container');
        const movieDetailsContainer = document.getElementById('movie-details-container');

        movieContainer.style.display = 'none';

        movieDetailsContainer.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <p>${movie.overview}</p>
            <div class="average-rating" id="average-rating">평균 별점: 로딩 중...</div>
            <fieldset class="rateing">
                <input type="radio" id="rating10" name="rate" value="10"><label for="rating10" title="5점"></label>
                <input type="radio" id="rating9" name="rate" value="9"><label class="half" for="rating9" title="4.5점"></label>
                <input type="radio" id="rating8" name="rate" value="8"><label for="rating8" title="4점"></label>
                <input type="radio" id="rating7" name="rate" value="7"><label class="half" for="rating7" title="3.5점"></label>
                <input type="radio" id="rating6" name="rate" value="6"><label for="rating6" title="3점"></label>
                <input type="radio" id="rating5" name="rate" value="5"><label class="half" for="rating5" title="2.5점"></label>
                <input type="radio" id="rating4" name="rate" value="4"><label for="rating4" title="2점"></label>
                <input type="radio" id="rating3" name="rate" value="3"><label class="half" for="rating3" title="1.5점"></label>
                <input type="radio" id="rating2" name="rate" value="2"><label for="rating2" title="1점"></label>
                <input type="radio" id="rating1" name="rate" value="1"><label class="half" for="rating1" title="0.5점"></label>
             </fieldset>
            <button class="like-button" id="like-button" data-movie-id="${movie.id}"><i class="fas fa-heart" style="color: red";></i> 좋아요 <span id="like-count">0</span></button>
            <div class="comment-container">
                <input type="text" id="comment-input" placeholder="댓글을 입력하세요">
                <button id="submit-comment">댓글 작성</button>
            </div>
            <div class="comments-list" id="comments-list"></div>
        `;
        movieDetailsContainer.style.display = 'block';

        setupMovieDetailsListeners(movie);
    } catch (error) {
        console.error('영화 세부 정보를 표시하는 중 오류 발생:', error);
    }
};

const updateMovieRating = async (movieId) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();

        if (movieDoc.exists) {
            const data = movieDoc.data();
            const totalRating = data.totalRating || 0;
            const ratingCount = data.ratingCount || 0;
            const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

            const ratingBadge = document.getElementById(`ratingBadge-${movieId}`);
            if (ratingBadge) {
                ratingBadge.textContent = `별점: ${averageRating}`;
            }
        } else {
            console.log('영화 문서가 존재하지 않습니다.');
        }
    } catch (error) {
        console.error('영화 평균 별점 업데이트 중 오류 발생:', error);
    }
};

const setupMovieDetailsListeners = (movie) => {
    try {
        const likeButton = document.getElementById('like-button');
        const commentInput = document.getElementById('comment-input');
        const submitCommentButton = document.getElementById('submit-comment');

        fetchMovieLikes(movie.id, document.getElementById('like-count'));
        fetchMovieComments(movie.id, document.getElementById('comments-list'));

        likeButton.addEventListener('click', () => saveLike(movie.id));
        submitCommentButton.addEventListener('click', () => {
            const commentText = commentInput.value;
            if (commentText) {
                saveComment(movie.id, commentText);
                commentInput.value = '';
            }
        });

        document.querySelectorAll('input[name="rate"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const rating = parseInt(radio.value, 10);
                saveRating(movie.id, rating);
            });
        });

        db.collection('movies').doc(movie.id.toString()).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                const totalRating = data.totalRating || 0;
                const ratingCount = data.ratingCount || 0;
                const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
                document.getElementById('average-rating').textContent = `평균 별점: ${averageRating}`;
                displayComments(movie.id, data.comments || []);
            }
        });
    } catch (error) {
        console.error('영화 세부 정보 이벤트 리스너 설정 중 오류 발생:', error);
    }
};

// 댓글 삭제
const deleteCommentByText = async (movieId, commentText) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();

        if (!movieDoc.exists) {
            console.warn('영화 문서가 존재하지 않습니다:', movieId);
            return;
        }

        const comments = movieDoc.data().comments || [];
        const updatedComments = comments.filter(comment => comment !== commentText);

        // Firestore에서 댓글 목록 업데이트
        await movieDocRef.update({ comments: updatedComments });
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
    }
};

const editCommentByText = async (movieId, oldCommentText, newCommentText) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();

        if (!movieDoc.exists) {
            console.warn('영화 문서가 존재하지 않습니다:', movieId);
            return;
        }

        const comments = movieDoc.data().comments || [];
        const updatedComments = comments.map(comment =>
            comment === oldCommentText ? newCommentText : comment
        );

        await movieDocRef.update({ comments: updatedComments });
    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
    }
};

const saveComment = async (movieId, commentText) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();

        if (!movieDoc.exists) {
            await movieDocRef.set({
                likes: 0,
                comments: [commentText],
                totalRating: 0,
                ratingCount: 0
            });
        } else {
            await movieDocRef.update({
                comments: firebase.firestore.FieldValue.arrayUnion(commentText)
            });
        }

        fetchMovieComments(movieId, document.getElementById('comments-list'));
    } catch (error) {
        console.error('댓글 저장 중 오류 발생:', error);
    }
};

const saveLike = async (movieId) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();
        if (!movieDoc.exists) {
            await movieDocRef.set({
                likes: 0,
                comments: [],
                rating: 0,
                ratingCount: 0
            });
        }
        await movieDocRef.update({
            likes: firebase.firestore.FieldValue.increment(1)      
        });
        fetchMovieLikes(movieId, document.getElementById('like-count'));
    } catch (error) {
        console.error('좋아요 저장 중 오류 발생:', error);
    }
};

const saveRating = async (movieId, rating) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());

        const movieDoc = await movieDocRef.get();
        if (!movieDoc.exists) {
            await movieDocRef.set({
                likes: 0,
                comments: [],
                totalRating: 0,
                ratingCount: 0
            });
        }

        await movieDocRef.update({
            totalRating: firebase.firestore.FieldValue.increment(rating),
            ratingCount: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('별점 저장 중 오류 발생:', error);
    }
};

const fetchMovieLikes = async (movieId, likeCountElement) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();
        const likes = movieDoc.exists ? movieDoc.data().likes || 0 : 0;
        likeCountElement.textContent = likes;
    } catch (error) {
        console.error('영화 좋아요 수를 가져오는 중 오류 발생:', error);
    }
};

const fetchMovieComments = async (movieId, commentsList) => {
    try {
        const movieDocRef = db.collection('movies').doc(movieId.toString());
        const movieDoc = await movieDocRef.get();

        if (!movieDoc.exists) {
            console.warn('영화 문서가 존재하지 않습니다:', movieId);
            displayComments(movieId, []); 
            return;
        }

        const comments = movieDoc.data().comments || [];
        console.log('댓글 데이터:', comments);

        displayComments(movieId, comments);
    } catch (error) {
        console.error('영화 댓글을 가져오는 중 오류 발생:', error);
    }
};

document.addEventListener('DOMContentLoaded', fetchDefaultMovies); //F5

document.getElementById('searchButton').addEventListener('click', fetchMovies); //Click