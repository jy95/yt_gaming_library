import React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import i18n from 'i18next';

// Dark mode
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

// Redux action
import {setThemeColor} from "../actions/themeColor";

// languages
import {frFR, enUS} from '@material-ui/core/locale';

// Components
import Header from "./Home/Header";
import Menu from "./Home/Menu"
import Player from "./YTPlayer/Player";
import GamesGallery from "./GamesView/GamesGallery";
import Planning from "./Planning/Planning";
import TestsGallery from "./Tests/TestsGallery";
import LatestVideosGallery from "./LatestVideos/LatestVideosGallery";

import Grid from '@material-ui/core/Grid';
import basicStyle from "./Home/styles"

// Languages for Material UI
const materialUI_languages = {
    fr: frFR,
    en: enUS
}

function Root(props) {

    const classes = basicStyle();
    const { store, setThemeColor, themeSettings} = props;
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const systemColor = prefersDarkMode ? "dark" : "light";
    const currentLanguage = i18n.language;

    // for drawer
    const [open, setOpen] = React.useState(false);

    // Two case handled here :
    // 1) When user comes to the site and have different color that default
    // 2) When user changes on the fly its preferred system color
    React.useEffect(() => {
        if (themeSettings.systemColor !== systemColor) {
            setThemeColor({color: systemColor, mode: "auto"});
        }
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [themeSettings.systemColor, systemColor]
    );

    // Prepare theme for possible darkmode
    const theme = React.useMemo(
        () =>
          createMuiTheme({
            palette: {
              type: themeSettings.currentColor,
            },
          }, materialUI_languages[currentLanguage]),
        [currentLanguage, themeSettings.currentColor],
      );

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Provider store={store}>
                    {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                    <Router basename={process.env.PUBLIC_URL} >
                        <Header drawerOpen={open} setdrawerOpen={setOpen} classes={classes}/>
                        <Menu open={open} setOpen={setOpen} classes={classes}/>
                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            <Grid container>
                                <Route exact path="/" render={() => <Redirect to="/games" />}/>
                                <Route path="/games" component={GamesGallery} />
                                <Route path="/playlist/:id" component={Player} />
                                <Route path="/video/:id" component={Player} />
                                <Route path="/planning" component={Planning} />
                                <Route path="/tests" component={TestsGallery} />
                                <Route path="/latest" component={LatestVideosGallery} />
                            </Grid>
                        </main>
                    </Router>
                </Provider>
            </div>
        </ThemeProvider>
    )
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    themeSettings: state.themeColor
});

const mapDispatchToProps = {
    setThemeColor
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Root);