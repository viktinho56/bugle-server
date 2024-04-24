const express = require("express");
const auth = require("../routes/auth");
const users = require("../routes/users");
const conversations = require("../routes/conversations");
const messages = require("../routes/messages");
const posts = require("../routes/posts");
const mobilePosts = require("../routes/mobilePosts");
const postsAnalysis = require("../routes/postsAnalysis");
const postsComments = require("../routes/postsComments");
const postsLikes = require("../routes/postsLikes");
const postsViews = require("../routes/postsViews");
const postsMedia = require("../routes/postsMedia");
const events = require("../routes/events");
const email = require("../routes/email");
const upload = require("../routes/upload");

const error = require("../middleware/error");
module.exports = function (app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/posts", posts);
  app.use("/api/mobile_posts", mobilePosts);
  app.use("/api/posts_analysis", postsAnalysis);
  app.use("/api/posts_comments", postsComments);
  app.use("/api/posts_likes", postsLikes);
  app.use("/api/posts_views", postsViews);
  app.use("/api/posts_media", postsMedia);
  app.use("/api/conversations", conversations);
  app.use("/api/messages", messages);
  app.use("/api/email", email);
  app.use("/api/events", events);
  app.use("/api/upload", upload);
  app.use(error);
};
