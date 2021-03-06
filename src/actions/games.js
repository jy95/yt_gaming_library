import gamesData from "../data/games.json";

export const FETCHING_REQUESTED = "GAMES_REQUESTED";
export const FETCHING_OK = "GAMES_FETCHING_OK";
export const FETCHING_FAILED = "GAMES_FETCHING_FAILED";
export const SORTING_GAMES = "SORTING_GAMES";
export const SORTING_ORDER_CHANGED = "SORTING_ORDER_CHANGED";
export const FILTERING_BY_GENRE = "FILTERING_BY_GENRE";
export const FILTERING_BY_TITLE = "FILTERING_BY_TITLE";
export const FILTERING_BY_PLATFORM = "FILTERING_BY_PLATFORM";

// Inspired by https://stackoverflow.com/a/60068169/6149867
function makeMultiCriteriaSort(criteria) {
    return (a, b) => {
        for(let i = 0; i < criteria.length; i++) {
            const comparatorResult = criteria[i](a, b);
            if (comparatorResult !== 0) {
                return comparatorResult;
            }
        }
        return 0;
    }
}

// Swap element position in array with its sibling (left or right)
// Exception cases are handled in change_sorting_order
function swapSiblingElements(arr, elementIndex , direction) {
    // elements to swap
    const firstElement = (direction === "up") ? arr[elementIndex]: arr[elementIndex + 1];
    const secondElement = (direction === "up") ? arr[elementIndex - 1] : arr[elementIndex];
    // indexes for slice call
    const firstSliceIndex = (direction === "up") ? elementIndex - 1 : elementIndex;
    const secondSliceIndex = elementIndex + ( (direction === "up") ? 1 : 2);
    // return new array
    return [ 
        ...arr.slice(0, firstSliceIndex), 
        firstElement, 
        secondElement, 
        ...arr.slice(secondSliceIndex) 
    ];
 }
// Regex for duration
const DURATION_REGEX = /(\d+):(\d+):(\d+)/; 

// param à la place du () du genre ({title, password})
export const get_games = () => {
    return (dispatch, getState) => {
        const {
            games: {
                games: previousFetchedGames
            }
        } = getState();

        if (previousFetchedGames.length === 0) {
            dispatch(fetchingStarted());

            // current date as integer (quicker comparaison)
            const currentDate = new Date();
            const integerDate = [
                currentDate.getFullYear() * 10000,
                (currentDate.getMonth() + 1) * 100,
                currentDate.getDate()
            ].reduce((acc, cur) => acc + cur, 0);

            // Build the object for component
            let games = gamesData
                .games
                // hide not yet public games on channel
                .filter(game => !game.hasOwnProperty("availableAt") || game.availableAt <= integerDate)
                .map(game => {
                    const parts = game.releaseDate.split("/");
                    const id = game.playlistId ?? game.videoId;
                    const base_url = (
                        (game.playlistId) 
                            ? "https://www.youtube.com/playlist?list=" 
                            :  "https://www.youtube.com/watch?v="
                    ) + id ;
                    const url_type = (game.playlistId) ? "PLAYLIST" : "VIDEO";
                    return Object.assign({}, game, {
                        "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                        "releaseDate": new Date(+parts[2], parts[1] -1, +parts[0]),
                        "url": base_url,
                        "url_type": url_type,
                        "durationAsInt": parseInt((game.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3"))
                    });
                });

            dispatch(fetchingFinished(games));
        }

    };
};

// Given field is the one that changed
export const sort_games = (field) => {
    return (dispatch, getState) => {
        const { 
            games : {
                sorters: previousState 
            }
        } = getState();
        
        let newStates = previousState.state;

        // Invert previous state value for this field
        const oldValue = newStates[field];
        const newValue = (oldValue === "ASC") ? "DESC" : "ASC";
        newStates = {
            ...previousState.state,
            [field]: newValue
        }

        // Decide the sort algorithm now
        // Changed field should be the first criteria, other should be unchanged (following my simple order, from now)
        const sortFunction = makeMultiCriteriaSort(
            previousState
                .keys
                .map(criteria => {
                    const sortFcts = previousState.functions[criteria];
                    const state = newStates[criteria];
                    return sortFcts[state];
                })
        );

        // Update state
        dispatch(sortingGames(newStates, sortFunction));
        
    };
};

export const change_sorting_order = (field, direction) => {
    return (dispatch, getState) => {
        const { 
            games : {
                sorters: previousState 
            }
        } = getState();

        // Get current position
        const currentIndex = previousState.keys.indexOf(field);

        // Some case shoud not possible
        const wrongCase = 
            currentIndex === -1 ||
            (currentIndex === 0 && direction === "up") ||
            (currentIndex === previousState.keys.length -1 && direction === "down")
        ;
        // if nothing wrong, apply change
        if (!wrongCase){
            const newSortOrder = swapSiblingElements(previousState.keys, currentIndex, direction);
            const sortFunction = makeMultiCriteriaSort(
                newSortOrder
                    .map(criteria => {
                        const sortFcts = previousState.functions[criteria];
                        const state = previousState.state[criteria];
                        return sortFcts[state];
                    })
            );

            dispatch(sortCriteriaOrderChanger(sortFunction, newSortOrder))
        }
    };
};

export const filter_games_by_genre = (genres) => {
    return (dispatch, getState) => {
        dispatch(filterGamesByGenres(genres));
    }
}

export const filter_games_by_title = (title) => {
    return (dispatch, getState) => {
        dispatch(filterGamesByTitle(title));
    }
}

export const filter_games_by_platform = (platform) => {
    return (dispatch, getState) => {
        dispatch(filterGamesByPlatform(platform));
    }
}

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (games) => ({
    type: FETCHING_OK,
    games
});

// eslint-disable-next-line
const fetchingFailed = (error) => ({
    type: FETCHING_FAILED,
    error
});

const sortingGames = (newSortersState, sortFunction) => ({
    type: SORTING_GAMES,
    newSortersState,
    sortFunction
});

const sortCriteriaOrderChanger = (sortFunction, keys) => ({
    type: SORTING_ORDER_CHANGED,
    sortFunction,
    keys
});

const filterGamesByGenres = (genres) => ({
    type: FILTERING_BY_GENRE,
    genres
});

const filterGamesByTitle = (title) => ({
    type: FILTERING_BY_TITLE,
    title
});

const filterGamesByPlatform = (platform) => ({
    type: FILTERING_BY_PLATFORM,
    platform
});