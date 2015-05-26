var React = require('react'),
    Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

var App =
  React.createClass({
    contextTypes: {
      router: React.PropTypes.func.isRequired
    },

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
                           WELCOME KID
                        </li>
                    </ul>

                </header>

              <RouteHandler/>
            </div>
        );
    }
});

module.exports = App;