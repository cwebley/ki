var React = require('react'),
	Header = require('./header'),
	TournamentData = require('./tournament-data');

var App =
  React.createClass({
    render:function(){
      return  (
        <div className="container">
          <Header />
          <TournamentData />
        </div>
        )
    }
  });
module.exports = App;
