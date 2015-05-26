var React = require('react'),
    AboutPage = require('../pages/about'),
    TourneyPage = require('../pages/tournaments'),
    StatsPage = require('../pages/stats'),
    FaqPage = require('../pages/faq'),
    Router = require('react-router'),
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler;

var App =
  React.createClass({
    // getInitialState:function(){
    //     return {
    //         loggedIn: this.props.loggedIn
    //     };
    // },
    render:function(){
        return (
            <div>
                <header>
                    <ul>
                        <li><Link to="about">Home</Link></li>
                        <li><Link to="tournaments">Tournaments</Link></li>
                        <li><Link to="stats">Stats</Link></li>
                        <li><Link to="faq">FAQ</Link></li>
                        <li>
                            {this.state.loggedIn ? (<Link to="logout">Log Out</Link>) : (<Link to="login">Sign In</Link>)}
                        </li>
                    </ul>

                </header>

              <RouteHandler/>
            </div>
        );
    }
});

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="about" handler={AboutPage}/>
        <Route name="stats" handler={StatsPage}/>
        <Route name="tournaments" handler={TourneyPage}/>
        <Route name="faq" handler={FaqPage}/>
        <DefaultRoute handler={AboutPage}/>
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body)
});

module.exports = App;