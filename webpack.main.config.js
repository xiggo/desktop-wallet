const path = require("path");

module.exports = {
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [
								["@babel/preset-env", { targets: { node: "current" } }],
								"@babel/preset-typescript",
							],
							plugins: ["@babel/plugin-proposal-class-properties"],
						},
					},
				],
			},
		],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		extensions: [".js", ".ts"],
	},
};
