import {
    SET_DRAWER_OPEN
} from "../actions/miscellaneous"

// for stuff I had to share between 2 or more components
const initialState = {
    drawerOpen: false
};

export default function miscellaneous(state = initialState, action) {

    switch (action.type) {
        case SET_DRAWER_OPEN:
            return {
                ...state,
                drawerOpen: action.drawerOpen
            };
        default:
            return state
    }

}