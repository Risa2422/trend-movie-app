const genreList = document.querySelector("genre");
const form = document.querySelector("form");
const showType = document.querySelector(".showType");
const genre = document.querySelector(".genre");
const language = document.querySelector(".language");
const search = document.querySelector(".search");
const showsList = document.querySelector(".shows-list");
let inputSearch;
let selectedGenre;
let selectedLanguage;
let displayData;
let selectedGenreId;
let isGenreSelected;
let isShowTypeSelected;
let genreName;
let selectedShowType;

const AllGenreDatas = [];
const showArr = [];
const commonOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDhhMDdiNzMxNjI0NmQxMmYyNDUwZmU1NjU1OWEyNSIsIm5iZiI6MTcyMzEzNTg0NC4wOTYwMjYsInN1YiI6IjY2YjNiNzQyMDFlZjcyMTgzMjg4NmM0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wc-OqAOtpMotV1UABiNEA2U77iZ3oIIlfykK0ReJJWQ",
  },
};

genre.addEventListener("click", () => {
  getGenreList();
});

showType.addEventListener("change", (e) => {
  if (e.target.value === "all") {
    // memo: Since there is no API available to retrieve genres for movies and TV shows, show type(all) will be disabled.
    genre.style.backgroundColor = "#D1D1D1";
    genre.disabled = true;
  } else {
    genre.style.backgroundColor = "white";
    genre.disabled = false;
  }
});

language.addEventListener("click", () => {
  getLanguageList();
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // get the selected genre name and condition
  genreName = genre.value;
  if (genreName === "---") {
    isGenreSelected = false;
  } else {
    isGenreSelected = true;
  }

  selectedShowType = showType.value;
  if (selectedShowType === "all") {
    isShowTypeSelected = false;
  } else {
    isShowTypeSelected = true;
  }

  // for searching the name of TV and movies
  if (search.value !== "") {
    let selectedLanguage = language.value.substring(0, 2).toLowerCase();

    // get data based on the search input
    const result = await getAllShowDataBySearch(search.value, selectedLanguage);
    displayData = getShowDataByCondition(result);

    displayShowlist(displayData, false, false);
  } else {
    // for getting the trends
    getTrendData();
  }
});

/* Functions *****************************************/
function init() {
  getGenreList();
  getLanguageList();
  getTrendData();

  // genre is disabled by default
  genre.style.backgroundColor = "#D1D1D1";
  genre.disabled = true;
}

function getShowDataByCondition(response) {
  if (!isShowTypeSelected) {
    return response.results;
  } else {
    return filterDisplayData(response, isShowTypeSelected, isGenreSelected);
  }
}

async function getTrendData() {
  let typeOfShow;
  let isTV = false;

  if (showType.value === "all") {
    typeOfShow = "all";
  } else if (showType.value === "movie") {
    typeOfShow = "movie";
  } else {
    typeOfShow = "tv";
    isTV = true;
  }

  const languageCode = language.value.substring(0, 2).toLowerCase();
  const trendDatas = await getTrends(typeOfShow, languageCode);
  displayData = getShowDataByCondition(trendDatas);

  displayShowlist(displayData, true, isTV);
}

// filter showing data
function filterDisplayData(response, isShowTypeSelected, isGenreSelected) {
  let filteredData = [];

  if (isShowTypeSelected) {
    filteredData = getDataByShowType(response);
    if (isGenreSelected) {
      filteredData = getDataByGenre(filteredData);
    }
  }

  return filteredData;
}

function getDataByGenre(response) {
  // get a selected genreId
  AllGenreDatas.forEach((data) => {
    if (data.name === genreName) {
      selectedGenreId = data.id;
    }
  });

  return response.filter((data) => {
    if (data.genre_ids && Array.isArray(data.genre_ids)) {
      return data.genre_ids.some((genreId) => genreId === selectedGenreId);
    } else {
      return false;
    }
  });
}

function getDataByShowType(response) {
  const newShowlist = [];

  response.results.forEach((data) => {
    if (data.media_type === selectedShowType) {
      newShowlist.push(data);
    }
  });

  return newShowlist;
}

// build HTML for setting options
function setOptions(genres, responses, name) {
  genres.innerHTML = "<option>---</option>";
  responses.forEach((data) => {
    const element = document.createElement("option");
    element.append(data[name]);
    genres.append(element);

    AllGenreDatas.push(data);
  });
}

// dis  play search result
function displayShowlist(showDatas, isSearchTrends, isTV) {
  const showArr = [];
  let fetchTitle;
  let showId = 1;

  showsList.innerHTML = "";

  // no data found
  if (showDatas.length === 0) {
    showsList.classList.add("no-data-wrapper");
    const showData = document.createElement("div");
    showData.classList.add("no-data");
    showData.innerHTML = `<h2>Oops! No results found.</h2>
    <div><img src="./image/nodata.png" alt="no data"></div>`;
    showsList.append(showData);

    return;
  }

  showDatas.forEach((data) => {
    // avoid showing data that does not have a title, image or overview
    if ((data.name || data.title) && data.poster_path && data.overview) {
      if (isSearchTrends || isTV) {
        fetchTitle = data.title;
        if (!fetchTitle) {
          fetchTitle = data.name;
        }
      } else {
        fetchTitle = data.name;
        if (!fetchTitle) {
          fetchTitle = data.title;
        }
      }

      // remove the class used for styling when no data is found
      if (showsList.classList.contains("no-data-wrapper")) {
        showsList.classList.remove("no-data-wrapper");
      }

      const showData = document.createElement("div");
      showData.classList.add("show-list");
      showData.innerHTML = `
        <div class="imgframe">
          <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${fetchTitle}">
        </div>
        <div class="card-textbox">
          <div class="card-text">
            ${fetchTitle}
          </div>
          <div class="card-overview">
            ${data.overview}
          </div>
          <button id="button-${showId}">More info</button>
        </div>`;
      showsList.append(showData);

      // store each show's data for modals
      const showObj = {
        id: showId,
        name: fetchTitle,
        overview: data.overview,
        release_date: data.release_date,
        img: `https://image.tmdb.org/t/p/w500/${data.backdrop_path}`,
      };

      showArr.push(showObj);
      showId++;
    }
  });

  // show a modal
  document.querySelectorAll(".show-list button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const buttonId = e.target.id.replace("button-", "");
      const selectedData = showArr.find(
        (data) => data.id.toString() === buttonId
      );

      if (selectedData) {
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
        <div class="modal-imgframe">
            <img src="${selectedData.img}" alt="${selectedData.name}">
        </div>
        <div class="modal-card-textbox">
            <div class="modal-card-text">
            ${selectedData.name}
            </div>
            <div class="modal-card-overview ">
            ${selectedData.overview}
            </div>
            <button class="close-modal">Close</button>
        </div>
        `;

        overlay.appendChild(modal);
        body.append(overlay);
        body.style.overflow = "hidden";

        // close a modal
        document.querySelector(".close-modal").addEventListener("click", () => {
          overlay.remove();
          body.style.overflow = "";
        });
      }
    });
  });
}

/* API *****************************************/
// get a genre list
async function getGenreList() {
  let response;
  try {
    if (showType.value === "all") {
      // just for now
      response = await getGenreData("movie");
    } else if (showType.value === "movie") {
      // get a movie list
      response = await getGenreData("movie");
    } else {
      // get a TV list
      response = await getGenreData("tv");
    }

    setOptions(genre, response.genres, "name");
  } catch (e) {
    console.log(e);
  }
}

// get a language list
async function getLanguageList() {
  let response = await getLanguageData();
  setOptions(language, response, "english_name");
}

// get a genre list
async function getGenreData(showType) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/genre/${showType}/list?language=en`,
      commonOptions
    );

    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}

// get a language list
async function getLanguageData() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/configuration/languages",
      commonOptions
    );

    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}

// get the show info
async function getAllShowDataBySearch(inputSearch, selectedLanguage) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${inputSearch}&include_adult=false&language=${selectedLanguage}&page=1`,
      commonOptions
    );

    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}

// get the trends
async function getTrends(typeOfShow, selectedLanguage) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/${typeOfShow}/day?language=${selectedLanguage}`,
      commonOptions
    );

    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}

init();
