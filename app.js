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

// Apply shared configuration to app
configureApp(app);

var APP_PORT = process.env.APP_PORT || 4430;

const server = http.createServer(app);

// const server = https.createServer(
//     {
//         key: fs.readFileSync("privkey1.pem"),
//         cert: fs.readFileSync("fullchain1.pem"),
//     },
//     app
// );

//database file
require("./config/database");

/////////////////////////////////// App Routes ////////////////////////////////////
/////////////////////////////////// V1 ///////////////////////////////////
app.use("/app_api/v1", require("./api/routes/app/v1"));

const { multiNotificationSend } = require("./utils/send_notifications");

app.post("/send_noti", async () => {
    try {
        let notiData = {};
        var device_token_array = ["cP-TUM5ISreqqLmln5YPh5:APA91bGS6feubR4W8z39ap_-V25Kbxud_uQAol-Y7G7o0RU6rRkwBxx0zAFIb3DUVLY-QEQU_dWsmIn8DVpKdHOeVDrTcchpR5b0iHN3RiW6jI_Ji3gTIJs"];

        notiData = {
            noti_msg: "Good evening",
            noti_title: "Jigo",
            noti_for: "test",
            // id: findMajlis._id,
            sound_name: "default",
        };

        if (device_token_array.length > 0) {
            notiData = { ...notiData, device_token: device_token_array };

            await multiNotificationSend(notiData);
        }
    } catch (error) {
        console.log({ error });
    }
});

server.listen(APP_PORT, () => {
    console.log(`App server running on port : ${APP_PORT}`);
});