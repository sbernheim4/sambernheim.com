export default function (templateConfig) {
	const { title } = templateConfig.htmlWebpackPlugin.options;

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>${title}</title>
                <base href="http://localhost:3000">

                <!-- Google Fonts -->
                <link href="https://fonts.googleapis.com/css?family=Lato:300,400" rel="stylesheet preload" as="style">

                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge">

                <!-- Mobile Friendly Tag -->
                <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">

                <!-- Theme Color -->
                <meta name="theme-color" content="#346CA1">
            </head>

            <body>

                <noscript>
                    <h1>Please Enable JS in your browser in order to continue</h1>
                </noscript>

                <div id='root'></div>
                <script src='./main.js'></script>
            </body>
        </html>
    `;
}
