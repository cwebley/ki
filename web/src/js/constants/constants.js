var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    LOGOUT: null,
    LOGIN: null,
    SUBMIT_GAME: null,
    GET_TOURNAMENT_INDEX: null,
    GET_TOURNAMENT_DATA: null,
    FOCUS_TOURNAMENT: null,
    GET_PREVIOUS_SEEDS: null,
    SUBMIT_SEEDS: null,
    CREATE_TOURNAMENT: null,
    DELETE_TOURNAMENT: null,
    GET_INSPECT: null,
    POST_INSPECT: null,
    UNDO_LAST: null,
    USE_ODDSMAKER: null,
    USE_REMATCH: null,
    ADJUST_OPPONENT_POINTS: null,

    // not in use
    EDIT_TOURNAMENT: null,
    EDIT_USER: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })

};