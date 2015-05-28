var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    LOGOUT: null,
    RECEIVE_LOGIN_TOKEN: null,

    // not in use
    RECEIVE_TOURNAMENT_INDEX: null,
    RECEIVE_TOURNAMENT_DATA: null,
    SUBMIT_GAME: null,
    SEED_OPPONENT: null,
    CREATE_TOURNAMENT: null,
    EDIT_TOURNAMENT: null,
    EDIT_USER: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};