var path = require('path')
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = {
    context: __dirname,
    entry: {
        home: './components/home/index',
    },
    output: {
        path: path.resolve('./static/bundles/'),
        filename: "[name]-[hash].js"
    },
    plugins: [
        new BundleTracker({path: __dirname, filename: './webpack-stats.json'}),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react']
                }
            },
        ]
    },
    resolve: {
        modules: ['node_modules'],
            extensions: ['.js', '.jsx']
    },
}