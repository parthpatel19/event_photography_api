const {
    express,
    app,
    path,
    morgan,
    cors,
    http,
    // https,
    i18n,
} = require("./utils/modules");

const configureApp = (server) => {
    i18n.configure({
        locales: ["en"],
        directory: path.join(__dirname, "./localization"),
        defaultLocale: "en",
        objectNotation: true,
    });

    server.use(i18n.init);

    // configuration of cors
    server.use(
        cors({
            origin: "*",
            credentials: true,
        })
    );

    //json and urlencoded
    server.use(express.json());
    server.use(express.urlencoded({ limit: "200mb", extended: true }));

    // generate custom token
    morgan.token("host", function (req) {
        return req.hostname;
    });

    server.use(
        morgan(":method :host :url :status :res[content-length] - :response-time ms")
    );

    server.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        next();
    });
};

// Apply shared configuration to both app and admin
configureApp(app);

var SOCKET_PORT = process.env.SOCKET_PORT || 4460;

const server_socket = http.createServer(app);

// const server_socket = https.createServer(
//   {
//     key: fs.readFileSync("privkey1.pem"),
//     cert: fs.readFileSync("fullchain1.pem"),
//   },
//   socket
// );

//database file
require("./config/database");

/////////////////////////////////// Socket Routes /////////////////////////////////
var socketio = require("socket.io")(server_socket);
require("./socket/v1")(socketio);

server_socket.listen(SOCKET_PORT, () => {
    console.log(`Socket server running on port : ${SOCKET_PORT}`);
});
