import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED,
    SORTING_GAMES,
    SORTING_ORDER_CHANGED
} from "../actions/games"

// search criterias
const sortByNameASC = (a, b) => (a.title < b.title) ? -1 : (a.title > b.title ? 1 : 0);
const sortByReleaseDateASC = (a, b) => {
    let aa = a["releaseDate"];
    let bb = b["releaseDate"];
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
};
const sortByDurationASC = (a, b) => (a.durationAsInt < b.durationAsInt) ? -1 : (a.durationAsInt > b.durationAsInt ? 1 : 0);

const initialState = {
    games: [],
    error: null,
    loading: false,
    sorters: {
        currentSortFunction: sortByNameASC,
        state: {
            "name": "ASC",
            "releaseDate": "ASC",
            "duration": "ASC"
        },
        keys: ["name", "releaseDate", "duration"],
        functions: {
            "name": {
                "ASC": sortByNameASC,
                "DESC": (a, b) => -sortByNameASC(a, b)
            },
            "releaseDate": {
                "ASC": sortByReleaseDateASC,
                "DESC": (a, b) => -sortByReleaseDateASC(a, b)
            },
            "duration": {
                "ASC": sortByDurationASC,
                "DESC": (a, b) => -sortByDurationASC(a, b)
            }
        }
    }
};

export default function games(state = initialState, action) {

    switch (action.type) {
        case FETCHING_REQUESTED:
            return {
              ...state,
              loading: true
            };
        case FETCHING_OK:
            return {
                ...state,
                loading: false,
                games: action.games,
                error: null
            };
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                games: [],
                error: action.error
            };
        case SORTING_GAMES:
            return {
                ...state,
                sorters: {
                    ...state.sorters,
                    currentSortFunction: action.sortFunction,
                    state: {
                        ...action.newSortersState
                    }
                }
            };
        case SORTING_ORDER_CHANGED:
            return {
                ...state,
                sorters: {
                    ...state.sorters,
                    currentSortFunction: action.sortFunction,
                    keys: action.keys
                }
            }
        default:
            return state
    }

}