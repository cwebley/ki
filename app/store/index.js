import { combineReducers } from 'redux';
import forms from './forms';
import me from './me';
import characters from './characters';

export default combineReducers({
	me,
	forms,
	characters,
});
