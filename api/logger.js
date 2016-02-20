import Loggerr from 'loggerr';
import cliFormatter from 'loggerr/formatters/cli';

export default new Loggerr({
    formatter: cliFormatter
});
