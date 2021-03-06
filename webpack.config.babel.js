import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
	template: path.join(__dirname, 'app', 'index.html'),
	inject: 'body'
});

const PATHS = {
	app: path.join(__dirname, 'app'),
	build: path.join(__dirname, 'dist')
};

const LAUNCH_COMMAND = process.env.npm_lifecycle_event;
const isProduction = LAUNCH_COMMAND === 'production';
process.env.BABEL_ENV = LAUNCH_COMMAND;

const productionPlugin = new webpack.DefinePlugin({
	'process.env': {
		NODE_ENV: JSON.stringify('production')
	}
});

const base = {
	entry: [
		PATHS.app
	],
	output: {
		path: PATHS.build,
		filename: '/index_bundle.js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel'
		}, {
			test: /\.css$/,
			loader: 'style!css?sourceMap&modules&localIdentName=[name]__[local]___[hash:base64:5]'
		}]
	}
};

const developmentConfig = {
	devtool: 'cheap-module-inline-source-map',
	plugins: [HtmlWebpackPluginConfig, new webpack.HotModuleReplacementPlugin()],
	devServer: {
		contentBase: PATHS.build,
		hot: true,
		inline: true,
		port: 5000,
		progress: true,
		proxy: {
			'/': {
				target: 'http://localhost:3000',
				secure: false
			}
		}
	}
};

const productionConfig = {
	devtool: 'cheap-module-source-map',
	plugins: [
		HtmlWebpackPluginConfig,
		productionPlugin,
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			minimize: true,
			compress: {
				warnings: false
			}
		})
	]
};

export default Object.assign({}, base,
	isProduction ? productionConfig : developmentConfig
);
