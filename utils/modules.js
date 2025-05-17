const express = require("express");
const app_router = require("express").Router();
const admin_router = require("express").Router();
const app = express();
const admin = express();
const socket = express();
const dotenv = require("dotenv").config();
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const i18n = require("i18n");
const https = require("https");
const fs = require("fs");
const cron = require("node-cron");
const moment = require('moment');
const momenttimezone = require('moment-timezone');
const axios = require("axios");
const googleapis = require("googleapis");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ip = require("ip");
const jwt = require("jsonwebtoken");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const mongoose = require("mongoose");
const joi = require("joi");
const util = require("util");
const multer = require("multer");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const PassThrough = require('stream');
const firebase_admin = require("firebase-admin");
const { S3Client, PutObjectCommand, DeleteObjectsCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { faker } = require('@faker-js/faker');
const uuidv4 = require('uuid');
const AWS = require('aws-sdk');

module.exports = {
    express,
    app_router,
    admin_router,
    app,
    admin,
    socket,
    dotenv,
    path,
    morgan,
    cors,
    http,
    i18n,
    https,
    fs,
    cron,
    moment,
    momenttimezone,
    axios,
    googleapis,
    bcrypt,
    crypto,
    nodemailer,
    ip,
    jwt,
    multipart,
    multipartMiddleware,
    mongoose,
    joi,
    util,
    multer,
    ffmpeg,
    firebase_admin,
    PassThrough,
    S3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    faker,
    uuidv4,
    AWS
}