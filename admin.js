const {
    express,
    admin,
    path,
    morgan,
    cors,
    http,
    i18n,
    // https,
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

// Apply shared configuration to admin
configureApp(admin);

var ADMIN_PORT = process.env.ADMIN_PORT || 1400;

const server_admin = http.createServer(admin);

// const server_admin = https.createServer(
//   {
//     key: fs.readFileSync("privkey1.pem"),
//     cert: fs.readFileSync("fullchain1.pem"),
//   },
//   admin
// );

//database file
require("./config/database");

/////////////////////////////////// Admin Routes //////////////////////////////////
admin.use("/admin_api/v1", require("./api/routes/admin/v1"));

server_admin.listen(ADMIN_PORT, () => {
    console.log(`Admin server running on port : ${ADMIN_PORT}`);
});
