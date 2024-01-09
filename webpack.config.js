const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        content: './src/content/content.ts',
        popup: './src/popup/popup.ts',
        background: './src/background/background.ts'
    },
    output: {
        path: path.resolve(__dirname, 'plugin', 'scripts'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            },
            {
                test: /\.less$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "less-loader",

                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "../css/[name].css",
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "src/popup/html",
                    to: "../html/",
                },
                {
                    from: "src/images",
                    to: "../images/",
                },
                {
                    from: "src/manifest.json",
                    to: "../",
                },
                {
                    from: "src/popup/fontawesome",
                    to: "../fontawesome/",
                }
            ],
        }),
    ],
    mode: 'development', // 'production',
    devtool : 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    }
};
