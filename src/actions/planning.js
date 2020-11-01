import gamesData from "../data/scheduledGames.json";

export const FETCHING_REQUESTED = "FETCHING_REQUESTED";
export const FETCHING_OK = "FETCHING_OK";

export const get_scheduled_games = () => {
    return (dispatch, getState) => {

        dispatch(fetchingStarted());
        // prepare data
        const planning = gamesData.map(scheduledGame => {
            let releaseDate = scheduledGame["releaseDate"];
            const parts = releaseDate.split("/");
            return Object.assign({}, scheduledGame, { "releaseDate": new Date(+parts[2], parts[1] -1, +parts[0]) })
        });
        dispatch(fetchingFinished(planning));
    };
};

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (planning) => ({
    type: FETCHING_OK,
    planning
});